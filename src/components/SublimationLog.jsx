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
    <Card className="glass-card mt-auto gap-0 border-[#0a102e] p-4 py-4 sm:p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 bg-sublimatio-red" />
          <h3 className="font-chakra text-base font-bold uppercase tracking-wider text-slate-200 sm:text-lg">
            LOG{" "}
            <span className="font-normal text-slate-400">({logs.length})</span>
          </h3>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOpen((prev) => !prev)}
          className="gap-1.5 border-[#0a102e] bg-black/40 px-2.5 font-chakra text-xs text-sublimatio-subtle hover:bg-black/70 hover:text-white sm:text-sm"
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
          {/* Keyed on `open` so animate-slide-down replays on each open. On
              close the key flips too, but the row is already collapsing. */}
          <div
            key={open ? "open" : "closed"}
            className={
              "mt-3 " + (open ? "animate-slide-down" : "")
            }
          >
            {logs.length === 0 && (
              <p className="py-3 font-mono text-xs text-sublimatio-muted">
                Belum ada riwayat sublimasi.
              </p>
            )}
            <ScrollArea className="max-h-[260px]">
              <div className="pb-1">
                <div className="divide-y divide-[#0a102e]/60">
                  {logs.slice(0, 6).map((log, index) => (
                    <div
                      key={log.name + "-" + index}
                      className="flex items-center justify-between border-b border-[#0a102e]/70 py-2.5 font-mono text-xs text-slate-300 sm:text-sm"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="h-2 w-2 flex-shrink-0 rounded-full bg-sublimatio-red" />
                        <span className="truncate font-rajdhani text-sm font-semibold text-slate-200 sm:text-base">
                          {log.name}
                        </span>
                        <Badge
                          variant="outline"
                          className="rounded border-slate-800 bg-black/50 px-1.5 py-0.5 font-chakra text-xs font-medium uppercase text-slate-400"
                        >
                          {log.type}
                        </Badge>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-3.5 text-xs sm:text-sm">
                        <span className="font-mono font-medium text-sublimatio-red">
                          {log.reason}
                        </span>
                        <span className="font-mono text-slate-400">
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
