const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function apiFetch(path: string, options: RequestInit = {}, userEmail?: string, userRole?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(userEmail ? { "x-user-email": userEmail } : {}),
    ...(userRole ? { "x-user-role": userRole } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  if (options.body instanceof FormData) {
    delete headers["Content-Type"];
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  getState: () => apiFetch("/api/state"),
  updateProfile: (data: any, email?: string, role?: string) =>
    apiFetch("/api/profile", { method: "PUT", body: JSON.stringify(data) }, email, role),
  createActivity: (data: any, email?: string) =>
    apiFetch("/api/inventory", { method: "POST", body: JSON.stringify(data) }, email),
  updateActivity: (id: number, data: any, email?: string) =>
    apiFetch(`/api/inventory/${id}`, { method: "PUT", body: JSON.stringify(data) }, email),
  deleteActivity: (id: number, email?: string) =>
    apiFetch(`/api/inventory/${id}`, { method: "DELETE" }, email),
  uploadDocument: (formData: FormData, email?: string) =>
    apiFetch("/api/documents/upload", { method: "POST", body: formData, headers: {} }, email),
  reviewDocument: (id: number, data: any, email?: string, role?: string) =>
    apiFetch(`/api/documents/${id}/review`, { method: "PATCH", body: JSON.stringify(data) }, email, role),
  patchFinding: (id: number, data: any, email?: string, role?: string) =>
    apiFetch(`/api/findings/${id}`, { method: "PATCH", body: JSON.stringify(data) }, email, role),
  createAction: (data: any, email?: string) =>
    apiFetch("/api/actions", { method: "POST", body: JSON.stringify(data) }, email),
  patchAction: (id: number, data: any, email?: string) =>
    apiFetch(`/api/actions/${id}`, { method: "PATCH", body: JSON.stringify(data) }, email),
  resetDemo: (email?: string, role?: string) =>
    apiFetch("/api/reset", { method: "POST" }, email, role),
};
