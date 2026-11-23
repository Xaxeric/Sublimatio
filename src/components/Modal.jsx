import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * Thin shadcn Dialog adapter. The dashboard still conditionally mounts its
 * modals, so `open` defaults to true and every dismissal route goes through
 * the existing `onClose` callback.
 */
export default function Modal({
  children,
  onClose,
  open = true,
  title,
  description,
  maxWidth = "max-w-lg",
  className,
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose?.();
      }}
    >
      <DialogContent
        className={cn(
          "p-6 shadow-2xl",
          maxWidth,
          className,
        )}
      >
        <DialogHeader className="border-b border-border pb-3 text-left">
          {title && (
            <DialogTitle className="flex items-center gap-2 font-bold uppercase tracking-wider text-foreground">
              {title}
            </DialogTitle>
          )}
          <DialogDescription
            className={cn(
              "text-xs text-muted-foreground",
              !description && "sr-only",
            )}
          >
            {description || "Sublimatio ephemeral payload buffer"}
          </DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
