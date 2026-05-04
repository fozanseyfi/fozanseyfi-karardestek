import { describe, expect, it } from "vitest";
import { calcStats } from "./scoring";

describe("calcStats (multi-metric)", () => {
  it("scores firms with auto metrics only", () => {
    const firms = [
      { id: "f1", name: "A" },
      { id: "f2", name: "B" },
    ];
    const items = [
      { id: "i1", name: "Item 1", target: 100, qty: 10 },
      { id: "i2", name: "Item 2", target: 200, qty: 5 },
    ];
    const prices = {
      i1: { f1: 100, f2: 110 },
      i2: { f1: 200, f2: 210 },
    };
    const weights = { scope: 40, deviation: 35, lowest: 25 };

    const stats = calcStats(firms, items, prices, {}, weights);

    expect(stats.firms).toHaveLength(2);
    expect(stats.totalTarget).toBe(100 * 10 + 200 * 5);
    expect(stats.firms[0].totalScore).toBeGreaterThan(0);
  });

  it("incorporates manual scores when weights set", () => {
    const firms = [{ id: "f1", name: "A" }];
    const items = [{ id: "i1", name: "x", target: 100, qty: 1 }];
    const prices = { i1: { f1: 100 } };
    const manualScores = { f1: { technical: 80, references: 60 } };
    const weights = { scope: 20, deviation: 10, technical: 50, references: 20 };

    const stats = calcStats(firms, items, prices, manualScores, weights);
    expect(stats.firms[0].metricScores.technical).toBe(80);
    expect(stats.firms[0].metricScores.references).toBe(60);
    expect(stats.firms[0].totalScore).toBeGreaterThan(0);
  });

  it("flags outliers via IQR", () => {
    const firms = Array.from({ length: 5 }, (_, i) => ({ id: `f${i}`, name: `F${i}` }));
    const items = [{ id: "i1", name: "x", target: 100, qty: 1 }];
    // 4 firmaya 100 civarı, 1'ine 10000 (outlier)
    const prices = {
      i1: { f0: 95, f1: 100, f2: 105, f3: 110, f4: 10000 },
    };
    const stats = calcStats(firms, items, prices, {}, { scope: 100 });
    const outlierFirm = stats.firms.find((f) => f.firmName === "F4");
    expect(outlierFirm?.isOutlier).toBe(true);
  });

  it("incomplete when no prices given", () => {
    const firms = [{ id: "f1", name: "A" }];
    const items = [{ id: "i1", name: "x", target: 100, qty: 1 }];
    const stats = calcStats(firms, items, {}, {}, { scope: 100 });
    expect(stats.firms[0].recommendation).toBe("incomplete");
  });
});
