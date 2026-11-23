import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import QRCode from "qrcode";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { makeHash } from "../utils/payload.js";

/**
 * Connect view: shows the QR code used to pair a mobile client device,
 * with fallback connection URL, mock pairing hash, and host user-agent details.
 */
export default function ConnectView() {
  const [copied, setCopied] = useState(false);
  const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "Unknown UA";
  const connectUrl = typeof window !== "undefined" ? `${window.location.origin}/client` : "/client";
  const [pairingHash] = useState(() => makeHash());

  // The QR encodes the connect URL plus the pairing hash, so a scanning client
  // can identify this pairing session. ClientView does not read it yet.
  const pairUrl = `${connectUrl}?pair=${encodeURIComponent(pairingHash)}`;

  const [qrDataUrl, setQrDataUrl] = useState("");
  const [qrError, setQrError] = useState("");

  useEffect(() => {
    let active = true;
    // Dark modules on a white field preserve the scanner's quiet zone and the
    // reflectance pattern it expects.
    QRCode.toDataURL(pairUrl, {
      width: 240,
      margin: 4,
      errorCorrectionLevel: "M",
      color: { dark: "#000000", light: "#ffffff" },
    })
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch((error) => {
        if (active) setQrError(error.message || "QR generation failed");
      });
    return () => {
      active = false;
    };
  }, [pairUrl]);

  const handleCopyUrl = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(connectUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 sm:p-6">
      <Card className="relative z-10 flex w-full max-w-[500px] flex-col items-center gap-5 p-6 py-6 shadow-2xl sm:p-8">
        <header className="space-y-1 text-center">
          <h2 className="text-base font-bold tracking-wide text-foreground sm:text-lg">
            Try to scan this QR image with your phone
          </h2>
          <p className="text-xs text-muted-foreground">
            Establish zero-knowledge peer sync with mobile client node
          </p>
        </header>

        {/* Generated pairing QR code */}
        <div className="rounded-lg border border-border bg-background p-3">
          {qrError ? (
            <div className="flex h-[240px] w-[240px] items-center justify-center px-4 text-center text-[11px] leading-snug text-destructive sm:h-[260px] sm:w-[260px]">
              QR gagal dibuat. Gunakan Connect URL manual di bawah.
            </div>
          ) : qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="QR Link for connecting between device"
              className="h-[240px] w-[240px] rounded object-contain sm:h-[260px] sm:w-[260px]"
            />
          ) : (
            <Skeleton
              aria-hidden="true"
              className="h-[240px] w-[240px] bg-muted sm:h-[260px] sm:w-[260px]"
            />
          )}
        </div>

        {/* Fallback metadata section */}
        <div className="w-full space-y-3 rounded border border-border bg-card p-3.5 text-xs">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Manual Pairing Fallback
            </span>
            <Badge
              variant="outline"
              className="text-[10px] text-muted-foreground"
            >
              Protocol: WebSocket / Mesh
            </Badge>
          </div>

          {/* Connect URL Fallback */}
          <div>
            <div className="flex items-center justify-between pb-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Connect URL (Fallback):
              </span>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={handleCopyUrl}
                className="text-[10px] uppercase text-muted-foreground hover:text-foreground"
              >
                {copied ? "Copied to Clipboard!" : "Copy URL"}
              </Button>
            </div>
            <div className="flex items-center justify-between gap-2 rounded border border-border bg-background px-2.5 py-1.5 text-xs">
              <Link
                to="/client"
                className="truncate text-foreground hover:underline"
                title="Click to visit client send directly"
              >
                {connectUrl}
              </Link>
              <Button
                variant="secondary"
                size="xs"
                asChild
                className="flex-shrink-0 text-[10px] font-bold uppercase"
              >
                <Link to="/client">Open</Link>
              </Button>
            </div>
          </div>

          {/* Mock Pairing Hash */}
          <div>
            <span className="block pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Pairing Hash (Mock):
            </span>
            <div className="truncate rounded border border-border bg-background px-2.5 py-1.5 text-[11px] text-foreground">
              {pairingHash}
            </div>
          </div>

          {/* Host User-Agent */}
          <div>
            <span className="block pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Host User-Agent:
            </span>
            <ScrollArea className="h-[60px] rounded border border-border bg-background">
              <p className="p-2 text-[10px] leading-tight text-muted-foreground">
                {userAgent}
              </p>
            </ScrollArea>
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex w-full items-center justify-between pt-1">
          <Button
            variant="outline"
            asChild
            className="px-4 text-[11px] font-semibold uppercase"
          >
            <Link to="/dashboard">Return to Dashboard</Link>
          </Button>
          <Button variant="default" asChild className="px-4 py-2">
            <Link to="/client">Go to Client Send</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
