import { NextResponse } from 'next/server';
import { z } from 'zod';

import { accessToken, WorkspaceAuthConfigError } from '@/lib/workspace-auth';

import { request, response, text, upstream, validation } from '../../../utils';

export const dynamic = 'force-dynamic';
const CALENDAR_EVENT_BODY_LIMIT_BYTES = 16 * 1024;
const CALENDAR_EVENT_RESPONSE_LIMIT_BYTES = 128 * 1024;
const calendarEventSchema = z
  .object({
    attendees: z.array(z.string().email()).min(1).max(5),
    company: z.string().trim().min(1).max(80),
    description: z.string().trim().min(1).max(1500),
    email: z.string().trim().email().max(120),
    end: z.string().datetime('End must be a valid ISO date'),
    locale: z.enum(['en', 'fr']).default('fr'),
    name: z.string().trim().min(1).max(60),
    start: z.string().datetime('Start must be a valid ISO date'),
    summary: z.string().trim().min(1).max(140),
    timezone: z.string().trim().min(1).max(64).default('Europe/Paris'),
  })
  .refine((value) => new Date(value.start) < new Date(value.end), {
    message: 'Start must be before end',
    path: ['start'],
  })
  .refine(
    (value) => new Date(value.end).getTime() - new Date(value.start).getTime() <= 60 * 60 * 1000,
    { message: 'Meeting duration must be 60 minutes or less', path: ['end'] },
  );

function workspaceUrl(path: string): string | null {
  const base = process.env.WORKSPACE_API_URL?.replace(/\/+$/, '');

  if (!base) {
    return null;
  }

  return base.endsWith('/v1') ? `${base}${path}` : `${base}/v1${path}`;
}

export const POST = async (req: Request) => {
  const url = workspaceUrl('/calendar/public-events');
  const body = await request.readJson(req, {
    maxBytes: CALENDAR_EVENT_BODY_LIMIT_BYTES,
  });

  if (!body.ok) {
    return body.response;
  }

  const parsed = calendarEventSchema.safeParse(body.data);

  if (!parsed.success) {
    return response.error(
      'calendar.event.validation-failed',
      'Calendar event request is invalid.',
      400,
      validation.fieldErrors(parsed.error),
    );
  }

  if (!url) {
    return response.error(
      'proxy.unconfigured',
      'Workspace calendar integration is not configured.',
      503,
    );
  }

  let token: string;
  try {
    token = await accessToken.get();
  } catch (error) {
    if (error instanceof WorkspaceAuthConfigError) {
      return response.error('proxy.unconfigured', 'OAuth client is not configured.', 500);
    }

    return response.error(
      'proxy.upstream-unavailable',
      'Workspace API is unavailable, could not obtain an access token.',
      503,
    );
  }

  try {
    const payload = {
      ...parsed.data,
      company: text.clean(parsed.data.company),
      description: text.clean(parsed.data.description),
      email: text.clean(parsed.data.email).toLowerCase(),
      name: text.clean(parsed.data.name),
      summary: text.clean(parsed.data.summary),
    };

    const upstreamRes = await fetch(url, {
      body: JSON.stringify(payload),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      method: 'POST',
    });
    const upstreamData = await upstream.readJson(upstreamRes, {
      code: 'calendar.event.invalid-upstream-response',
      maxBytes: CALENDAR_EVENT_RESPONSE_LIMIT_BYTES,
    });

    if (!upstreamData.ok) {
      return upstreamData.response;
    }

    return NextResponse.json(upstreamData.data, { status: upstreamRes.status });
  } catch {
    return response.error('proxy.unreachable', 'Workspace calendar API is unreachable.', 503);
  }
};
