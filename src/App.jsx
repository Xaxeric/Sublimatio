import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { INITIAL_LOGS, INITIAL_PAYLOADS } from "./data/payloads.js";
import {
  createPayloadApi,
  deletePayloadApi,
  fetchPayloadsApi,
  updatePayloadApi,
} from "./api/payloads.js";
import ClientView from "./components/ClientView.jsx";
import ConnectView from "./components/ConnectView.jsx";
import DashboardView from "./components/DashboardView.jsx";
import LoginView from "./components/LoginView.jsx";
import ToastStack from "./components/ToastStack.jsx";
import { tickPayloads } from "./utils/payload.js";

const PENDING_TRANSMIT_KEY = "sublimatio_pending_transmit";

export default function App() {
  // Main entity state: the list of Payload objects held in the volatile buffer.
  const [payloads, setPayloads] = useState(INITIAL_PAYLOADS);
  // Sublimation history (LOG) records.
  const [logs, setLogs] = useState(INITIAL_LOGS);
  // Floating notifications.
  const [toasts, setToasts] = useState([]);

  // Mirror of the payload list so callbacks and the 1s timer always read fresh data.
  const payloadsRef = useRef(payloads);
  useEffect(() => {
    payloadsRef.current = payloads;
  }, [payloads]);

  // A toast plays animate-toast-out (0.25s) before it leaves the DOM, so the
  // removal is split into "mark as leaving" and "drop". The timer ref keeps the
  // exit phase idempotent: auto-dismiss and the manual close button race.
  const toastTimers = useRef(new Set());

  const dismissToast = useCallback((id) => {
    if (toastTimers.current.has(id)) return;
    toastTimers.current.add(id);
    setToasts((prev) =>
      prev.map((toast) => (toast.id === id ? { ...toast, leaving: true } : toast)),
    );
    setTimeout(() => {
      toastTimers.current.delete(id);
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 250);
  }, []);

  const pushToast = useCallback(
    (message, type = "info", title = "") => {
      const id =
        "toast-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      setToasts((prev) => [...prev, { id, message, type, title }]);
      setTimeout(() => dismissToast(id), 4500);
    },
    [dismissToast],
  );

  // Fetch initial payloads from NestJS backend API on component mount
  useEffect(() => {
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
  }, [pushToast]);

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
        <Route path="/" element={<LoginView />} />
        <Route
          path="/dashboard"
          element={
            <DashboardView
              payloads={payloads}
              logs={logs}
              onAddPayload={addPayload}
              onUpdatePayload={updatePayload}
              onSublimate={sublimatePayload}
              onCopy={copyToClipboard}
              onDownload={downloadPayload}
              onConsumePending={consumePendingTransmission}
            />
          }
        />
        <Route path="/connect" element={<ConnectView />} />
        <Route path="/client" element={<ClientView pushToast={pushToast} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
