export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const apiUrl = (path: string) => `${API_BASE_URL}${path}`;

export const apiFetch = async (path: string, init: RequestInit = {}) => {
  const headers = new Headers(init.headers);

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(apiUrl(path), {
    ...init,
    headers,
    credentials: "include",
  });
};
