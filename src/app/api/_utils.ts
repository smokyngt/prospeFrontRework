import { NextResponse } from 'next/server';

import type { ZodError } from 'zod';

type ApiFieldError = {
  field: string;
  message: string;
};

type JsonBodyResult = { data: unknown; ok: true } | { ok: false; response: NextResponse };

type UpstreamJsonResult = { data: unknown; ok: true } | { ok: false; response: NextResponse };

export function apiError(
  code: string,
  message: string,
  status: number,
  fields: ApiFieldError[] = [],
) {
  return NextResponse.json(
    {
      error: {
        code,
        fields,
        message,
      },
      errors: fields,
      success: false,
    },
    { status },
  );
}

export function zodFieldErrors(error: ZodError): ApiFieldError[] {
  return error.issues.map((issue) => ({
    field: issue.path.join('.') || 'body',
    message: issue.message,
  }));
}

export async function readJsonBody(
  request: Request,
  options: { maxBytes: number },
): Promise<JsonBodyResult> {
  const contentLength = Number(request.headers.get('content-length') ?? 0);

  if (contentLength > options.maxBytes) {
    return {
      ok: false,
      response: apiError(
        'request.too_large',
        `Request body must be ${options.maxBytes} bytes or less.`,
        413,
      ),
    };
  }

  const text = await request.text();
  const size = new TextEncoder().encode(text).length;

  if (size > options.maxBytes) {
    return {
      ok: false,
      response: apiError(
        'request.too_large',
        `Request body must be ${options.maxBytes} bytes or less.`,
        413,
      ),
    };
  }

  if (!text.trim()) {
    return {
      ok: false,
      response: apiError('request.empty', 'Request body is required.', 400),
    };
  }

  try {
    return { data: JSON.parse(text), ok: true };
  } catch {
    return {
      ok: false,
      response: apiError('request.invalid_json', 'Request body must be valid JSON.', 400),
    };
  }
}

export async function readUpstreamJson(
  response: Response,
  options: { code: string; maxBytes: number },
): Promise<UpstreamJsonResult> {
  const contentLength = Number(response.headers.get('content-length') ?? 0);

  if (contentLength > options.maxBytes) {
    return {
      ok: false,
      response: apiError(options.code, 'Upstream response exceeded the allowed size.', 502),
    };
  }

  const text = await response.text();
  const size = new TextEncoder().encode(text).length;

  if (size > options.maxBytes) {
    return {
      ok: false,
      response: apiError(options.code, 'Upstream response exceeded the allowed size.', 502),
    };
  }

  if (!text.trim()) {
    return { data: {}, ok: true };
  }

  try {
    return { data: JSON.parse(text), ok: true };
  } catch {
    return {
      ok: false,
      response: apiError(options.code, 'Upstream response was not valid JSON.', 502),
    };
  }
}

export function cleanText(value: string): string {
  return Array.from(value.replace(/[<>]/g, ''))
    .filter((char) => {
      const code = char.charCodeAt(0);
      return code > 31 && code !== 127;
    })
    .join('')
    .trim();
}
