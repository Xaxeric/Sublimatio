import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { toast } from "sonner";

import { INITIAL_LOGS, INITIAL_PAYLOADS } from "./data/payloads.js";
import {
  clearStoredAuth,
  createPayloadApi,
  deletePayloadApi,
  fetchPayloadsApi,
  getStoredAuth,
  storeAuth,
  updatePayloadApi,
  UNAUTHORIZED_EVENT,
} from "./api/payloads.js";
import ClientView from "./components/ClientView.jsx";
import ConnectView from "./components/ConnectView.jsx";
import DashboardView from "./components/DashboardView.jsx";
import LoginView from "./components/LoginView.jsx";
import { Toaster } from "@/components/ui/sonner";
import { tickPayloads } from "./utils/payload.js";

function ProtectedRoute({ token, children }) {
  return token ? children : <Navigate to="/" replace />;
}

const PENDING_TRANSMIT_KEY = "sublimatio_pending_transmit";

export default function App() {
  // Auth state is restored from localStorage so a reload keeps the session.
  const [token, setToken] = useState(() => getStoredAuth().token);
  const [user, setUser] = useState(() => getStoredAuth().user);

  // LoginView performs the API calls and hands back { accessToken, user }.
  const login = useCallback((session) => {
    storeAuth(session);
    setToken(session.accessToken);
    setUser(session.user ?? null);
  }, []);

  // Registration returns only the public user, so LoginView follows up with
  // loginApi and persists the resulting session through the same callback.
  const register = useCallback((session) => {
    storeAuth(session);
    setToken(session.accessToken);
    setUser(session.user ?? null);
  }, []);

  const logout = useCallback(() => {
    clearStoredAuth();
    setToken(null);
    setUser(null);
  }, []);

  // A 401 from any payload endpoint clears localStorage in the API layer;
  // mirror that into React state so protected routes redirect immediately.
  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, []);

  // Main entity state: the list of Payload objects held in the volatile buffer.
  const [payloads, setPayloads] = useState(INITIAL_PAYLOADS);
  // Sublimation history (LOG) records.
  const [logs, setLogs] = useState(INITIAL_LOGS);

  // Mirror of the payload list so callbacks and the 1s timer always read fresh data.
  const payloadsRef = useRef(payloads);
  useEffect(() => {
    payloadsRef.current = payloads;
  }, [payloads]);

  // Sonner owns toast lifecycle now. The app keeps the same public pushToast
  // contract (message, type, title) and 4.5s auto-dismiss as the old stack;
  // "danger" maps to Sonner's "error" type.
  const pushToast = useCallback((message, type = "info", title = "") => {
    const sonnerType = type === "danger" ? "error" : type;
    const options = { type: sonnerType, duration: 4500 };
    if (title) {
      toast(title, { ...options, description: message });
    } else {
      toast(message, options);
    }
  }, []);

  // Fetch initial payloads from NestJS backend API once authenticated.
  useEffect(() => {
    if (!token) return undefined;
    let mounted = true;
    fetchPayloadsApi()
      .then((data) => {
        if (mounted && Array.isArray(data) && data.length > 0) {
          setPayloads(data);
          pushToast(
            `Terhubung ke Backend NestJS (${data.length} payload aktif dimuat)`,
            "info",
            "NestJS Backend Synced",
          );
        }
      })
      .catch((err) => {
        console.warn(
          "NestJS backend offline atau tidak dapat dijangkau, menggunakan fallback data lokal:",
          err.message,
        );
      });
    return () => {
      mounted = false;
    };
  }, [token, pushToast]);

  // Records a payload into the LOG section and shows the purge notification.
  const recordSublimation = useCallback(
    (payload, reason) => {
      const size =
        payload.size ||
        (payload.content ? payload.content.length + " B" : "N/A");

      setLogs((prev) => [
        {
          name: payload.name,
          type: payload.type,
          size,
          reason,
          timestamp: "Just now",
        },
        ...prev,
      ]);

      pushToast(
        `Ephemeral ${payload.type} "${payload.name}" sublimated from volatile RAM memory.`,
        "danger",
        "Memory Purged",
      );
    },
    [pushToast],
  );

  // Add a new payload to the buffer (calls POST /payloads on backend)
  const addPayload = useCallback(
    async (payload) => {
      try {
        const created = await createPayloadApi({
          name: payload.name,
          type: payload.type,
          content: payload.content,
          url: payload.url,
          device: payload.device || "Workstation (Desktop)",
          totalTTL: payload.totalTTL || 300,
          remainingTTL: payload.remainingTTL || payload.totalTTL || 300,
          size: payload.size,
          mime: payload.mime,
          isPinned: payload.isPinned ?? false,
        });

        setPayloads((prev) => [created, ...prev]);
        pushToast(
          `Berhasil mempublikasikan payload "${created.name}" ke backend NestJS!`,
          "success",
          "Payload Transmitted (201 Created)",
        );
        return created;
      } catch (error) {
        pushToast(
          error.message || "Gagal mengirim payload ke backend",
          "danger",
          error.status === 409 ? "HTTP 409 Conflict" : "HTTP 400 Bad Request",
        );
        throw error;
      }
    },
    [pushToast],
  );

  // Update an existing payload (calls PATCH /payloads/:id on backend)
  const updatePayload = useCallback(
    async (id, updateData) => {
      try {
        const updated = await updatePayloadApi(id, updateData);
        setPayloads((prev) =>
          prev.map((item) => (item.id === id ? { ...item, ...updated } : item)),
        );
        pushToast(
          `Berhasil memperbarui payload "${updated.name}" di backend NestJS!`,
          "success",
          "Payload Updated (200 OK)",
        );
        return updated;
      } catch (error) {
        pushToast(
          error.message || "Gagal memperbarui payload",
          "danger",
          "Update Failed",
        );
        throw error;
      }
    },
    [pushToast],
  );

  // Remove a payload from the buffer (calls DELETE /payloads/:id on backend)
  const sublimatePayload = useCallback(
    async (id, reason = "Manual Vanish") => {
      const target = payloadsRef.current.find((item) => item.id === id);
      if (!target) return;

      try {
        await deletePayloadApi(id);
      } catch (error) {
        console.warn("Delete API warning:", error.message);
      }

      recordSublimation(target, reason);
      setPayloads((prev) => prev.filter((item) => item.id !== id));
    },
    [recordSublimation],
  );

  // Pull a payload transmitted from the Client view (stored in localStorage).
  const consumePendingTransmission = useCallback(async () => {
    try {
      const pending = localStorage.getItem(PENDING_TRANSMIT_KEY);
      if (!pending) return;
      localStorage.removeItem(PENDING_TRANSMIT_KEY);
      const parsed = JSON.parse(pending);
      if (parsed && parsed.name) {
        await addPayload(parsed);
      }
    } catch (error) {
      console.warn("Storage sync check warning:", error);
    }
  }, [addPayload]);

  // 1-second countdown: decrement remaining TTL for unpinned items and purge expired
  useEffect(() => {
    const interval = setInterval(() => {
      const current = payloadsRef.current;
      const next = tickPayloads(current);

      // Anything that was dropped and was not pinned is a TTL purge. Pinned
      // items survive by identity, unpinned ones as new objects, so match on id.
      const survivorIds = new Set(next.map((payload) => payload.id));
      const expired = current.filter(
        (payload) => !payload.isPinned && !survivorIds.has(payload.id),
      );

      setPayloads(next);
      expired.forEach((payload) =>
        recordSublimation({ ...payload, remainingTTL: 0 }, "TTL Expired (0s)"),
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [recordSublimation]);

  const copyToClipboard = useCallback(
    (text, title, message) => {
      if (!navigator.clipboard) {
        pushToast("Clipboard API unavailable", "warning");
        return;
      }
      navigator.clipboard
        .writeText(text)
        .then(() => pushToast(message, "success", title))
        .catch(() => pushToast("Failed to copy to clipboard", "warning"));
    },
    [pushToast],
  );

  const downloadPayload = useCallback(
    (payload) => {
      const blob = new Blob(
        [payload.content || "Sublimatio Ephemeral File Buffer"],
        { type: payload.mime || "application/octet-stream" },
      );
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = payload.name;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);

      pushToast(
        `Downloaded temporary file: ${payload.name}`,
        "info",
        "File Payload",
      );
    },
    [pushToast],
  );

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <LoginView token={token} login={login} register={register} />
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute token={token}>
              <DashboardView
                payloads={payloads}
                logs={logs}
                onAddPayload={addPayload}
                onUpdatePayload={updatePayload}
                onSublimate={sublimatePayload}
                onCopy={copyToClipboard}
                onDownload={downloadPayload}
                onConsumePending={consumePendingTransmission}
                onLogout={logout}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/connect"
          element={
            <ProtectedRoute token={token}>
              <ConnectView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client"
          element={
            <ProtectedRoute token={token}>
              <ClientView pushToast={pushToast} />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster position="bottom-right" duration={4500} />
    </>
  );
}
