import { NextResponse } from 'next/server';
import { z } from 'zod';

import { accessToken } from '@/lib/workspace-auth';

import { request, response, upstream, validation } from '../../../utils';

export const dynamic = 'force-dynamic';
const CALENDAR_BODY_LIMIT_BYTES = 8 * 1024;
const CALENDAR_RESPONSE_LIMIT_BYTES = 128 * 1024;
const availabilitySchema = z
  .object({
    end: z.string().datetime('End must be a valid ISO date'),
    start: z.string().datetime('Start must be a valid ISO date'),
    timezone: z.string().trim().min(1).max(64).default('Europe/Paris'),
  })
  .refine((value) => new Date(value.start) < new Date(value.end), {
    message: 'Start must be before end',
    path: ['start'],
  })
  .refine(
    (value) =>
      new Date(value.end).getTime() - new Date(value.start).getTime() <= 14 * 24 * 60 * 60 * 1000,
    { message: 'Date range must be 14 days or less', path: ['end'] },
  );

function workspaceUrl(path: string): string | null {
  const base = process.env.WORKSPACE_API_URL?.replace(/\/+$/, '');

  if (!base) {
    return null;
  }

  return base.endsWith('/v1') ? `${base}${path}` : `${base}/v1${path}`;
}

export const POST = async (req: Request) => {
  const url = workspaceUrl('/calendar/availability');
  const body = await request.readJson(req, {
    maxBytes: CALENDAR_BODY_LIMIT_BYTES,
  });

  if (!body.ok) {
    return body.response;
  }

  const parsed = availabilitySchema.safeParse(body.data);

  if (!parsed.success) {
    return response.error(
      'calendar.availability.validation-failed',
      'Calendar availability request is invalid.',
      400,
      validation.fieldErrors(parsed.error),
    );
  }

  if (!url) {
    return NextResponse.json({
      data: { busy: [] },
      meta: { configured: false },
    });
  }

  let token: string;
  try {
    token = await accessToken.get();
  } catch {
    return NextResponse.json({
      data: { busy: [] },
      meta: { configured: false },
    });
  }

  try {
    const upstreamRes = await fetch(url, {
      body: JSON.stringify(parsed.data),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      method: 'POST',
    });
    const upstreamData = await upstream.readJson(upstreamRes, {
      code: 'calendar.availability.invalid-upstream-response',
      maxBytes: CALENDAR_RESPONSE_LIMIT_BYTES,
    });

    if (!upstreamData.ok) {
      return upstreamData.response;
    }

    return NextResponse.json(upstreamData.data, { status: upstreamRes.status });
  } catch {
    return NextResponse.json({
      data: { busy: [] },
      meta: { status: 'unreachable' },
    });
  }
};
