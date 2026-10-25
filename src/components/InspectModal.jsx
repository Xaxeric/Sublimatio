import { useState } from "react";
import Modal from "./Modal.jsx";
import { formatTTL } from "../utils/payload.js";

/**
 * Detail modal for a single Payload entity.
 * The SHA-256 fingerprint is only exposed for file payloads.
 *
 * @param {object} payload Payload being inspected.
 * @param {Function} onClose
 * @param {Function} onCopy (text, title, message)
 */
export default function InspectModal({ payload, onClose, onCopy }) {
  const [copied, setCopied] = useState(false);

  const content =
    payload.type === "link"
      ? "TARGET URL:\n" + payload.url
      : payload.type === "text"
        ? payload.content || "(empty)"
        : "FILE METADATA:\nName: " +
          payload.name +
          "\nSize: " +
          (payload.size || "Unknown") +
          "\nMIME: " +
          (payload.mime || "application/octet-stream") +
          "\n\nCONTENT PREVIEW:\n" +
          (payload.content || "[Binary buffer stream]");

  const handleCopy = () => {
    onCopy(
      content,
      "Payload Copied",
      "Cryptographic payload copied to clipboard",
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal onClose={onClose} maxWidth="max-w-xl">
      <div className="flex items-center justify-between border-b border-[#0a102e] pb-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 bg-sublimatio-accent" />
          <h3 className="max-w-md truncate font-chakra text-lg font-bold tracking-wider text-white">
            {payload.name}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-xl leading-none text-slate-400 hover:text-white"
        >
          &times;
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3 font-mono text-xs">
          <div className="border border-[#0a102e] bg-black/40 p-2.5">
            <span className="block font-chakra text-[10px] uppercase text-slate-500">
              Type
            </span>
            <span className="font-bold text-sublimatio-accent">
              {payload.type.toUpperCase()}
            </span>
          </div>
          <div className="border border-[#0a102e] bg-black/40 p-2.5">
            <span className="block font-chakra text-[10px] uppercase text-slate-500">
              Origin Device
            </span>
            <span className="truncate text-slate-300">{payload.device}</span>
          </div>
          <div className="border border-[#0a102e] bg-black/40 p-2.5">
            <span className="block font-chakra text-[10px] uppercase text-slate-500">
              Expiration TTL
            </span>
            <span className="text-amber-400">
              {formatTTL(payload.remainingTTL)} (Total:{" "}
              {formatTTL(payload.totalTTL)})
            </span>
          </div>
        </div>

        {payload.type === "file" && payload.hash && (
          <div>
            <span className="mb-1 block font-chakra text-[11px] uppercase tracking-wider text-slate-400">
              SHA-256 Fingerprint
            </span>
            <p className="break-all border border-[#0a102e] bg-black/40 p-2.5 font-mono text-[11px] text-indigo-300">
              {payload.hash}
            </p>
          </div>
        )}

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="block font-chakra text-[11px] uppercase tracking-wider text-slate-400">
              Payload Content
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded border border-slate-700 bg-slate-800/90 px-2.5 py-1 font-chakra text-[11px] uppercase tracking-wider text-slate-300 shadow-md transition-all hover:bg-slate-700 hover:text-white"
              title="Copy payload content to clipboard"
            >
              <svg
                className="h-3.5 w-3.5 text-cyan-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                />
              </svg>
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <pre className="max-h-56 overflow-y-auto whitespace-pre-wrap break-all border border-[#0a102e] bg-black/60 p-3.5 font-mono text-xs text-slate-200 sm:text-sm">
            {content}
          </pre>
        </div>
      </div>

      <div className="flex items-center justify-end border-t border-[#0a102e] pt-3">
        <button
          type="button"
          onClick={onClose}
          className="bg-slate-800 px-4 py-1.5 font-chakra text-xs uppercase tracking-wider text-white hover:bg-slate-700"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}
