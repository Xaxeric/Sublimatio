import { useEffect, useMemo, useState } from "react";

import { ENTITY_NAME } from "../data/payloads.js";
import { filterPayloads, sortPayloads } from "../utils/payload.js";
import AppHeader from "./AppHeader.jsx";
import FilterToolbar from "./FilterToolbar.jsx";
import InspectModal from "./InspectModal.jsx";
import PayloadForm from "./PayloadForm.jsx";
import PayloadList from "./PayloadList.jsx";
import PayloadStats from "./PayloadStats.jsx";
import Sidebar from "./Sidebar.jsx";
import SublimationLog from "./SublimationLog.jsx";

/**
 * Dashboard view. Receives the Payload array owned by App.jsx and composes the
 * entity components: header, stats, toolbar, list/cards, log and modals.
 */
export default function DashboardView({
  payloads,
  logs,
  onAddPayload,
  onSublimate,
  onCopy,
  onDownload,
  onConsumePending,
}) {
  const [showForm, setShowForm] = useState(false);
  const [inspectId, setInspectId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("ttl-asc");
  const [query, setQuery] = useState("");

  // Pick up payloads transmitted from the Client view (localStorage handoff).
  useEffect(() => {
    onConsumePending();
  }, [onConsumePending]);

  const visiblePayloads = useMemo(
    () => sortPayloads(filterPayloads(payloads, filter, query), sortBy),
    [payloads, filter, query, sortBy],
  );

  const inspected = payloads.find((payload) => payload.id === inspectId);

  return (
    <div className="relative min-h-screen">
      <div className="grid-img-decoration mask-img-w-radial" />

      <Sidebar />

      <main className="relative z-10 ml-[233px] flex min-h-screen flex-col gap-6 p-6 sm:p-8">
        <AppHeader
          title="Buffer"
          subtitle="Temporary data sync buffer between devices. Every file, link, and text payload contains an active circular countdown and will automatically sublimate (permanently delete from RAM) upon TTL expiry."
          actionLabel="Transmit Payload"
          onAction={() => setShowForm(true)}
        />

        <PayloadStats payloads={payloads} />

        <FilterToolbar
          filter={filter}
          sortBy={sortBy}
          query={query}
          onFilterChange={setFilter}
          onSortChange={setSortBy}
          onQueryChange={setQuery}
        />

        <section className="flex flex-1 flex-col space-y-3">
          <div className="flex items-center justify-between px-2 font-chakra text-xs uppercase tracking-wider text-sublimatio-tertiary">
            <span>{ENTITY_NAME} Payload &amp; Origin</span>
            <span>Circular TTL Expiration &amp; Actions</span>
          </div>

          <PayloadList
            payloads={visiblePayloads}
            entityName={ENTITY_NAME}
            onSublimate={onSublimate}
            onCopy={onCopy}
            onDownload={onDownload}
            onInspect={setInspectId}
          />
        </section>

        <SublimationLog logs={logs} />
      </main>

      {showForm && (
        <PayloadForm
          onAddPayload={onAddPayload}
          onClose={() => setShowForm(false)}
        />
      )}

      {inspected && (
        <InspectModal
          payload={inspected}
          onClose={() => setInspectId(null)}
          onCopy={onCopy}
        />
      )}
    </div>
  );
}
