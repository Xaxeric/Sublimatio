import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import TtlRing from "./TtlRing.jsx";
import { formatTTL, getUrgencyLevel } from "../utils/payload.js";

const TYPE_STYLES = {
  file: {
    badge: "border-border bg-muted text-foreground",
    iconBg: "border-border bg-muted text-muted-foreground",
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
    badge: "border-border bg-muted text-foreground",
    iconBg: "border-border bg-muted text-muted-foreground",
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
    badge: "border-border bg-muted text-foreground",
    iconBg: "border-border bg-muted text-muted-foreground",
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
  onEdit,
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
      ? "text-destructive"
      : urgency === "warning"
        ? "text-foreground"
        : "text-muted-foreground";

  const stop = (event) => event.stopPropagation();

  const handleAction = (event, action) => {
    stop(event);
    action();
  };

  const handleVanish = (event) => {
    stop(event);
    setLeaving(true);
    // The parent removes the payload after the same short delay as before.
    setTimeout(() => onSublimate(payload.id, "User Triggered Vanish"), 400);
  };

  const renderPreview = () => {
    if (payload.type === "file") {
      return (
        <>
          <span className="text-xs text-muted-foreground">
            {payload.size || "0 KB"}
          </span>
          <span className="text-muted-foreground/60">|</span>
          <span className="truncate text-xs text-muted-foreground">
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
          className="inline-flex max-w-sm items-center gap-1 truncate text-xs text-foreground hover:underline"
        >
          {payload.url}
        </a>
      );
    }

    return (
      <>
        <span className="inline-block max-w-md truncate rounded border border-border bg-muted px-1.5 py-0.5 text-xs font-medium text-foreground">
          {payload.content}
        </span>
        <span className="text-muted-foreground/60">|</span>
        <span className="text-xs text-muted-foreground">
          {(payload.content || "").length} chars
        </span>
      </>
    );
  };

  const renderPrimaryAction = () => {
    if (payload.type === "file") {
      return (
        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={(event) => handleAction(event, () => onDownload(payload))}
          className="gap-1 px-2.5 text-xs tracking-wider"
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
        </Button>
      );
    }

    if (payload.type === "link") {
      return (
        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={(event) =>
            handleAction(event, () =>
              onCopy(
                payload.url,
                "Link Copied",
                "URL copied to clipboard: " + payload.url,
              ),
            )
          }
          className="gap-1 px-2.5 text-xs tracking-wider"
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
        </Button>
      );
    }

    return (
      <Button
        type="button"
        variant="outline"
        size="xs"
        onClick={(event) =>
          handleAction(event, () =>
            onCopy(
              payload.content || "",
              "Text Copied",
              `Snippet "${payload.name}" copied to clipboard!`,
            ),
          )
        }
        className="gap-1 px-2.5 text-xs tracking-wider"
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
      </Button>
    );
  };

  return (
    <Card
      onClick={() => onInspect(payload.id)}
      className={
        "group relative flex cursor-pointer flex-col justify-between gap-4 overflow-hidden rounded-xl p-4 py-4 transition-colors sm:p-5 md:flex-row md:items-center " +
        (leaving ? "pointer-events-none" : "hover:bg-accent")
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
            <h3 className="truncate text-sm font-bold tracking-wide text-foreground sm:text-base">
              {payload.name}
            </h3>
            <Badge
              variant="outline"
              className={
                "px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider " +
                styles.badge
              }
            >
              {styles.label}
            </Badge>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <svg
                className="h-3 w-3 text-muted-foreground"
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
          <div className="flex items-center gap-2 truncate text-xs text-muted-foreground">
            {renderPreview()}
          </div>
        </div>
      </div>

      <div className="flex flex-shrink-0 items-center justify-between gap-5 border-t border-border/60 pt-2 md:justify-end md:border-t-0 md:pt-0">
        <div className="flex items-center gap-3">
          <TtlRing
            remainingTTL={payload.remainingTTL}
            totalTTL={payload.totalTTL}
          />
          <div className="text-left">
            <div
              className={
                "text-[10px] font-bold uppercase tracking-wider " +
                urgencyColor
              }
            >
              {urgencyText}
            </div>
            <div className="text-xs text-foreground">
              {formatTTL(payload.remainingTTL)}
            </div>
          </div>
        </div>

        <div className="flex flex-shrink-0 items-center gap-1.5">
          {renderPrimaryAction()}
          {onEdit && (
            <Button
              type="button"
              variant="outline"
              size="icon-xs"
              onClick={(event) => handleAction(event, () => onEdit(payload))}
              title="Edit / Update payload (PATCH)"
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="icon-xs"
            onClick={(event) => handleAction(event, () => onInspect(payload.id))}
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
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={handleVanish}
            className="gap-1.5 border border-destructive/40 px-2.5 text-xs uppercase tracking-wider text-destructive hover:bg-destructive/10 hover:text-destructive"
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
          </Button>
        </div>
      </div>
    </Card>
  );
}
