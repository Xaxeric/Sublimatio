const FILTERS = [
  { value: "all", label: "All Items" },
  { value: "file", label: "Files" },
  { value: "link", label: "Links" },
  { value: "text", label: "Text Snippets" },
];

/**
 * Toolbar with filter tabs, sort selector and search input.
 *
 * @param {string} filter          Active payload type filter.
 * @param {string} sortBy          Active sort key.
 * @param {string} query           Current search text.
 * @param {Function} onFilterChange
 * @param {Function} onSortChange
 * @param {Function} onQueryChange
 */
export default function FilterToolbar({
  filter,
  sortBy,
  query,
  onFilterChange,
  onSortChange,
  onQueryChange,
}) {
  return (
    <div className="flex flex-col items-stretch justify-between gap-4 pt-2 sm:flex-row sm:items-center">
      <div className="flex items-center gap-1.5 overflow-x-auto border border-[#0a102e] bg-[#080d24]/80 p-1">
        {FILTERS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onFilterChange(option.value)}
            className={
              "px-3.5 py-1.5 font-chakra text-xs font-semibold uppercase tracking-wider transition-all " +
              (filter === option.value
                ? "border border-blue-500 bg-sublimatio-accent/30 text-white"
                : "border border-transparent text-sublimatio-tertiary hover:text-white")
            }
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
        <div className="flex items-center gap-2">
          <label
            htmlFor="sort-select"
            className="hidden font-chakra text-xs uppercase tracking-wider text-sublimatio-tertiary sm:inline"
          >
            Sort:
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(event) => onSortChange(event.target.value)}
            className="border border-[#0a102e] bg-[#080d24]/90 px-2.5 py-2 font-chakra text-xs text-white focus:border-sublimatio-accent focus:outline-none"
          >
            <option value="ttl-asc">TTL: Expiring Soonest</option>
            <option value="ttl-desc">TTL: Longest First</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </select>
        </div>

        <div className="relative w-full sm:w-64">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search items by name or content..."
            className="w-full border border-[#0a102e] bg-[#080d24]/90 py-2 pl-9 pr-4 font-rajdhani text-xs text-white placeholder-slate-500 transition-colors focus:border-sublimatio-accent focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
