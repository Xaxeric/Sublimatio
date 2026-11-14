/**
 * Sublimatio Frontend API Service for NestJS Backend
 * Handles CRUD operations against the http://localhost:3000/payloads REST endpoints.
 */

const API_BASE = "http://localhost:3000/payloads";

/**
 * Fetch all active payloads from NestJS backend buffer
 */
export async function fetchPayloadsApi() {
  const res = await fetch(API_BASE);
  if (!res.ok) {
    throw new Error(`Gagal mengambil data dari server (${res.status} ${res.statusText})`);
  }
  return res.json();
}

/**
 * Transmit / create a new payload to NestJS backend
 */
export async function createPayloadApi(payload) {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    const msg = Array.isArray(data.message)
      ? data.message.join(" | ")
      : data.message || `Gagal membuat payload (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.response = data;
    throw err;
  }
  return data;
}

/**
 * Update an existing payload on NestJS backend
 */
export async function updatePayloadApi(id, updateData) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(updateData),
  });

  const data = await res.json();
  if (!res.ok) {
    const msg = Array.isArray(data.message)
      ? data.message.join(" | ")
      : data.message || `Gagal memperbarui payload (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.response = data;
    throw err;
  }
  return data;
}

/**
 * Remove (sublimate) a payload from NestJS backend
 */
export async function deletePayloadApi(id) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
    },
  });

  const data = await res.json();
  if (!res.ok) {
    const msg = data.message || `Gagal menghapus payload (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.response = data;
    throw err;
  }
  return data;
}
