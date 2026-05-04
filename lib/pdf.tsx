"use client";

import { Document, Page, Text, View, StyleSheet, pdf, Font } from "@react-pdf/renderer";
import type { Currency } from "./constants";
import type { ComparisonStats } from "./scoring";

Font.register({
  family: "Inter",
  fonts: [
    { src: "/fonts/Inter-Regular.woff" },
    { src: "/fonts/Inter-Bold.woff", fontWeight: "bold" },
  ],
});

const styles = StyleSheet.create({
  page: { padding: 36, fontFamily: "Inter", fontSize: 10, color: "#1f2937" },
  h1: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  meta: { fontSize: 9, color: "#6b7280", marginBottom: 16 },
  section: { marginBottom: 14 },
  h2: { fontSize: 12, fontWeight: "bold", marginBottom: 6, color: "#111827" },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e5e7eb", paddingVertical: 4 },
  cellLabel: { flex: 2 },
  cellNum: { flex: 1, textAlign: "right" },
  recommended: { backgroundColor: "#ecfdf5", padding: 8, borderRadius: 4, marginBottom: 12 },
  recHead: { fontSize: 9, color: "#065f46", marginBottom: 2 },
  recName: { fontSize: 14, fontWeight: "bold", color: "#065f46" },
  footer: { position: "absolute", bottom: 24, left: 36, right: 36, fontSize: 8, color: "#9ca3af", textAlign: "center" },
});

const fmt = (n: number) => new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(n);
const symbol: Record<Currency, string> = { TRY: "₺", USD: "$", EUR: "€" };

export type PdfPayload = {
  comparison: { name: string; type: string; currency: Currency; budget: number | null };
  stats: ComparisonStats;
  itemCount: number;
  firmsCount: number;
};

export function DecisionPdf({ comparison, stats, itemCount, firmsCount }: PdfPayload) {
  const recommended = stats.firms.find((f) => f.firmId === stats.recommendedFirmId);
  const lowest = stats.firms.find((f) => f.firmId === stats.lowestFirmId);
  const sym = symbol[comparison.currency];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>{comparison.name}</Text>
        <Text style={styles.meta}>
          {comparison.type} · {firmsCount} firma · {itemCount} kalem · {new Date().toLocaleDateString("tr-TR")}
        </Text>

        {recommended && recommended.recommendation !== "incomplete" && (
          <View style={styles.recommended}>
            <Text style={styles.recHead}>ÖNERİLEN FİRMA</Text>
            <Text style={styles.recName}>{recommended.firmName}</Text>
            <Text>
              Skor {recommended.totalScore.toFixed(1)} · Toplam {fmt(recommended.weightedTotal)} {sym} · Kapsam{" "}
              {Math.round(recommended.scope * 100)}%
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.h2}>Sıralama</Text>
          <View style={[styles.row, { backgroundColor: "#f3f4f6", fontWeight: "bold" }]}>
            <Text style={styles.cellLabel}>Firma</Text>
            <Text style={styles.cellNum}>Skor</Text>
            <Text style={styles.cellNum}>Kapsam</Text>
            <Text style={styles.cellNum}>Sapma</Text>
            <Text style={styles.cellNum}>Toplam</Text>
          </View>
          {stats.firms.map((f) => (
            <View key={f.firmId} style={styles.row}>
              <Text style={styles.cellLabel}>{f.firmName}</Text>
              <Text style={styles.cellNum}>{f.totalScore.toFixed(1)}</Text>
              <Text style={styles.cellNum}>{Math.round(f.scope * 100)}%</Text>
              <Text style={styles.cellNum}>
                {f.absDev !== null ? `${(f.absDev * 100).toFixed(1)}%` : "—"}
              </Text>
              <Text style={styles.cellNum}>
                {fmt(f.weightedTotal)} {sym}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>Karar Özeti</Text>
          <Text>
            • Medyan toplam:{" "}
            {stats.median !== null ? `${fmt(stats.median)} ${sym}` : "—"}
          </Text>
          <Text>
            • En düşük toplamlı firma: {lowest ? lowest.firmName : "—"}
          </Text>
          <Text>
            • Tam kapsamlı firma sayısı: {stats.firms.filter((f) => f.scope === 1).length}
          </Text>
          {comparison.budget && (
            <Text>
              • Bütçe: {fmt(comparison.budget)} {sym}
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>Skor Algoritması</Text>
          <Text>
            Skor 100 üzerinden: %40 kapsam (kaç kaleme teklif verildi) + %35 hedef sapma (medyandan uzaklık) + %25 en
            düşük teklif sayısı.
          </Text>
        </View>

        <Text style={styles.footer}>EPC Karar Destek · {new Date().toLocaleString("tr-TR")}</Text>
      </Page>
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
