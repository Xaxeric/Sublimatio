import { countByType } from "../utils/payload.js";

const STAT_ITEMS = [
  { key: "total", label: "Total Payload", accent: "text-white" },
  { key: "file", label: "File", accent: "text-blue-400" },
  { key: "link", label: "Link", accent: "text-cyan-400" },
  { key: "text", label: "Snippet", accent: "text-indigo-400" },
  { key: "expiring", label: "Expiring < 60s", accent: "text-sublimatio-red" },
];

/**
 * Summary card: counts the payloads currently held in the buffer.
 *
 * @param {Array} payloads List of Payload entities.
 */
export default function PayloadStats({ payloads }) {
  const counts = countByType(payloads);

  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {STAT_ITEMS.map((item) => (
        <div
          key={item.key}
          className="glass-card glass-card-hover p-3.5 text-center"
        >
          <span className="block font-chakra text-[10px] uppercase tracking-wider text-sublimatio-tertiary">
            {item.label}
          </span>
          <span
            className={
              "mt-1 block font-chakra text-2xl font-bold " + item.accent
            }
          >
            {counts[item.key]}
          </span>
        </div>
      ))}
    </section>
  );
}
