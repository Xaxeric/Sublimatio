/**
 * Sublimatio Frontend API Service for NestJS Backend
 * Handles authentication and CRUD operations against http://localhost:3000.
 */

const API_BASE = "http://localhost:3000";
const PAYLOADS_URL = `${API_BASE}/payloads`;

// Stable client-side auth store. The token is read on every request so a
// newly issued (or revoked) token is picked up without a page reload.
export const TOKEN_STORAGE_KEY = "sublimatio_token";
export const USER_STORAGE_KEY = "sublimatio_user";
export const UNAUTHORIZED_EVENT = "sublimatio:unauthorized";

/** Authorization header for protected payload requests. */
function authHeaders() {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Persist the session returned by POST /auth/login. */
export function storeAuth({ accessToken, user }) {
  localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user ?? null));
}

/**
 * Drop the stored session. Called on 401 from a protected endpoint and on
 * explicit logout; the event lets React sync its auth state.
 */
export function clearStoredAuth() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  }
}

export function getStoredAuth() {
  return {
    token: localStorage.getItem(TOKEN_STORAGE_KEY),
    user: readStoredUser(),
  };
}

async function readBody(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

function messageFromBody(body, fallback) {
  const message = body?.message;
  if (Array.isArray(message)) return message.join(" | ");
  if (typeof message === "string" && message) return message;
  return fallback;
}

function apiError(res, body, fallback) {
  const error = new Error(messageFromBody(body, fallback));
  error.status = res.status;
  error.response = body;
  return error;
}

/** Nest validation errors return an array of messages; flatten for the UI. */
async function postJson(url, body, fallback) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await readBody(res);
  if (!res.ok) throw apiError(res, data, fallback);
  return data;
}

/** Register a user. The backend returns the public user, not a token. */
export async function registerApi({ name, email, password }) {
  return postJson(
    `${API_BASE}/auth/register`,
    { name, email, password },
    "Gagal mendaftar (register)",
  );
}

/** Log in and receive { accessToken, user }. */
export async function loginApi({ email, password }) {
  return postJson(
    `${API_BASE}/auth/login`,
    { email, password },
    "Gagal masuk (login)",
  );
}

/** A 401 invalidates the local session and notifies the UI. */
function handleUnauthorized(res) {
  if (res.status === 401) clearStoredAuth();
}

/**
 * Fetch all active payloads from NestJS backend buffer
 */
export async function fetchPayloadsApi() {
  const res = await fetch(PAYLOADS_URL, { headers: authHeaders() });
  handleUnauthorized(res);
  if (!res.ok) {
    throw apiError(res, {}, `Gagal mengambil data dari server (${res.status} ${res.statusText})`);
  }
  return res.json();
}

/**
 * Transmit / create a new payload to NestJS backend
 */
export async function createPayloadApi(payload) {
  const res = await fetch(PAYLOADS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });

  const data = await readBody(res);
  handleUnauthorized(res);
  if (!res.ok) {
    throw apiError(res, data, `Gagal membuat payload (${res.status})`);
  }
  return data;
}

/**
 * Update an existing payload on NestJS backend
 */
export async function updatePayloadApi(id, updateData) {
  const res = await fetch(`${PAYLOADS_URL}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(updateData),
  });

  const data = await readBody(res);
  handleUnauthorized(res);
  if (!res.ok) {
    throw apiError(res, data, `Gagal memperbarui payload (${res.status})`);
  }
  return data;
}

/**
 * Remove (sublimate) a payload from NestJS backend
 */
export async function deletePayloadApi(id) {
  const res = await fetch(`${PAYLOADS_URL}/${id}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      ...authHeaders(),
    },
  });

  const data = await readBody(res);
  handleUnauthorized(res);
  if (!res.ok) {
    throw apiError(res, data, `Gagal menghapus payload (${res.status})`);
  }
  return data;
}
