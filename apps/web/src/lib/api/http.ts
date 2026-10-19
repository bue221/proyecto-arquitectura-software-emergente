export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export async function readApiError(res: Response): Promise<ApiError> {
  try {
    const body = (await res.json()) as { message?: string; code?: string };
    return new ApiError(
      body.message || body.code || `Request failed (${res.status})`,
      res.status,
      body.code,
    );
  } catch {
    return new ApiError(`Request failed (${res.status})`, res.status);
  }
}

function mergeHeaders(init?: RequestInit, extra?: HeadersInit): Headers {
  const headers = new Headers(init?.headers || {});
  if (extra) {
    new Headers(extra).forEach((value, key) => headers.set(key, value));
  }
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  return headers;
}

export async function getJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: mergeHeaders(init),
    cache: "no-store",
  });
  if (!res.ok) throw await readApiError(res);
  return (await res.json()) as T;
}

export async function sendJson<T>(
  url: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  body?: unknown,
  init?: RequestInit,
): Promise<T | void> {
  const headers = mergeHeaders(init, body ? { "Content-Type": "application/json" } : undefined);
  const res = await fetch(url, {
    ...init,
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw await readApiError(res);
  if (res.status === 204) return;
  return (await res.json()) as T;
}
