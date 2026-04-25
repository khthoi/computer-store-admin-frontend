const API_BASE = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api`;

interface ApiEnvelope<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = document.cookie
    .split("; ")
    .find((c) => c.startsWith("auth_token="))
    ?.split("=")[1];

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${decodeURIComponent(token)}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = (err as { message?: string }).message ?? `HTTP ${res.status}`;

    // JWT token expired — notify the session-expired listener
    if (res.status === 401 && message === "Unauthorized") {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("session-expired"));
      }
    }

    throw new Error(message);
  }

  // 204 No Content (e.g. logout) — no body to parse
  if (res.status === 204) return undefined as T;

  const body = (await res.json()) as ApiEnvelope<T>;
  return body.data;
}
