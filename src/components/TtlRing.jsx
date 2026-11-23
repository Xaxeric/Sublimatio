import { formatShortTTL } from "../utils/payload.js";

/**
 * Plain-text countdown for a payload's remaining TTL.
 *
 * @param {number} remainingTTL Seconds left before sublimation.
 * @param {number} totalTTL     Original TTL assigned at transmission.
 */
export default function TtlRing({ remainingTTL, totalTTL }) {
  return (
    <span
      title={`${remainingTTL}s remaining of ${totalTTL}s`}
      className="inline-flex h-9 min-w-12 flex-shrink-0 items-center justify-center rounded-md border border-border bg-muted px-2 text-xs font-semibold tabular-nums text-foreground"
    >
      {formatShortTTL(remainingTTL)}
    </span>
  );
}
