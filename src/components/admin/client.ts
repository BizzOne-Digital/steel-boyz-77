"use client";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data: Record<string, unknown> = {},
  ) {
    super(message);
  }
}

/** JSON fetch for admin APIs. Session expiry sends the admin back to login. */
export async function api<T = Record<string, unknown>>(url: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, ...rest } = init;
  const res = await fetch(url, {
    ...rest,
    headers: { ...(json !== undefined ? { "Content-Type": "application/json" } : {}), ...rest.headers },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (res.status === 401) {
    window.location.assign(new URL("/admin/login", window.location.origin));
    throw new ApiError("Session expired", 401);
  }
  if (!res.ok || data.success === false) {
    throw new ApiError(String(data.error ?? `Request failed (${res.status})`), res.status, data);
  }
  return data as T;
}

export function fmtDate(iso: string | Date | undefined | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}
