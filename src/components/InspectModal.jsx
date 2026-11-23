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
          <span className="h-2.5 w-2.5 bg-foreground" />
          <span className="max-w-md truncate text-lg">{payload.name}</span>
        </>
      }
    >
      <div className="grid grid-cols-3 gap-3 text-xs">
        <div className="border border-border bg-muted p-2.5">
          <span className="block text-[10px] uppercase text-muted-foreground">
            Type
          </span>
          <span className="font-bold text-foreground">
            {payload.type.toUpperCase()}
          </span>
        </div>
        <div className="border border-border bg-muted p-2.5">
          <span className="block text-[10px] uppercase text-muted-foreground">
            Origin Device
          </span>
          <span className="truncate text-foreground">{payload.device}</span>
        </div>
        <div className="border border-border bg-muted p-2.5">
          <span className="block text-[10px] uppercase text-muted-foreground">
            Expiration TTL
          </span>
          <span className="text-foreground">
            {formatTTL(payload.remainingTTL)} (Total:{" "}
            {formatTTL(payload.totalTTL)})
          </span>
        </div>
      </div>

      {payload.type === "file" && payload.hash && (
        <div>
          <span className="mb-1 block text-[11px] uppercase tracking-wider text-muted-foreground">
            SHA-256 Fingerprint
          </span>
          <p className="break-all border border-border bg-muted p-2.5 text-[11px] text-foreground">
            {payload.hash}
          </p>
        </div>
      )}

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="block text-[11px] uppercase tracking-wider text-muted-foreground">
            Payload Content
          </span>
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={handleCopy}
            className="gap-1.5 px-2.5 text-[11px] uppercase tracking-wider"
            title="Copy payload content to clipboard"
          >
            <Copy className="h-3.5 w-3.5" />
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
        <pre className="max-h-56 overflow-y-auto whitespace-pre-wrap break-all border border-border bg-muted p-3.5 text-xs text-foreground sm:text-sm">
          {content}
        </pre>
      </div>

      <Separator />
      <div className="flex items-center justify-end">
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
          className="px-4 py-1.5 text-xs uppercase tracking-wider"
        >
          Close
        </Button>
      </div>
    </Modal>
  );
}
