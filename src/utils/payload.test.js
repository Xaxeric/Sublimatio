import { describe, expect, it } from "vitest";

import {
  calculateProgress,
  filterPayloads,
  formatShortTTL,
  formatTTL,
  getUrgencyLevel,
  sortPayloads,
  tickPayloads,
} from "./payload.js";

const payload = (overrides = {}) => ({
  id: "p-1",
  type: "file",
  name: "report.pdf",
  remainingTTL: 30,
  totalTTL: 300,
  isPinned: false,
  ...overrides,
});

describe("tickPayloads", () => {
  it("removes a payload that expires on this tick", () => {
    const result = tickPayloads([payload({ id: "a", remainingTTL: 1 })]);
    expect(result).toEqual([]);
  });

  it("decrements a survivor and keeps its other fields", () => {
    const input = payload({ id: "a", remainingTTL: 30 });
    const [result] = tickPayloads([input]);

    expect(result).toEqual({ ...input, remainingTTL: 29 });
    expect(result.id).toBe("a");
    expect(result.name).toBe("report.pdf");
  });

  it("handles a mix of expired and surviving payloads", () => {
    const input = [
      payload({ id: "expiring", remainingTTL: 1 }),
      payload({ id: "surviving", remainingTTL: 90 }),
    ];

    const result = tickPayloads(input);

    expect(result.map((item) => item.id)).toEqual(["surviving"]);
    expect(result[0].remainingTTL).toBe(89);
  });

  it("returns an empty array for an empty list", () => {
    expect(tickPayloads([])).toEqual([]);
  });

  it("removes a payload already at 0", () => {
    expect(tickPayloads([payload({ id: "a", remainingTTL: 0 })])).toEqual([]);
  });

  it("does not mutate the input array or its payloads", () => {
    const input = [
      payload({ id: "a", remainingTTL: 5 }),
      payload({ id: "b", remainingTTL: 1 }),
    ];
    const snapshot = JSON.parse(JSON.stringify(input));

    const result = tickPayloads(input);

    expect(input).toEqual(snapshot);
    expect(result[0]).not.toBe(input[0]);
    expect(input[0].remainingTTL).toBe(5);
  });
});

describe("formatTTL", () => {
  it("formats sub-minute and zero values", () => {
    expect(formatTTL(0)).toBe("0s");
    expect(formatTTL(1)).toBe("1s");
    expect(formatTTL(45)).toBe("45s");
  });

  it("formats whole and partial minutes", () => {
    expect(formatTTL(60)).toBe("1m");
    expect(formatTTL(125)).toBe("2m 5s");
  });
});

describe("formatShortTTL", () => {
  it("drops the seconds part", () => {
    expect(formatShortTTL(0)).toBe("0s");
    expect(formatShortTTL(1)).toBe("1s");
    expect(formatShortTTL(59)).toBe("59s");
    expect(formatShortTTL(60)).toBe("1m");
    expect(formatShortTTL(125)).toBe("2m");
  });
});

describe("calculateProgress", () => {
  it("returns 0 when totalTTL is not positive", () => {
    expect(calculateProgress(30, 0)).toBe(0);
    expect(calculateProgress(30, -1)).toBe(0);
  });

  it("clamps the ratio into 0..1", () => {
    expect(calculateProgress(300, 300)).toBe(1);
    expect(calculateProgress(0, 300)).toBe(0);
    expect(calculateProgress(600, 300)).toBe(1);
    expect(calculateProgress(150, 300)).toBe(0.5);
  });
});

describe("getUrgencyLevel", () => {
  it("classifies by remaining TTL boundaries", () => {
    expect(getUrgencyLevel(0)).toBe("critical");
    expect(getUrgencyLevel(15)).toBe("critical");
    expect(getUrgencyLevel(16)).toBe("warning");
    expect(getUrgencyLevel(60)).toBe("warning");
    expect(getUrgencyLevel(61)).toBe("normal");
  });
});

describe("filterPayloads", () => {
  const list = [
    payload({ id: "a", type: "file", name: "Token.pem" }),
    payload({ id: "b", type: "text", name: "Note", content: "hello world" }),
  ];

  it("keeps everything for the all filter and an empty query", () => {
    expect(filterPayloads(list, "all", "").map((p) => p.id)).toEqual([
      "a",
      "b",
    ]);
  });

  it("filters by type and by case-insensitive content match", () => {
    expect(filterPayloads(list, "file", "").map((p) => p.id)).toEqual(["a"]);
    expect(filterPayloads(list, "all", "WORLD").map((p) => p.id)).toEqual([
      "b",
    ]);
    expect(filterPayloads(list, "all", "nomatch")).toEqual([]);
  });
});

describe("sortPayloads", () => {
  const list = [
    payload({ id: "a", name: "Charlie", remainingTTL: 60 }),
    payload({ id: "b", name: "alpha", remainingTTL: 10 }),
  ];

  it("sorts by TTL in both directions", () => {
    expect(sortPayloads(list, "ttl-asc").map((p) => p.id)).toEqual(["b", "a"]);
    expect(sortPayloads(list, "ttl-desc").map((p) => p.id)).toEqual(["a", "b"]);
  });

  it("sorts by name and leaves the input untouched", () => {
    const snapshot = list.map((p) => p.id);

    expect(sortPayloads(list, "name-asc").map((p) => p.id)).toEqual(["b", "a"]);
    expect(sortPayloads(list, "name-desc").map((p) => p.id)).toEqual(["a", "b"]);
    expect(list.map((p) => p.id)).toEqual(snapshot);
  });

  it("returns the original order for an unknown sort key", () => {
    expect(sortPayloads(list, "unknown").map((p) => p.id)).toEqual(["a", "b"]);
  });
});