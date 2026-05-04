import { describe, expect, it } from "vitest";
import { calcStats } from "./scoring";

describe("calcStats", () => {
  it("scores firms with full coverage and matching median highest", () => {
    const firms = [
      { id: "f1", name: "Firma A" },
      { id: "f2", name: "Firma B" },
      { id: "f3", name: "Firma C" },
    ];
    const items = [
      { id: "i1", name: "Item 1", target: 100, qty: 10 },
      { id: "i2", name: "Item 2", target: 200, qty: 5 },
    ];
    const prices = {
      i1: { f1: 100, f2: 110, f3: 95 },
      i2: { f1: 200, f2: 210, f3: 220 },
    };

    const stats = calcStats(firms, items, prices);

    expect(stats.firms).toHaveLength(3);
    expect(stats.median).not.toBeNull();
    expect(stats.firms[0].score).toBeGreaterThan(0);
    for (const f of stats.firms) {
      expect(f.scope).toBe(1);
      expect(f.totalItems).toBe(2);
      expect(f.filledCount).toBe(2);
    }
  });

  it("gives partial scope score when some prices missing", () => {
    const firms = [{ id: "f1", name: "A" }];
    const items = [
      { id: "i1", name: "x", target: 100, qty: 1 },
      { id: "i2", name: "y", target: 100, qty: 1 },
    ];
    const prices = { i1: { f1: 100 }, i2: { f1: null } };
    const stats = calcStats(firms, items, prices);
    expect(stats.firms[0].scope).toBe(0.5);
    expect(stats.firms[0].filledCount).toBe(1);
  });

  it("returns incomplete recommendation when no prices given", () => {
    const firms = [{ id: "f1", name: "A" }];
    const items = [{ id: "i1", name: "x", target: 100, qty: 1 }];
    const stats = calcStats(firms, items, {});
    expect(stats.firms[0].recommendation).toBe("incomplete");
    expect(stats.firms[0].score).toBe(0);
  });

  it("ranks firms by score desc", () => {
    const firms = [
      { id: "low", name: "Düşük" },
      { id: "high", name: "Yüksek" },
    ];
    const items = [{ id: "i1", name: "x", target: 100, qty: 1 }];
    const prices = { i1: { low: 1000, high: 100 } };
    const stats = calcStats(firms, items, prices);
    expect(stats.firms[0].score).toBeGreaterThanOrEqual(stats.firms[1].score);
  });
});
