export class WorkspaceAuthConfigError extends Error {}
export class WorkspaceAuthUpstreamError extends Error {}

const TOKEN_FETCH_ATTEMPTS = 3;
const TOKEN_RETRY_DELAY_MS = 400;

let cachedToken: { expiresAt: number; token: string } | null = null;

export const accessToken = {
  async get(): Promise<string> {
    if (cachedToken && Date.now() < cachedToken.expiresAt) {
      return cachedToken.token;
    }

    const clientId = process.env.LANDING_OAUTH_CLIENT_ID;
    const clientSecret = process.env.LANDING_OAUTH_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new WorkspaceAuthConfigError(
        'LANDING_OAUTH_CLIENT_ID and LANDING_OAUTH_CLIENT_SECRET must be configured',
      );
    }

    const url = process.env.WORKSPACE_API_URL?.replace(/\/+$/, '');

    if (!url) {
      throw new WorkspaceAuthConfigError('WORKSPACE_API_URL is not configured');
    }

    const baseUrl = url.endsWith('/v1') ? url.slice(0, -3) : url;

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const request = () =>
      fetch(`${baseUrl}/oauth/token`, {
        body: JSON.stringify({
          grant_type: 'client_credentials',
          scope: 'blog:read jobs:read users:read meetings:read meetings:write',
        }),
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });

    let response: Response | null = null;
    let lastFailure = '';

    for (let attempt = 0; attempt < TOKEN_FETCH_ATTEMPTS; attempt += 1) {
      if (attempt > 0) {
        await new Promise((resolve) => setTimeout(resolve, TOKEN_RETRY_DELAY_MS * attempt));
      }

      try {
        const candidate = await request();

        if (candidate.ok) {
          response = candidate;
          break;
        }

        lastFailure = `status ${candidate.status}`;

        if (candidate.status < 500 && candidate.status !== 429) {
          break;
        }
      } catch (error) {
        lastFailure = error instanceof Error ? error.message : String(error);
      }
    }

    if (!response) {
      throw new WorkspaceAuthUpstreamError(`Failed to obtain OAuth access token: ${lastFailure}`);
    }

    const data = (await response.json()) as {
      access_token: string;
      expires_in: number;
    };
    const expiresInMs = (data.expires_in - 60) * 1000;

    cachedToken = {
      expiresAt: Date.now() + expiresInMs,
      token: data.access_token,
    };

    return data.access_token;
  },
};
