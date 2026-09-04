import { NextResponse } from 'next/server';
import { z } from 'zod';

import { accessToken } from '@/lib/workspace-auth';

import { request, response, text } from '../utils';

const CONTACT_BODY_LIMIT_BYTES = 16 * 1024;
const RATE_LIMIT_MAX_REQUESTS = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const contactSchema = z.object({
  company: z.string().trim().min(1, 'Company is required').max(80),
  email: z.string().trim().email('A valid email is required').max(120),
  marketingConsent: z.boolean().optional().default(false),
  message: z
    .string()
    .trim()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be 1000 characters or less'),
  name: z.string().trim().min(1, 'Name is required').max(60),
  phone: z.string().trim().max(30).optional().default(''),
  subject: z.enum(['information', 'partnership', 'other', 'api', 'virtual-partner'], {
    message: 'Subject is required',
  }),
});

const submissionTimestamps = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;

  if (submissionTimestamps.size > 10_000) {
    for (const [key, timestamps] of submissionTimestamps) {
      const live = timestamps.filter((timestamp) => timestamp > windowStart);
      if (live.length === 0) {
        submissionTimestamps.delete(key);
      } else {
        submissionTimestamps.set(key, live);
      }
    }
  }

  const hits = (submissionTimestamps.get(ip) ?? []).filter((timestamp) => timestamp > windowStart);

  if (hits.length >= RATE_LIMIT_MAX_REQUESTS) {
    submissionTimestamps.set(ip, hits);
    return true;
  }

  hits.push(now);
  submissionTimestamps.set(ip, hits);
  return false;
}

function clientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

export const POST = async (req: Request) => {
  if (isRateLimited(clientIp(req))) {
    return response.error('rate-limit.exceeded', 'Too many requests. Please try again later.', 429);
  }

  const body = await request.readJson(req, {
    maxBytes: CONTACT_BODY_LIMIT_BYTES,
  });

  if (!body.ok) {
    return body.response;
  }

  const parsed = contactSchema.safeParse(body.data);

  if (!parsed.success) {
    return response.error('contact.validation-failed', 'Please fix the highlighted fields.', 400);
  }

  const contact = {
    company: text.clean(parsed.data.company),
    email: text.clean(parsed.data.email).toLowerCase(),
    marketingConsent: parsed.data.marketingConsent,
    message: text.clean(parsed.data.message),
    name: text.clean(parsed.data.name),
    phone: text.clean(parsed.data.phone),
    subject: parsed.data.subject,
  };

  const workspaceApiUrl = process.env.WORKSPACE_API_URL;

  if (workspaceApiUrl) {
    try {
      let token: string;

      try {
        token = await accessToken.get();
      } catch {
        return NextResponse.json({ success: true });
      }

      const upstreamRes = await fetch(`${workspaceApiUrl}/contact`, {
        body: JSON.stringify(contact),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        method: 'POST',
      });

      if (!upstreamRes.ok) {
        const errText = await upstreamRes.text().catch(() => 'unknown error');
        console.error('Contact proxy failed:', upstreamRes.status, errText);
      }
    } catch (error) {
      console.error('Contact proxy error:', error);
    }
  }

  return NextResponse.json({ success: true });
};
