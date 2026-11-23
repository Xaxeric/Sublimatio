import { useState } from "react";
import { Copy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
    <Modal
      onClose={onClose}
      maxWidth="sm:max-w-xl"
      description="Inspect payload attributes and content"
      title={
        <>
          <span className="h-2.5 w-2.5 bg-sublimatio-accent" />
          <span className="max-w-md truncate text-lg">{payload.name}</span>
        </>
      }
    >
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
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={handleCopy}
            className="gap-1.5 border-slate-700 bg-slate-800/90 px-2.5 font-chakra text-[11px] uppercase tracking-wider text-slate-300 shadow-md hover:bg-slate-700 hover:text-white"
            title="Copy payload content to clipboard"
          >
            <Copy className="h-3.5 w-3.5 text-indigo-400" />
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
        <pre className="max-h-56 overflow-y-auto whitespace-pre-wrap break-all border border-[#0a102e] bg-black/60 p-3.5 font-mono text-xs text-slate-200 sm:text-sm">
          {content}
        </pre>
      </div>

      <Separator className="bg-[#0a102e]" />
      <div className="flex items-center justify-end">
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
          className="bg-slate-800 px-4 py-1.5 font-chakra text-xs uppercase tracking-wider text-white hover:bg-slate-700"
        >
          Close
        </Button>
      </div>
    </Modal>
  );
}
