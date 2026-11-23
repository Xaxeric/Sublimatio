import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { countByType } from "../utils/payload.js";

const STAT_ITEMS = [
  { key: "total", label: "Total Payload", accent: "text-white" },
  { key: "file", label: "File", accent: "text-blue-400" },
  { key: "link", label: "Link", accent: "text-violet-400" },
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
        <Card
          key={item.key}
          className="glass-card glass-card-hover gap-0 rounded-lg px-3.5 py-3.5 text-center"
        >
          <Badge
            variant="ghost"
            className="block rounded-none px-0 font-chakra text-[10px] uppercase tracking-wider text-sublimatio-tertiary"
          >
            {item.label}
          </Badge>
          <span
            className={
              "mt-1 block font-chakra text-2xl font-bold " + item.accent
            }
          >
            {counts[item.key]}
          </span>
        </Card>
      ))}
    </section>
  );
}
