"use client";

import { useState } from "react";
import { FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { exportToExcel, type ExcelExportFirm, type ExcelExportItem } from "@/lib/excel";
import {
  generateDecisionPdf,
  downloadBlob,
  type PdfPayload,
  type PdfBid,
  type PdfManualScore,
} from "@/lib/pdf";
import type { ComparisonStats } from "@/lib/scoring";
import type { Currency } from "@/lib/constants";
import type { MetricKey } from "@/lib/metrics";

export function ExportButtons({
  comparison,
  firms,
  items,
  prices,
  stats,
  manualScores,
  weights,
  allBids,
  projectName,
}: {
  comparison: { name: string; type: string; currency: Currency; budget: number | null };
  firms: ExcelExportFirm[];
  items: ExcelExportItem[];
  prices: Record<string, Record<string, number | null>>;
  stats: ComparisonStats;
  manualScores?: PdfManualScore[];
  weights?: Partial<Record<MetricKey, number>>;
  allBids?: PdfBid[];
  projectName?: string | null;
}) {
  const [pdfLoading, setPdfLoading] = useState(false);

  function handleExcel() {
    try {
      exportToExcel(comparison, firms, items, prices, stats);
      toast.success("Excel indirildi.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Excel oluşturulamadı");
    }
  }

  async function handlePdf() {
    setPdfLoading(true);
    try {
      const payload: PdfPayload = {
        comparison: { ...comparison, project_name: projectName ?? null },
        stats,
        items: items.map((it) => ({
          id: it.id,
          name: it.name,
          category: it.category,
          unit: it.unit,
          qty: it.qty,
          target_price: it.target_price,
        })),
        firms,
        prices,
        manualScores: manualScores ?? [],
        weights: weights ?? {},
        allBids: allBids ?? [],
      };
      const blob = await generateDecisionPdf(payload);
      const safeName = comparison.name.replace(/[^\w\s-]/g, "_");
      downloadBlob(blob, `${safeName}.pdf`);
      toast.success("PDF indirildi.");
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "PDF oluşturulamadı");
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handleExcel}>
        <FileSpreadsheet className="mr-1 size-4" /> Excel
      </Button>
      <Button variant="outline" size="sm" onClick={handlePdf} disabled={pdfLoading}>
        <FileText className="mr-1 size-4" /> {pdfLoading ? "PDF..." : "PDF"}
      </Button>
    </div>
  );
}
