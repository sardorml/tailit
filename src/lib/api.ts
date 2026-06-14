/** Client-side fetch helpers. Throw Error(message) on non-2xx for easy try/catch. */

export async function postJSON<T>(url: string, body: unknown, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export async function postForm<T>(url: string, form: FormData): Promise<T> {
  const res = await fetch(url, { method: "POST", body: form });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}
