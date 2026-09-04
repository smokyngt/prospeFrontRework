import { NextResponse } from 'next/server';

import { accessToken, WorkspaceAuthConfigError } from '@/lib/workspace-auth';

import { response, upstream } from '../../utils';

export const dynamic = 'force-dynamic';
const WORKSPACE_CONTENT_LIMIT_BYTES = 1024 * 1024;
type WorkspaceEndpointKey = 'jobs' | 'posts' | 'team';

function workspaceUrl(path: string): string | null {
  const base = process.env.WORKSPACE_API_URL?.replace(/\/+$/, '');

  if (!base) {
    return null;
  }

  return base.endsWith('/v1') ? `${base}${path}` : `${base}/v1${path}`;
}

export const GET = async () => {
  const postsUrl = workspaceUrl('/posts');
  const jobsUrl = workspaceUrl('/jobs');
  const teamUrl = workspaceUrl('/users');

  if (!postsUrl || !jobsUrl || !teamUrl) {
    return response.error('content.not-configured', 'Workspace API URL is not configured.', 500);
  }

  let token: string;
  try {
    token = await accessToken.get();
  } catch (error) {
    if (error instanceof WorkspaceAuthConfigError) {
      return response.error('content.not-configured', 'OAuth client is not configured.', 500);
    }

    return response.error(
      'content.upstream-unavailable',
      'Workspace API is unavailable, could not obtain an access token.',
      503,
    );
  }

  try {
    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    };
    const fetchOptions = { cache: 'no-store' as const, headers };
    const [postsResponse, jobsResponse, teamResponse] = await Promise.all([
      fetch(postsUrl, fetchOptions),
      fetch(jobsUrl, fetchOptions),
      fetch(teamUrl, fetchOptions),
    ]);
    const failed = [postsResponse, jobsResponse, teamResponse].find(
      (response) => !response.ok && response.status !== 404,
    );

    if (failed) {
      const status = failed.status === 401 || failed.status === 403 ? 401 : failed.status;

      return response.error(
        status === 401 ? 'content.unauthorized' : 'content.upstream-error',
        status === 401
          ? 'Workspace API rejected the OAuth token.'
          : 'Workspace content could not be loaded.',
        status,
      );
    }

    const readItems = async (
      key: WorkspaceEndpointKey,
      res: Response,
    ): Promise<NextResponse | unknown[]> => {
      if (res.status === 404) {
        return [];
      }

      const upstreamData = await upstream.readJson(res, {
        code: 'content.invalid-upstream-response',
        maxBytes: WORKSPACE_CONTENT_LIMIT_BYTES,
      });

      if (!upstreamData.ok) {
        return upstreamData.response;
      }

      const payload = upstreamData.data as {
        data?: Partial<Record<WorkspaceEndpointKey | 'items', unknown>>;
        items?: unknown;
      } & Partial<Record<WorkspaceEndpointKey, unknown>>;
      const data = payload.data ?? payload;
      const items = data.items ?? data[key] ?? [];

      return Array.isArray(items) ? items : [];
    };
    const [postsResult, jobsResult, teamResult] = await Promise.all([
      readItems('posts', postsResponse),
      readItems('jobs', jobsResponse),
      readItems('team', teamResponse),
    ]);

    if (postsResult instanceof NextResponse) {
      return postsResult;
    }

    if (jobsResult instanceof NextResponse) {
      return jobsResult;
    }

    if (teamResult instanceof NextResponse) {
      return teamResult;
    }

    const normalizedPosts = postsResult;
    const normalizedJobs = jobsResult;
    const normalizedTeam = teamResult;

    return NextResponse.json({
      data: {
        posts: normalizedPosts,
        jobs: normalizedJobs,
        team: normalizedTeam,
      },
      meta: {
        count: normalizedPosts.length + normalizedJobs.length + normalizedTeam.length,
        status:
          normalizedPosts.length || normalizedJobs.length || normalizedTeam.length
            ? 'ok'
            : 'no_results',
      },
    });
  } catch {
    return response.error('content.unreachable', 'Workspace API is unreachable.', 502);
  }
};
