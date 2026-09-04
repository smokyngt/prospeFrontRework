import { NextResponse } from 'next/server';

import { accessToken, WorkspaceAuthConfigError } from '@/lib/workspace-auth';

import { response } from '../../../utils';

const CACHE_CONTROL = 'public, max-age=300, stale-while-revalidate=3600';
const ID_PATTERN = /^[a-zA-Z0-9-]{1,64}$/;

function imageType(bytes: Uint8Array, upstream: null | string): string {
  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    return 'image/jpeg';
  }

  if (bytes[0] === 0x89 && bytes[1] === 0x50) {
    return 'image/png';
  }

  if (bytes[0] === 0x47 && bytes[1] === 0x49) {
    return 'image/gif';
  }

  if (bytes[8] === 0x57 && bytes[9] === 0x45) {
    return 'image/webp';
  }

  return upstream && upstream !== 'image/*' ? upstream : 'image/jpeg';
}

function workspaceUrl(id: string, version: null | string): null | string {
  const base = process.env.WORKSPACE_API_URL?.replace(/\/+$/, '');

  if (!base) {
    return null;
  }

  const origin = base.endsWith('/v1') ? base.slice(0, -3) : base;
  const query = version ? `?v=${encodeURIComponent(version)}` : '';

  return `${origin}/v1/uploads/pfp/user/${id}/view${query}`;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await context.params;

  if (!ID_PATTERN.test(id)) {
    return response.error('avatar.invalid-id', 'Invalid avatar id.', 400);
  }

  const url = workspaceUrl(id, new URL(request.url).searchParams.get('v'));

  if (!url) {
    return response.error('avatar.not-configured', 'Workspace API URL is not configured.', 500);
  }

  let token: string;

  try {
    token = await accessToken.get();
  } catch (error) {
    if (error instanceof WorkspaceAuthConfigError) {
      return response.error('avatar.not-configured', 'OAuth client is not configured.', 500);
    }

    return response.error('avatar.upstream-unavailable', 'Workspace API is unavailable.', 503);
  }

  let upstreamResponse: Response;

  try {
    upstreamResponse = await fetch(url, {
      cache: 'no-store',
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    return response.error(
      'avatar.upstream-unavailable',
      'Workspace API could not be reached.',
      503,
    );
  }

  if (!upstreamResponse.ok || !upstreamResponse.body) {
    return response.error('avatar.not-found', 'Avatar not found.', 404);
  }

  const bytes = new Uint8Array(await upstreamResponse.arrayBuffer());

  return new NextResponse(bytes, {
    headers: {
      'Cache-Control': CACHE_CONTROL,
      'Content-Type': imageType(bytes, upstreamResponse.headers.get('content-type')),
    },
    status: 200,
  });
}
