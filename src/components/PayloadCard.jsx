import { useState } from "react";
import TtlRing from "./TtlRing.jsx";
import { formatTTL, getUrgencyLevel } from "../utils/payload.js";

const TYPE_STYLES = {
  file: {
    badge:
      "bg-blue-950/80 text-blue-400 border-blue-800/60",
    iconBg: "bg-blue-950/50 border-blue-900/60 text-blue-400",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
      />
    ),
    label: "FILE",
  },
  link: {
    badge: "bg-cyan-950/80 text-cyan-400 border-cyan-800/60",
    iconBg: "bg-cyan-950/50 border-cyan-900/60 text-cyan-400",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
      />
    ),
    label: "LINK",
  },
  text: {
    badge: "bg-indigo-950/80 text-indigo-400 border-indigo-800/60",
    iconBg: "bg-indigo-950/50 border-indigo-900/60 text-indigo-400",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    ),
    label: "SNIPPET",
  },
};

/**
 * Card that represents a single Payload entity in the buffer list.
 *
 * Entity attributes consumed: id, type, name, device, size, mime, url,
 * content, totalTTL, remainingTTL.
 *
 * @param {object} payload         Payload entity.
 * @param {Function} onSublimate   Purge the payload from the buffer.
 * @param {Function} onCopy        Copy text/URL to the clipboard.
 * @param {Function} onDownload    Download a file payload.
 * @param {Function} onInspect     Open the detail modal.
 */
