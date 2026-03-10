const BASE = "http://localhost:3002/api/v1";

async function request(method: string, path: string, body?: any, isForm = false) {
  const opts: RequestInit = {
    method,
    credentials: "include",
    headers: isForm ? undefined : { "Content-Type": "application/json" },
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  };

  const res = await fetch(`${BASE}${path}`, opts);

  if (res.status === 401) {
    const { useAuthStore } = await import("@/stores/authStore");
    useAuthStore.getState().logout();
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || `Request failed (${res.status})`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export const api = {
  get: (path: string) => request("GET", path),
  post: (path: string, body?: any) => request("POST", path, body),
  put: (path: string, body?: any) => request("PUT", path, body),
  del: (path: string) => request("DELETE", path),
  postForm: (path: string, formData: FormData) => request("POST", path, formData, true),
};
