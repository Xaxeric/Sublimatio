const TOAST_STYLES = {
  info: "border-blue-500/60 bg-[#080f33]/90 text-sublimatio-text",
  success: "border-emerald-500/60 bg-[#061e1b]/90 text-emerald-200",
  warning: "border-amber-500/60 bg-[#241705]/90 text-amber-200",
  danger: "border-rose-500/70 bg-[#2a0813]/90 text-rose-200",
};

const TOAST_ICONS = {
  info: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  success: "M5 13l4 4L19 7",
  warning:
    "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  danger:
    "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
};

const TOAST_ICON_COLORS = {
  info: "text-cyan-400",
  success: "text-emerald-400",
  warning: "text-amber-400",
  danger: "text-sublimatio-red",
};

/**
 * Floating toast notifications.
 *
 * @param {Array} toasts  { id, message, type, title }
 * @param {Function} onDismiss
 */
export default function ToastStack({ toasts, onDismiss }) {
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={
            "pointer-events-auto flex items-start gap-3 rounded-lg border p-3.5 shadow-xl backdrop-blur-md transition-all duration-300 " +
            (TOAST_STYLES[toast.type] || TOAST_STYLES.info)
          }
        >
          <div className="mt-0.5 flex-shrink-0">
            <svg
              className={
                "h-4 w-4 " +
                (TOAST_ICON_COLORS[toast.type] || TOAST_ICON_COLORS.info)
              }
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={TOAST_ICONS[toast.type] || TOAST_ICONS.info}
              />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            {toast.title && (
              <p className="mb-0.5 font-chakra text-xs font-bold uppercase tracking-wider">
                {toast.title}
              </p>
            )}
            <p className="break-words font-rajdhani text-sm leading-snug">
              {toast.message}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            className="p-1 text-base leading-none text-slate-400 transition-colors hover:text-white"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}
