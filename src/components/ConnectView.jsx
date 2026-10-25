import { useState } from "react";
import { Link } from "react-router-dom";
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
      <div className="grid-img-decoration mask-img-w-radial" />

      <section className="glass-card relative z-10 flex w-full max-w-[500px] flex-col items-center gap-5 p-6 sm:p-8 shadow-2xl">
        <header className="text-center space-y-1">
          <h2 className="font-chakra text-base sm:text-lg font-bold tracking-wide text-sublimatio-text">
            Try to scan this QR image with your phone
          </h2>
          <p className="font-rajdhani text-xs text-sublimatio-muted">
            Establish zero-knowledge peer sync with mobile client node
          </p>
        </header>

        {/* QR Code image */}
        <div className="relative rounded-lg border border-[#0a102e] bg-[#040714] p-3 shadow-[0_0_25px_rgba(26,57,237,0.15)]">
          <img
            src="/assets/qr-code.jpg"
            alt="QR Link for connecting between device"
            className="h-[240px] w-[240px] sm:h-[260px] sm:w-[260px] object-contain"
          />
          <div className="absolute top-1 left-1 h-3 w-3 border-t-2 border-l-2 border-sublimatio-accent" />
          <div className="absolute top-1 right-1 h-3 w-3 border-t-2 border-r-2 border-sublimatio-accent" />
          <div className="absolute bottom-1 left-1 h-3 w-3 border-b-2 border-l-2 border-sublimatio-accent" />
          <div className="absolute bottom-1 right-1 h-3 w-3 border-b-2 border-r-2 border-sublimatio-accent" />
        </div>

        {/* Fallback metadata section */}
        <div className="w-full space-y-3 rounded border border-[#0d163d] bg-[#060a1f]/80 p-3.5 text-xs">
          <div className="flex items-center justify-between border-b border-[#0d163d] pb-2">
            <span className="font-chakra text-[10px] font-bold uppercase tracking-wider text-sublimatio-subtle">
              Manual Pairing Fallback
            </span>
            <span className="font-mono text-[10px] text-cyan-400">
              Protocol: WebSocket / Mesh
            </span>
          </div>

          {/* Connect URL Fallback */}
          <div>
            <div className="flex items-center justify-between pb-1">
              <span className="font-chakra text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Connect URL (Fallback):
              </span>
              <button
                type="button"
                onClick={handleCopyUrl}
                className="font-chakra text-[10px] uppercase text-sublimatio-glow hover:text-white transition-colors"
              >
                {copied ? "Copied to Clipboard!" : "Copy URL"}
              </button>
            </div>
            <div className="flex items-center justify-between gap-2 rounded border border-[#101b4d] bg-[#040714] px-2.5 py-1.5 font-mono text-xs">
              <Link
                to="/client"
                className="truncate text-cyan-300 hover:text-cyan-100 hover:underline"
                title="Click to visit client send directly"
              >
                {connectUrl}
              </Link>
              <Link
                to="/client"
                className="flex-shrink-0 rounded bg-sublimatio-accent/30 px-2 py-0.5 font-chakra text-[10px] uppercase font-bold text-white hover:bg-sublimatio-accent"
              >
                Open
              </Link>
            </div>
          </div>

          {/* Mock Pairing Hash */}
          <div>
            <span className="block pb-1 font-chakra text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Pairing Hash (Mock):
            </span>
            <div className="truncate rounded border border-[#101b4d] bg-[#040714] px-2.5 py-1.5 font-mono text-[11px] text-emerald-400">
              {pairingHash}
            </div>
          </div>

          {/* Host User-Agent */}
          <div>
            <span className="block pb-1 font-chakra text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Host User-Agent:
            </span>
            <div className="max-h-[60px] overflow-y-auto no-scrollbar rounded border border-[#101b4d] bg-[#040714] p-2 font-mono text-[10px] text-slate-400 leading-tight">
              {userAgent}
            </div>
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex w-full items-center justify-between pt-1">
          <Link
            to="/dashboard"
            className="border border-[#1a2868] bg-gradient-to-b from-[#1520522d] to-[#0f227737] px-4 py-2 font-chakra text-[11px] font-semibold uppercase text-sublimatio-glow transition-all hover:brightness-125"
          >
            &larr; Return to Dashboard
          </Link>
          <Link
            to="/client"
            className="border border-blue-400 bg-sublimatio-accent px-4 py-2 font-chakra text-[11px] font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:bg-blue-600"
          >
            Go to Client Send &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}

