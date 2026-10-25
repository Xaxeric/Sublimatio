/**
 * Conditional rendering target: shown when no payload matches the current view.
 *
 * @param {string} entityName Name of the main data entity (e.g. "Payload").
 */
export default function EmptyState({ entityName = "Payload" }) {
  return (
    <div className="my-auto flex w-full flex-col items-center justify-center space-y-4 px-4 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center border border-slate-800/80 bg-slate-900/60 text-slate-500">
        <svg
          className="h-7 w-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      </div>
      <div>
        <h4 className="font-chakra text-lg font-bold uppercase tracking-wider text-white">
          Belum ada data {entityName}
        </h4>
        <p className="mx-auto mt-1 max-w-sm text-xs text-sublimatio-tertiary">
          Semua item transient sudah tersublimasi karena kedaluwarsa, atau tidak
          ada item yang cocok dengan filter dan pencarian Anda.
        </p>
      </div>
    </div>
  );
}
