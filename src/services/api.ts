const API_BASE = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api`;

interface ApiEnvelope<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

async function getToken(): Promise<string | undefined> {
  if (typeof window === "undefined") {
    const { cookies } = await import("next/headers");
    const jar = await cookies();
    return jar.get("auth_token")?.value;
  }
  return document.cookie
    .split("; ")
    .find((c) => c.startsWith("auth_token="))
    ?.split("=")[1];
}

// Client-side only: call backend refresh endpoint, update auth_token cookie, return success
async function tryClientRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) return false;
    const body = (await res.json()) as ApiEnvelope<{ accessToken: string }>;
    const newToken = body?.data?.accessToken;
    if (!newToken) return false;
    document.cookie = `auth_token=${encodeURIComponent(newToken)}; path=/; max-age=${15 * 60}; SameSite=Lax`;
    return true;
  } catch {
    return false;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  _retry = false
): Promise<T> {
  const rawToken = await getToken();
  const token = rawToken ? decodeURIComponent(rawToken) : undefined;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = (err as { message?: string }).message ?? `HTTP ${res.status}`;

    if (res.status === 401) {
      if (typeof window === "undefined") {
        // Server-side: redirect to login — throws a special Next.js error that must propagate
        const { redirect } = await import("next/navigation");
        redirect("/login");
      }

      // Client-side: attempt token refresh once
      if (!_retry) {
        const refreshed = await tryClientRefresh();
        if (refreshed) return apiFetch<T>(path, options, true);
      }

      // Purge stale token — proxy.ts bounces /login → / if cookie still exists
      document.cookie = "auth_token=; path=/; max-age=0; SameSite=Lax";
      window.dispatchEvent(new CustomEvent("session-expired"));
    }

    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;

  const body = (await res.json()) as ApiEnvelope<T>;
  return body.data;
}
