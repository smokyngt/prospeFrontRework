import { NextResponse } from 'next/server';

import { accessToken, WorkspaceAuthConfigError } from '@/lib/workspace-auth';

import { response, upstream } from '../utils';

const RESPONSE_LIMIT_BYTES = 1024 * 1024;
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 100;

export type WorkspaceResource = 'jobs' | 'posts' | 'team';

const UPSTREAM_PATH: Record<WorkspaceResource, string> = {
  jobs: '/jobs',
  posts: '/posts',
  team: '/users',
};

function workspaceUrl(path: string): null | string {
  const base = process.env.WORKSPACE_API_URL?.replace(/\/+$/, '');

  if (!base) {
    return null;
  }

  return base.endsWith('/v1') ? `${base}${path}` : `${base}/v1${path}`;
}

const OPAQUE_FIELDS = new Set([
  'attributes',
  'labels',
  'metadata',
  'params',
  'parameters',
  'result',
  'schema',
]);

function convertKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => convertKeys(item));
  }

  if (
    value === null ||
    typeof value !== 'object' ||
    Object.getPrototypeOf(value) !== Object.prototype
  ) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, child]) => {
      const converted = key.replace(/_([a-z0-9])/g, (_, character: string) =>
        character.toUpperCase(),
      );

      return [
        converted,
        OPAQUE_FIELDS.has(key) || OPAQUE_FIELDS.has(converted) ? child : convertKeys(child),
      ];
    }),
  );
}

function withAvatarProxy(item: unknown): unknown {
  if (item === null || typeof item !== 'object') {
    return item;
  }

  const record = item as Record<string, unknown>;
  const avatarUrl = record.avatarUrl;

  if (
    typeof avatarUrl !== 'string' ||
    typeof record.id !== 'string' ||
    !avatarUrl.startsWith('/v1/')
  ) {
    return record;
  }

  const version = avatarUrl.split('?v=')[1];

  return {
    ...record,
    avatarUrl: `/api/workspace/avatar/${record.id}${version ? `?v=${version}` : ''}`,
  };
}

export function readPageParams(url: string): { limit: number; page: number } {
  const params = new URL(url).searchParams;
  const rawPage = Number.parseInt(params.get('page') ?? '1', 10);
  const rawLimit = Number.parseInt(params.get('limit') ?? String(DEFAULT_LIMIT), 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const limit =
    Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, MAX_LIMIT) : DEFAULT_LIMIT;

  return { limit, page };
}

/**
 * The workspace public endpoints return the full collection, so the page slice
 * is applied here. When they gain `page`/`limit` this becomes a pass-through.
 */
export async function fetchResource(
  resource: WorkspaceResource,
  requestUrl: string,
): Promise<NextResponse> {
  const url = workspaceUrl(UPSTREAM_PATH[resource]);

  if (!url) {
    return response.error(
      `${resource}.not-configured`,
      'Workspace API URL is not configured.',
      500,
    );
  }

  let token: string;

  try {
    token = await accessToken.get();
  } catch (error) {
    if (error instanceof WorkspaceAuthConfigError) {
      return response.error(`${resource}.not-configured`, 'OAuth client is not configured.', 500);
    }

    return response.error(
      `${resource}.upstream-unavailable`,
      'Workspace API is unavailable, could not obtain an access token.',
      503,
    );
  }

  const { limit, page } = readPageParams(requestUrl);

  let upstreamResponse: Response;

  try {
    upstreamResponse = await fetch(url, {
      cache: 'no-store',
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    });
  } catch {
    return response.error(
      `${resource}.upstream-unavailable`,
      'Workspace API could not be reached.',
      503,
    );
  }

  if (upstreamResponse.status === 404) {
    return NextResponse.json({ data: { hasMore: false, items: [], limit, page, total: 0 } });
  }

  if (!upstreamResponse.ok) {
    const status =
      upstreamResponse.status === 401 || upstreamResponse.status === 403
        ? 401
        : upstreamResponse.status;

    return response.error(
      status === 401 ? `${resource}.unauthorized` : `${resource}.upstream-error`,
      status === 401
        ? 'Workspace API rejected the OAuth token.'
        : `Workspace ${resource} could not be loaded.`,
      status,
    );
  }

  const parsed = await upstream.readJson(upstreamResponse, {
    code: `${resource}.invalid-upstream-response`,
    maxBytes: RESPONSE_LIMIT_BYTES,
  });

  if (!parsed.ok) {
    return parsed.response;
  }

  const payload = parsed.data as Record<string, unknown>;
  const container = (payload.data ?? payload) as Record<string, unknown>;
  const raw = container.items ?? container[resource] ?? [];
  const items = Array.isArray(raw) ? raw : [];
  const total = typeof container.total === 'number' ? container.total : items.length;
  const start = (page - 1) * limit;
  const slice = (convertKeys(items.slice(start, start + limit)) as unknown[]).map((item) =>
    resource === 'team' ? withAvatarProxy(item) : item,
  );

  return NextResponse.json({
    data: {
      hasMore: start + slice.length < items.length,
      items: slice,
      limit,
      page,
      total,
    },
  });
}
