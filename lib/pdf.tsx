"use client";

import { Document, Page, Text, View, StyleSheet, pdf, Font } from "@react-pdf/renderer";
import type { Currency } from "./constants";
import type { ComparisonStats } from "./scoring";
import { METRICS, type MetricKey } from "./metrics";

Font.register({
  family: "Inter",
  fonts: [
    { src: "/fonts/Inter-Regular.woff" },
    { src: "/fonts/Inter-Bold.woff", fontWeight: "bold" },
  ],
});

const styles = StyleSheet.create({
  page: { padding: 32, fontFamily: "Inter", fontSize: 9, color: "#1f2937" },
  h1: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  meta: { fontSize: 8, color: "#6b7280", marginBottom: 12 },
  section: { marginBottom: 14 },
  h2: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#111827",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 3,
  },
  rowHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    fontWeight: "bold",
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  row: {
    flexDirection: "row",
    paddingVertical: 3,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
  },
  recommended: {
    backgroundColor: "#ecfdf5",
    padding: 8,
    borderRadius: 4,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#10b981",
  },
  recHead: { fontSize: 7, color: "#065f46", marginBottom: 2, textTransform: "uppercase" },
  recName: { fontSize: 13, fontWeight: "bold", color: "#065f46" },
  noteBox: {
    backgroundColor: "#f9fafb",
    padding: 4,
    marginTop: 2,
    borderRadius: 2,
    fontSize: 8,
    color: "#4b5563",
  },
  footer: {
    position: "absolute",
    bottom: 16,
    left: 32,
    right: 32,
    fontSize: 7,
    color: "#9ca3af",
    textAlign: "center",
  },
});

const fmt = (n: number) => new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(n);
const symbol: Record<Currency, string> = { TRY: "₺", USD: "$", EUR: "€" };

export type PdfItem = {
  id: string;
  name: string;
  category: string;
  unit: string | null;
  qty: number;
  target_price: number | null;
};

export type PdfFirm = { id: string; name: string };
export type PdfManualScore = {
  firm_id: string;
  metric_key: MetricKey;
  score: number;
  notes: string | null;
};
export type PdfBid = { item_id: string; firm_id: string; price: number | null; revision: number };

export type PdfPayload = {
  comparison: { name: string; type: string; currency: Currency; budget: number | null; project_name?: string | null };
  stats: ComparisonStats;
  items: PdfItem[];
  firms: PdfFirm[];
  prices: Record<string, Record<string, number | null>>; // current/latest revision
  manualScores: PdfManualScore[];
  weights: Partial<Record<MetricKey, number>>;
  allBids?: PdfBid[]; // tüm revizeler
};

