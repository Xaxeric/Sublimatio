import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { INITIAL_LOGS, INITIAL_PAYLOADS } from "./data/payloads.js";
import ClientView from "./components/ClientView.jsx";
import ConnectView from "./components/ConnectView.jsx";
import DashboardView from "./components/DashboardView.jsx";
import LoginView from "./components/LoginView.jsx";
import ToastStack from "./components/ToastStack.jsx";

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

  const pushToast = useCallback((message, type = "info", title = "") => {
    const id =
      "toast-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    setToasts((prev) => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

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

  // Add a new payload to the buffer (used by the controlled form).
  const addPayload = useCallback(
    (payload) => {
      setPayloads((prev) => [payload, ...prev]);
      pushToast(
        `Berhasil mempublikasikan payload "${payload.name}" ke memori buffer!`,
        "success",
        "Payload Transmitted",
      );
    },
    [pushToast],
  );

  // Remove a payload from the buffer and write it to the LOG.
  const sublimatePayload = useCallback(
    (id, reason = "Manual Vanish") => {
      const target = payloadsRef.current.find((item) => item.id === id);
      if (!target) return;

      recordSublimation(target, reason);
      setPayloads((prev) => prev.filter((item) => item.id !== id));
    },
    [recordSublimation],
  );

  // Pull a payload transmitted from the Client view (stored in localStorage).
  const consumePendingTransmission = useCallback(() => {
    try {
      const pending = localStorage.getItem(PENDING_TRANSMIT_KEY);
      if (!pending) return;
      localStorage.removeItem(PENDING_TRANSMIT_KEY);
      const parsed = JSON.parse(pending);
      if (parsed && parsed.name) {
        setPayloads((prev) => [parsed, ...prev]);
        pushToast(
          `Menerima transmisi data baru dari client device: "${parsed.name}"`,
          "success",
          "Peer Synced",
        );
      }
    } catch (error) {
      console.warn("Storage sync check warning:", error);
    }
  }, [pushToast]);

  // 1-second countdown: decrement every remaining TTL and purge expired payloads.
  useEffect(() => {
    const interval = setInterval(() => {
      const expired = [];
      const next = payloadsRef.current.map((payload) => {
        const remaining = Math.max(0, payload.remainingTTL - 1);
        if (remaining === 0) expired.push({ ...payload, remainingTTL: 0 });
        return { ...payload, remainingTTL: remaining };
      });

      setPayloads(next.filter((payload) => payload.remainingTTL > 0));
      expired.forEach((payload) =>
        recordSublimation(payload, "TTL Expired (0s)"),
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
