import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
      <Tabs value={filter} onValueChange={onFilterChange}>
        <TabsList variant="line" className="h-auto gap-1.5 overflow-x-auto rounded-lg border border-[#0a102e] bg-[#080d24]/80 p-1">
          {FILTERS.map((option) => (
            <TabsTrigger
              key={option.value}
              value={option.value}
              className="rounded px-3.5 py-1.5 font-chakra text-xs font-semibold uppercase tracking-wider text-sublimatio-tertiary data-[state=active]:border-blue-500 data-[state=active]:bg-sublimatio-accent/30 data-[state=active]:text-white data-[state=active]:shadow-[0_0_12px_rgba(26,57,237,0.25)]"
            >
              {option.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
        <div className="flex items-center gap-2">
          <Label
            htmlFor="sort-select"
            className="hidden font-chakra text-xs uppercase tracking-wider text-sublimatio-tertiary sm:inline"
          >
            Sort:
          </Label>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger
              id="sort-select"
              className="ui-input w-auto min-w-[168px] px-2.5 py-2 font-chakra text-xs"
            >
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ttl-asc">TTL: Expiring Soonest</SelectItem>
              <SelectItem value="ttl-desc">TTL: Longest First</SelectItem>
              <SelectItem value="name-asc">Name: A to Z</SelectItem>
              <SelectItem value="name-desc">Name: Z to A</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            type="text"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search items by name or content..."
            className="ui-input py-2 pl-9 pr-4 font-rajdhani text-xs"
          />
        </div>
      </div>
    </div>
  );
}
