import {
  CIRCLE_CIRCUMFERENCE,
  calculateProgress,
  formatShortTTL,
  getUrgencyLevel,
} from "../utils/payload.js";

const RING_STYLES = {
  critical: {
    ring: "stroke-sublimatio-red text-sublimatio-red animate-pulse",
    label: "text-sublimatio-red",
  },
  warning: {
    ring: "stroke-amber-400 text-amber-400",
    label: "text-amber-400",
  },
  normal: {
    ring: "stroke-cyan-400 text-cyan-400",
    label: "text-cyan-400",
  },
};

/**
 * Circular countdown ring for a payload's remaining TTL.
 *
 * @param {number} remainingTTL Seconds left before sublimation.
 * @param {number} totalTTL     Original TTL assigned at transmission.
 */
export default function TtlRing({ remainingTTL, totalTTL }) {
  const ratio = calculateProgress(remainingTTL, totalTTL);
  const offset = CIRCLE_CIRCUMFERENCE * (1 - ratio);
  const urgency = getUrgencyLevel(remainingTTL);
  const style = RING_STYLES[urgency] || RING_STYLES.normal;

  return (
    <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center">
      <svg className="circular-progress-ring h-12 w-12" viewBox="0 0 36 36">
        <circle
          cx="18"
          cy="18"
          r="15"
          fill="none"
          className="stroke-slate-800/80"
          strokeWidth="2.8"
        />
        <circle
          cx="18"
          cy="18"
          r="15"
          fill="none"
          className={
            "transition-all duration-1000 ease-linear " + style.ring
          }
          strokeWidth="2.8"
          strokeDasharray={CIRCLE_CIRCUMFERENCE}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span
        className={
          "absolute font-mono text-[11px] font-bold tracking-tight " +
          style.label
        }
      >
        {formatShortTTL(remainingTTL)}
      </span>
    </div>
  );
}
