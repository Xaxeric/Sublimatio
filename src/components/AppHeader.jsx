/**
 * Application header: entity title, description and the primary action button.
 *
 * @param {string} title     Entity-facing heading (e.g. "Buffer").
 * @param {string} subtitle  Short explanation of the view.
 * @param {string} actionLabel Label of the primary action button.
 * @param {Function} onAction Callback fired when the primary action is clicked.
 */
export default function AppHeader({ title, subtitle, actionLabel, onAction }) {
  return (
    <div className="flex flex-col justify-between gap-6 border-b border-[#0a102e] pb-6 lg:flex-row lg:items-center">
      <div>
        <h1 className="font-chakra text-2xl font-bold tracking-wide text-white sm:text-3xl">
          {title}
        </h1>
        <p className="mt-1 max-w-2xl font-rajdhani text-sm leading-relaxed text-sublimatio-tertiary">
          {subtitle}
        </p>
      </div>

      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onAction}
          className="flex items-center gap-2 border border-blue-400 bg-sublimatio-accent px-4 py-2 font-chakra text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_15px_rgba(26,57,237,0.4)] transition-all hover:bg-blue-600"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