export function DecisionPdf({
  comparison,
  stats,
  items,
  firms,
  prices,
  manualScores,
  weights,
  allBids,
}: PdfPayload) {
  const recommended = stats.firms.find((f) => f.firmId === stats.recommendedFirmId);
  const lowest = stats.firms.find((f) => f.firmId === stats.lowestFirmId);
  const sym = symbol[comparison.currency];
  const activeMetricKeys = (Object.keys(weights) as MetricKey[]).filter((k) => (weights[k] ?? 0) > 0);

  const revisions = allBids
    ? Array.from(new Set(allBids.map((b) => b.revision))).sort((a, b) => a - b)
    : [];

  // Firma bazında manuel notları indexle
  const notesByFirm: Record<string, PdfManualScore[]> = {};
  for (const m of manualScores) {
    if (!notesByFirm[m.firm_id]) notesByFirm[m.firm_id] = [];
    notesByFirm[m.firm_id].push(m);
  }

  return (
    <Document>
      {/* Sayfa 1: Karar Özeti + Sıralama + Skor Dağılımı */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>{comparison.name}</Text>
        <Text style={styles.meta}>
          {comparison.type}
          {comparison.project_name ? ` · ${comparison.project_name}` : ""} · {firms.length} firma · {items.length}{" "}
          kalem · Hedef Toplam: {fmt(stats.totalTarget)} {sym} ·{" "}
          {new Date().toLocaleDateString("tr-TR")}
        </Text>

        {recommended && recommended.recommendation !== "incomplete" && (
          <View style={styles.recommended}>
            <Text style={styles.recHead}>ÖNERİLEN FİRMA</Text>
            <Text style={styles.recName}>{recommended.firmName}</Text>
            <Text>
              Skor {recommended.totalScore.toFixed(1)}/100 · Toplam {fmt(recommended.weightedTotal)} {sym} · Kapsam{" "}
              {Math.round(recommended.scope * 100)}%
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.h2}>Sıralama (Skor Bazlı)</Text>
          <View style={styles.rowHeader}>
            <Text style={{ flex: 0.4 }}>#</Text>
            <Text style={{ flex: 2.5 }}>Firma</Text>
            <Text style={{ flex: 1, textAlign: "right" }}>Skor</Text>
            <Text style={{ flex: 1, textAlign: "right" }}>Kapsam</Text>
            <Text style={{ flex: 1, textAlign: "right" }}>Sapma</Text>
            <Text style={{ flex: 1.4, textAlign: "right" }}>Toplam</Text>
            <Text style={{ flex: 1, textAlign: "right" }}>Anomali</Text>
          </View>
          {stats.firms.map((f, idx) => (
            <View key={f.firmId} style={styles.row}>
              <Text style={{ flex: 0.4 }}>{idx + 1}</Text>
              <Text style={{ flex: 2.5 }}>{f.firmName}</Text>
              <Text style={{ flex: 1, textAlign: "right", fontWeight: "bold" }}>
                {f.totalScore.toFixed(1)}
              </Text>
              <Text style={{ flex: 1, textAlign: "right" }}>{Math.round(f.scope * 100)}%</Text>
              <Text style={{ flex: 1, textAlign: "right" }}>
                {f.absDev !== null ? `${(f.absDev * 100).toFixed(1)}%` : "—"}
              </Text>
              <Text style={{ flex: 1.4, textAlign: "right" }}>
                {fmt(f.weightedTotal)} {sym}
              </Text>
              <Text style={{ flex: 1, textAlign: "right", color: f.isOutlier ? "#dc2626" : "#9ca3af" }}>
                {f.isOutlier ? "EVET" : "—"}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>Karar Özeti</Text>
          <Text>• Hedef toplam: {fmt(stats.totalTarget)} {sym}</Text>
          <Text>• Medyan firma toplamı: {stats.median !== null ? `${fmt(stats.median)} ${sym}` : "—"}</Text>
          <Text>• En düşük toplamlı firma: {lowest ? lowest.firmName : "—"}</Text>
          <Text>• Anomali firma sayısı: {stats.firms.filter((f) => f.isOutlier).length}</Text>
          <Text>• Tam kapsamlı firma sayısı: {stats.firms.filter((f) => f.scope === 1).length}</Text>
          <Text>
            • Aktif metrikler:{" "}
            {activeMetricKeys.map((k) => `${METRICS[k].label} %${weights[k]}`).join(" · ")}
          </Text>
        </View>

        <Text style={styles.footer}>
          EPC Karar Destek · Sayfa 1 · {new Date().toLocaleString("tr-TR")}
        </Text>
      </Page>

      {/* Sayfa 2: Skor Dökümü */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h2}>Skor Dökümü — Metrik Bazlı (0-100 üzerinden)</Text>
        <View style={styles.rowHeader}>
          <Text style={{ flex: 2 }}>Firma</Text>
          {activeMetricKeys.map((k) => (
            <Text key={k} style={{ flex: 1, textAlign: "right" }}>
              {METRICS[k].label} (%{weights[k]})
            </Text>
          ))}
          <Text style={{ flex: 1, textAlign: "right", fontWeight: "bold" }}>Toplam</Text>
        </View>
        {stats.firms.map((f) => (
          <View key={f.firmId} style={styles.row}>
            <Text style={{ flex: 2 }}>{f.firmName}</Text>
            {activeMetricKeys.map((k) => (
              <Text key={k} style={{ flex: 1, textAlign: "right" }}>
                {(f.metricScores[k] ?? 0).toFixed(0)}
              </Text>
            ))}
            <Text style={{ flex: 1, textAlign: "right", fontWeight: "bold" }}>
              {f.totalScore.toFixed(1)}
            </Text>
          </View>
        ))}

        <View style={[styles.section, { marginTop: 16 }]}>
          <Text style={styles.h2}>Toplam Bedel — Hedef Karşılaştırma</Text>
          <View style={styles.rowHeader}>
            <Text style={{ flex: 2 }}>Firma</Text>
            <Text style={{ flex: 1, textAlign: "right" }}>Toplam</Text>
            <Text style={{ flex: 1, textAlign: "right" }}>Hedef Sapma</Text>
          </View>
          <View style={styles.row}>
            <Text style={{ flex: 2, fontWeight: "bold" }}>HEDEF (Bütçe)</Text>
            <Text style={{ flex: 1, textAlign: "right", fontWeight: "bold" }}>
              {fmt(stats.totalTarget)} {sym}
            </Text>
            <Text style={{ flex: 1, textAlign: "right" }}>—</Text>
          </View>
          {stats.firms.map((f) => {
            const dev = stats.totalTarget > 0 ? ((f.weightedTotal - stats.totalTarget) / stats.totalTarget) * 100 : null;
            return (
              <View key={f.firmId} style={styles.row}>
                <Text style={{ flex: 2 }}>{f.firmName}</Text>
                <Text style={{ flex: 1, textAlign: "right" }}>
                  {fmt(f.weightedTotal)} {sym}
                </Text>
                <Text
                  style={{
                    flex: 1,
                    textAlign: "right",
                    color: dev !== null && dev > 5 ? "#dc2626" : dev !== null && dev < -2 ? "#059669" : "#1f2937",
                  }}
                >
                  {dev !== null ? `${dev > 0 ? "+" : ""}${dev.toFixed(1)}%` : "—"}
                </Text>
              </View>
            );
          })}
        </View>

        <Text style={styles.footer}>EPC Karar Destek · Sayfa 2 · Skor Dökümü</Text>
      </Page>

      {/* Sayfa 3: Kalem Bazında Fiyatlar */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h2}>Kalem Bazında Fiyatlar (Son Revize)</Text>
        <View style={styles.rowHeader}>
          <Text style={{ flex: 2.5 }}>Kalem</Text>
          <Text style={{ flex: 0.8, textAlign: "right" }}>Hedef</Text>
          {firms.map((f) => (
            <Text key={f.id} style={{ flex: 1, textAlign: "right" }}>
              {f.name}
            </Text>
          ))}
        </View>
        {items.map((it) => {
          const cellPrices = firms.map((f) => prices[it.id]?.[f.id]).filter((p): p is number => p !== null && p !== undefined);
          const minPrice = cellPrices.length > 0 ? Math.min(...cellPrices) : null;
          return (
            <View key={it.id} style={styles.row}>
              <View style={{ flex: 2.5 }}>
                <Text>{it.name}</Text>
                <Text style={{ fontSize: 7, color: "#6b7280" }}>
                  {it.category} · {it.qty} {it.unit ?? ""}
                </Text>
              </View>
              <Text style={{ flex: 0.8, textAlign: "right" }}>
                {it.target_price !== null ? fmt(it.target_price) : "—"}
              </Text>
              {firms.map((f) => {
                const p = prices[it.id]?.[f.id];
                const isMin = p !== null && p !== undefined && p === minPrice;
                return (
                  <Text
                    key={f.id}
                    style={{
                      flex: 1,
                      textAlign: "right",
                      fontWeight: isMin ? "bold" : "normal",
                      color: isMin ? "#065f46" : "#1f2937",
                    }}
                  >
                    {p !== null && p !== undefined ? fmt(p) : "—"}
                  </Text>
                );
              })}
            </View>
          );
        })}

        <Text style={styles.footer}>EPC Karar Destek · Sayfa 3 · Kalem Fiyatları</Text>
      </Page>

      {/* Sayfa 4: Revize Karşılaştırması (varsa) */}
      {revisions.length >= 2 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.h2}>Revize Karşılaştırması</Text>
          <View style={styles.rowHeader}>
            <Text style={{ flex: 2 }}>Firma</Text>
            {revisions.map((r) => (
              <Text key={r} style={{ flex: 1, textAlign: "right" }}>
                Rev {r}
              </Text>
            ))}
            <Text style={{ flex: 1, textAlign: "right" }}>İlk → Son Δ</Text>
          </View>
          {firms.map((f) => {
            const totalsByRev: Record<number, number> = {};
            for (const r of revisions) {
              let sum = 0;
              for (const it of items) {
                const p = (allBids ?? []).find(
                  (b) => b.firm_id === f.id && b.item_id === it.id && b.revision === r
                )?.price;
                if (p !== null && p !== undefined) sum += p * it.qty;
              }
              totalsByRev[r] = sum;
            }
            const first = totalsByRev[revisions[0]];
            const last = totalsByRev[revisions[revisions.length - 1]];
            const dlt = first > 0 ? ((last - first) / first) * 100 : 0;
            return (
              <View key={f.id} style={styles.row}>
                <Text style={{ flex: 2 }}>{f.name}</Text>
                {revisions.map((r) => (
                  <Text key={r} style={{ flex: 1, textAlign: "right" }}>
                    {fmt(totalsByRev[r])} {sym}
                  </Text>
                ))}
                <Text
                  style={{
                    flex: 1,
                    textAlign: "right",
                    color: dlt < 0 ? "#059669" : dlt > 0 ? "#dc2626" : "#1f2937",
                  }}
                >
                  {dlt > 0 ? "+" : ""}
                  {dlt.toFixed(1)}%
                </Text>
              </View>
            );
          })}

          <Text style={styles.footer}>EPC Karar Destek · Sayfa 4 · Revize Karşılaştırması</Text>
        </Page>
      )}

      {/* Sayfa 5: Manuel Skor Notları (varsa) */}
      {Object.keys(notesByFirm).length > 0 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.h2}>Manuel Skor Notları</Text>
          {firms.map((f) => {
            const notes = notesByFirm[f.id] ?? [];
            if (notes.filter((n) => n.notes).length === 0) return null;
            return (
              <View key={f.id} style={[styles.section, { marginBottom: 8 }]}>
                <Text style={{ fontSize: 10, fontWeight: "bold", marginBottom: 3 }}>{f.name}</Text>
                {notes.map((n, idx) => {
                  if (!n.notes) return null;
                  return (
                    <View key={idx} style={{ marginBottom: 3 }}>
                      <Text style={{ fontSize: 8, fontWeight: "bold" }}>
                        {METRICS[n.metric_key]?.label ?? n.metric_key} ({Math.round(n.score / 10)}/10)
                      </Text>
                      <Text style={styles.noteBox}>{n.notes}</Text>
                    </View>
                  );
                })}
              </View>
            );
          })}

          <Text style={styles.footer}>EPC Karar Destek · Manuel Skor Notları</Text>
        </Page>
      )}
    </Document>
  );
}

export async function generateDecisionPdf(payload: PdfPayload): Promise<Blob> {
  const blob = await pdf(<DecisionPdf {...payload} />).toBlob();
  return blob;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
