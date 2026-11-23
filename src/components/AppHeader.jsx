import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Application header: entity title, description and the primary action button.
 * Also supports toggling the dashboard sidebar panel.
 *
 * @param {string} title     Entity-facing heading (e.g. "Buffer").
 * @param {string} subtitle  Short explanation of the view.
 * @param {string} actionLabel Label of the primary action button.
 * @param {Function} onAction Callback fired when the primary action is clicked.
 * @param {Function} onToggleSidebar Callback fired to toggle the sidebar panel.
 * @param {boolean} sidebarOpen Current state of the sidebar panel.
 */
export default function AppHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
  onToggleSidebar,
  sidebarOpen = true,
}) {
  const toggleLabel = sidebarOpen
    ? "Collapse sidebar panel"
    : "Expand sidebar panel";

  return (
    <div className="flex flex-col justify-between gap-6 border-b border-border pb-6 lg:flex-row lg:items-center">
      <div className="flex items-start gap-3">
        {onToggleSidebar && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={onToggleSidebar}
                  aria-label="Toggle sidebar panel"
                  className="mt-0.5 h-9 w-9 flex-shrink-0"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d={
                        sidebarOpen
                          ? "M4 6h16M4 12h10M4 18h16"
                          : "M4 6h16M4 12h16M4 18h16"
                      }
                    />
                  </svg>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{toggleLabel}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-wide text-foreground sm:text-3xl">
            {title}
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <Button type="button" onClick={onAction} className="px-4 py-2">
          <Plus className="h-4 w-4" />
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}