export default function PayloadCard({
  payload,
  onSublimate,
  onCopy,
  onDownload,
  onInspect,
}) {
  const [leaving, setLeaving] = useState(false);
  const styles = TYPE_STYLES[payload.type] || TYPE_STYLES.text;
  const urgency = getUrgencyLevel(payload.remainingTTL);

  const urgencyText =
    urgency === "critical"
      ? "EXPIRES SOON"
      : urgency === "warning"
        ? "EXPIRING"
        : "TTL BUFFER";
  const urgencyColor =
    urgency === "critical"
      ? "text-sublimatio-red"
      : urgency === "warning"
        ? "text-amber-400"
        : "text-slate-400";

  const stop = (event) => event.stopPropagation();

  const handleAction = (event, action) => {
    stop(event);
    action();
  };

  const handleVanish = (event) => {
    stop(event);
    setLeaving(true);
    // Let the "sublimate" animation play before the parent removes the payload.
    setTimeout(() => onSublimate(payload.id, "User Triggered Vanish"), 400);
  };

  const renderPreview = () => {
    if (payload.type === "file") {
      return (
        <>
          <span className="font-mono text-xs text-slate-400">
            {payload.size || "0 KB"}
          </span>
          <span className="text-slate-600">&bull;</span>
          <span className="font-mono text-xs text-slate-400">
            {payload.mime || "application/octet-stream"}
          </span>
        </>
      );
    }

    if (payload.type === "link") {
      return (
        <a
          href={payload.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={stop}
          className="inline-flex max-w-sm items-center gap-1 truncate font-mono text-xs text-cyan-400 hover:underline"
        >
          {payload.url}
        </a>
      );
    }

    return (
      <>
        <span className="inline-block max-w-md truncate rounded border border-indigo-900/40 bg-black/40 px-1.5 py-0.5 font-mono text-xs font-medium text-indigo-300">
          {payload.content}
        </span>
        <span className="text-slate-600">&bull;</span>
        <span className="text-xs text-slate-400">
          {(payload.content || "").length} chars
        </span>
      </>
    );
  };

  const renderPrimaryAction = () => {
    if (payload.type === "file") {
      return (
        <button
          type="button"
          onClick={(event) => handleAction(event, () => onDownload(payload))}
          className="flex items-center gap-1 rounded border border-blue-800/60 bg-blue-950/50 px-2.5 py-1.5 font-chakra text-xs tracking-wider text-blue-300 transition-all hover:bg-blue-900/70 hover:text-white"
          title="Fetch ephemeral payload"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          <span className="hidden sm:inline">Fetch</span>
        </button>
      );
    }

    if (payload.type === "link") {
      return (
        <button
          type="button"
          onClick={(event) =>
            handleAction(event, () =>
              onCopy(
                payload.url,
                "Link Copied",
                "URL copied to clipboard: " + payload.url,
              ),
            )
          }
          className="flex items-center gap-1 rounded border border-cyan-800/60 bg-cyan-950/50 px-2.5 py-1.5 font-chakra text-xs tracking-wider text-cyan-300 transition-all hover:bg-cyan-900/70 hover:text-white"
          title="Copy URL to clipboard"
        >
          <svg
            className="h-3.5 w-3.5"
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
          <span className="hidden sm:inline">Copy</span>
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={(event) =>
          handleAction(event, () =>
            onCopy(
              payload.content || "",
              "Text Copied",
              `Snippet "${payload.name}" copied to clipboard!`,
            ),
          )
        }
        className="flex items-center gap-1 rounded border border-indigo-800/60 bg-indigo-950/50 px-2.5 py-1.5 font-chakra text-xs tracking-wider text-indigo-300 transition-all hover:bg-indigo-900/70 hover:text-white"
        title="Copy text to clipboard"
      >
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <span className="hidden sm:inline">Copy</span>
      </button>
    );
  };

  return (
    <div
      onClick={() => onInspect(payload.id)}
      className={
        "glass-card group relative flex cursor-pointer flex-col justify-between gap-4 overflow-hidden rounded-xl p-4 transition-all duration-300 sm:p-5 md:flex-row md:items-center " +
        (leaving ? "pointer-events-none animate-fade-sublimate" : "glass-card-hover")
      }
    >
      <div className="flex min-w-0 flex-1 items-start gap-3.5 sm:items-center">
        <div
          className={
            "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border " +
            styles.iconBg
          }
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {styles.icon}
          </svg>
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h3 className="truncate font-chakra text-sm font-bold tracking-wide text-[#c6cfff] transition-colors group-hover:text-white sm:text-base">
              {payload.name}
            </h3>
            <span
              className={
                "rounded border px-2 py-0.5 font-chakra text-[10px] font-bold uppercase tracking-wider " +
                styles.badge
              }
            >
              {styles.label}
            </span>
            <span className="flex items-center gap-1 font-rajdhani text-[11px] text-sublimatio-muted">
              <svg
                className="h-3 w-3 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              {payload.device}
            </span>
          </div>
          <div className="flex items-center gap-2 truncate text-xs text-sublimatio-muted">
            {renderPreview()}
          </div>
        </div>
      </div>

      <div className="flex flex-shrink-0 items-center justify-between gap-5 border-t border-[#0a102e]/60 pt-2 md:justify-end md:border-t-0 md:pt-0">
        <div className="flex items-center gap-3">
          <TtlRing
            remainingTTL={payload.remainingTTL}
            totalTTL={payload.totalTTL}
          />
          <div className="text-left">
            <div
              className={
                "font-chakra text-[10px] font-bold uppercase tracking-wider " +
                urgencyColor
              }
            >
              {urgencyText}
            </div>
            <div className="font-mono text-xs text-slate-300">
              {formatTTL(payload.remainingTTL)}
            </div>
          </div>
        </div>

        <div className="flex flex-shrink-0 items-center gap-1.5">
          {renderPrimaryAction()}
          <button
            type="button"
            onClick={(event) => handleAction(event, () => onInspect(payload.id))}
            className="rounded border border-slate-700/60 bg-slate-900/80 px-2 py-1.5 text-xs text-slate-300 transition-all hover:bg-slate-800 hover:text-white"
            title="Inspect payload details"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleVanish}
            className="flex items-center gap-1.5 rounded border border-rose-900/50 bg-rose-950/40 px-2.5 py-1.5 font-chakra text-xs uppercase tracking-wider text-sublimatio-red transition-all hover:border-rose-600/70 hover:bg-rose-900/60 hover:text-white"
            title="Sublimate immediately (Delete from RAM)"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            <span className="hidden sm:inline">Vanish</span>
          </button>
        </div>
      </div>
    </div>
  );
}
