import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { makeHash } from "../utils/payload.js";

const PENDING_TRANSMIT_KEY = "sublimatio_pending_transmit";

/**
 * Client view: minimal transmit form for a peer device.
 * The payload is handed over to the dashboard through localStorage.
 */
export default function ClientView({ pushToast }) {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const chosenFile = fileRef.current?.files?.[0];
    if (!chosenFile && !text.trim()) {
      setError(
        "Silakan pilih file atau masukkan teks clipboard sebelum transmisi!",
      );
      return;
    }

    setError("");

    let payloadItem;
    if (chosenFile) {
      payloadItem = {
        id: "client-f-" + Date.now().toString(36),
        type: "file",
        name: chosenFile.name,
        size: (chosenFile.size / 1024).toFixed(1) + " KB",
        mime: chosenFile.type || "application/octet-stream",
        content: "[Client Upload Buffer: " + chosenFile.name + "]",
        desc: "Payload uploaded from client terminal",
        device: "Mobile (Client Node)",
        totalTTL: 300,
        remainingTTL: 300,
        createdAt: "Just now",
        hash: makeHash(),
      };
    } else {
      payloadItem = {
        id: "client-t-" + Date.now().toString(36),
        type: "text",
        name: "Client Clipboard Payload",
        content: text.trim(),
        desc: "Text snippet transmitted from client terminal",
        device: "Mobile (Client Node)",
        totalTTL: 180,
        remainingTTL: 180,
        createdAt: "Just now",
        hash: makeHash(),
      };
    }

    try {
      localStorage.setItem(PENDING_TRANSMIT_KEY, JSON.stringify(payloadItem));
    } catch (err) {
      console.warn(err);
    }

    pushToast(
      `Transmisi "${payloadItem.name}" dikirim ke mesh buffer.`,
      "success",
      "Payload Transmitted",
    );
    navigate("/dashboard");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <div className="grid-img-decoration mask-img-w-radial" />

      <section className="glass-card relative z-10 w-full max-w-lg space-y-6 p-6">
        <div className="border-b border-[#0a102e] pb-3">
          <h2 className="font-chakra text-lg font-bold tracking-wide text-white">
            Client Node Transmission
          </h2>
          <p className="text-xs text-sublimatio-muted">
            Send ephemeral payload directly to mesh buffer
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded border border-sublimatio-red/50 bg-sublimatio-red/20 p-3 font-chakra text-xs text-sublimatio-red">
            <svg
              className="h-4 w-4 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="fileupload_id"
              className="mb-2 block font-chakra text-xs uppercase tracking-wider text-slate-300"
            >
              Upload File
            </label>
            <input
              id="fileupload_id"
              type="file"
              ref={fileRef}
              accept="image/png, image/jpeg, application/pdf"
              className="w-full border border-[#0a102e] bg-[#080d24] px-3 py-2 font-mono text-xs text-slate-400 file:mr-3 file:rounded file:border-0 file:bg-blue-900/60 file:px-2.5 file:py-1 file:font-chakra file:text-xs file:text-cyan-300"
            />
          </div>

          <div>
            <label
              htmlFor="textform_id"
              className="mb-2 block font-chakra text-xs uppercase tracking-wider text-slate-300"
            >
              Text / Clipboard Content:
            </label>
            <textarea
              id="textform_id"
              rows="4"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Type or paste payload here..."
              className="w-full border border-[#0a102e] bg-[#080d24] px-3 py-2 font-mono text-xs text-white placeholder-slate-500 focus:border-sublimatio-accent focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <Link
              to="/dashboard"
              className="font-chakra text-xs uppercase tracking-wider text-slate-400 hover:text-white"
            >
              &larr; Back to Dashboard
            </Link>
            <button
              type="submit"
              className="border border-blue-400 bg-sublimatio-accent px-6 py-2 font-chakra text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:bg-blue-600"
            >
              Transmit to Buffer
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
