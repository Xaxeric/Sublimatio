// Pure utility helpers for the Payload entity. No DOM access, no side effects.

export const CIRCLE_RADIUS = 15;
export const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS; // ~94.25

export function formatTTL(seconds) {
  if (seconds <= 0) return "0s";
  if (seconds < 60) return seconds + "s";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs === 0 ? mins + "m" : mins + "m " + secs + "s";
}

export function formatShortTTL(seconds) {
  if (seconds <= 0) return "0s";
  if (seconds < 60) return seconds + "s";
  return Math.floor(seconds / 60) + "m";
}

export function calculateProgress(remainingTTL, totalTTL) {
  if (totalTTL <= 0) return 0;
  return Math.max(0, Math.min(1, remainingTTL / totalTTL));
}

export function getUrgencyLevel(remainingTTL) {
  if (remainingTTL <= 15) return "critical";
  if (remainingTTL <= 60) return "warning";
  return "normal";
}

export function filterPayloads(payloadList, filterType, query) {
  return payloadList.filter((payload) => {
    const matchesType = filterType === "all" || payload.type === filterType;

    let matchesSearch = true;
    if (query && query.length > 0) {
      const q = query.toLowerCase();
      const inName = payload.name && payload.name.toLowerCase().includes(q);
      const inContent =
        payload.content && payload.content.toLowerCase().includes(q);
      const inUrl = payload.url && payload.url.toLowerCase().includes(q);
      matchesSearch = inName || inContent || inUrl;
    }

    return matchesType && matchesSearch;
  });
}

export function sortPayloads(payloadList, sortBy) {
  const listCopy = payloadList.slice();
  return listCopy.sort((a, b) => {
    switch (sortBy) {
      case "ttl-asc":
        return a.remainingTTL - b.remainingTTL;
      case "ttl-desc":
        return b.remainingTTL - a.remainingTTL;
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });
}

export function makeHash() {
  return (
    "sha256:" +
    Math.random().toString(36).substring(2) +
    Math.random().toString(36).substring(2)
  );
}

export function countByType(payloadList) {
  return payloadList.reduce(
    (acc, payload) => {
      acc.total += 1;
      acc[payload.type] = (acc[payload.type] || 0) + 1;
      if (payload.remainingTTL <= 60) acc.expiring += 1;
      return acc;
    },
    { total: 0, file: 0, link: 0, text: 0, expiring: 0 },
  );
}
