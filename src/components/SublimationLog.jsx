import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

/**
 * LOG section: accordion list of sublimated (purged) payloads.
 *
 * @param {Array} logs Sublimation history records.
 */
export default function SublimationLog({ logs }) {
  const [open, setOpen] = useState(true);

  return (
    <Card className="mt-auto gap-0 p-4 py-4 sm:p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 bg-destructive" />
          <h3 className="text-base font-bold uppercase tracking-wider text-foreground sm:text-lg">
            LOG{" "}
            <span className="font-normal text-muted-foreground">({logs.length})</span>
          </h3>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOpen((prev) => !prev)}
          className="gap-1.5 px-2.5 text-xs hover:bg-accent sm:text-sm"
        >
          {open ? "Hide" : "Toggle View"}
          <ChevronDown
            className={
              "h-3.5 w-3.5 transition-transform duration-300 " +
              (open ? "rotate-180" : "")
            }
          />
        </Button>
      </div>

      {/* Accordion body: a 0fr -> 1fr grid-template-rows transition. Unlike a
          max-height guess it needs no magic pixel value and animates both open
          and close smoothly (jQuery slideToggle(250)). The body stays mounted so
          the row can animate shut; overflow-hidden clips it while collapsed, and
          aria-hidden keeps it out of the a11y tree when closed. */}
      <div
        aria-hidden={!open}
        className={
          "grid transition-[grid-template-rows] duration-200 ease-out " +
          (open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")
        }
      >
        <div className="overflow-hidden">
          {/* Keyed on `open` so the body remounts on each toggle. On close the
              key flips too, but the row is already collapsing. */}
          <div key={open ? "open" : "closed"} className="mt-3">
            {logs.length === 0 && (
              <p className="py-3 text-xs text-muted-foreground">
                Belum ada riwayat sublimasi.
              </p>
            )}
            <ScrollArea className="max-h-[260px]">
              <div className="pb-1">
                <div className="divide-y divide-border/60">
                  {logs.slice(0, 6).map((log, index) => (
                    <div
                      key={log.name + "-" + index}
                      className="flex items-center justify-between border-b border-border/70 py-2.5 text-xs text-foreground sm:text-sm"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="h-2 w-2 flex-shrink-0 rounded-full bg-destructive" />
                        <span className="truncate text-sm font-semibold text-foreground sm:text-base">
                          {log.name}
                        </span>
                        <Badge
                          variant="outline"
                          className="rounded px-1.5 py-0.5 text-xs font-medium uppercase text-muted-foreground"
                        >
                          {log.type}
                        </Badge>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-3.5 text-xs sm:text-sm">
                        <span className="font-medium text-destructive">
                          {log.reason}
                        </span>
                        <span className="text-muted-foreground">
                          {log.timestamp}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </Card>
  );
}
