/**
 * api.js — Centralised fetch wrapper.
 * - Attaches Authorization header automatically from localStorage
 * - On 401, silently refreshes the access token once via httpOnly cookie
 * - On refresh failure, clears session and redirects to /login
 * - Queues concurrent 401s so only ONE refresh call fires
 *
 * In development the Vite proxy forwards /api/* → http://localhost:5000
 * so no CORS issues and no need to hardcode the backend URL.
 */

const API_BASE = import.meta.env.VITE_API_URL || "";

let isRefreshing = false;
let queue = [];

const flushQueue = (token) => { queue.forEach(({ resolve }) => resolve(token)); queue = []; };

const clearSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
};

export async function apiFetch(path, options = {}, _retry = false) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",                    // sends httpOnly refresh cookie
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (res.status === 401 && !_retry) {
    if (isRefreshing) {
      return new Promise((resolve) =>
        queue.push({
          resolve: (t) =>
            resolve(apiFetch(path, {
              ...options,
              headers: { ...options.headers, Authorization: `Bearer ${t}` },
            }, true)),
        })
      );
    }

    isRefreshing = true;
    try {
      const r = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (!r.ok) throw new Error("refresh failed");
      const { token: newToken } = await r.json();
      localStorage.setItem("token", newToken);
      flushQueue(newToken);
      return apiFetch(path, options, true);
    } catch {
      clearSession();
      return Promise.reject(new Error("Session expired. Please sign in again."));
    } finally {
      isRefreshing = false;
    }
  }

  return res;
}

export const apiGet  = (path)       => apiFetch(path, { method: "GET" });
export const apiPost = (path, body) => apiFetch(path, { method: "POST", body: JSON.stringify(body) });