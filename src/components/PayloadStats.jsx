import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { countByType } from "../utils/payload.js";

const STAT_ITEMS = [
  { key: "total", label: "Total Payload", accent: "text-foreground" },
  { key: "file", label: "File", accent: "text-muted-foreground" },
  { key: "link", label: "Link", accent: "text-muted-foreground" },
  { key: "text", label: "Snippet", accent: "text-muted-foreground" },
  { key: "expiring", label: "Expiring < 60s", accent: "text-destructive" },
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
          className="gap-0 rounded-lg px-3.5 py-3.5 text-center"
        >
          <Badge
            variant="ghost"
            className="block rounded-none px-0 text-[10px] uppercase tracking-wider text-muted-foreground"
          >
            {item.label}
          </Badge>
          <span
            className={
              "mt-1 block text-2xl font-bold " + item.accent
            }
          >
            {counts[item.key]}
          </span>
        </Card>
      ))}
    </section>
  );
}
