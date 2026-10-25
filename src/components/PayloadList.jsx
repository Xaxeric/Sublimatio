import EmptyState from "./EmptyState.jsx";
import PayloadCard from "./PayloadCard.jsx";

/**
 * Renders the payload list with `.map()` and a unique `key` per item,
 * or the empty state when nothing matches.
 *
 * @param {Array} payloads List of Payload entities (already filtered/sorted).
 * @param {string} entityName Entity label used by the empty state.
 */
export default function PayloadList({
  payloads,
  entityName,
  onSublimate,
  onCopy,
  onDownload,
  onInspect,
}) {
  if (payloads.length === 0) {
    return <EmptyState entityName={entityName} />;
  }

  return (
    <div className="space-y-3">
      {payloads.map((payload) => (
        <PayloadCard
          key={payload.id}
          payload={payload}
          onSublimate={onSublimate}
          onCopy={onCopy}
          onDownload={onDownload}
          onInspect={onInspect}
        />
      ))}
    </div>
  );
}
