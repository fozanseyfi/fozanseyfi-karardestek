import * as XLSX from "xlsx";
import type { Currency, ItemCategory } from "./constants";
import { ITEM_CATEGORIES } from "./constants";
import type { ComparisonStats } from "./scoring";

export type ExcelImportRow = {
  name: string;
  category: ItemCategory;
  unit: string | null;
  qty: number;
  target_price: number | null;
  prices: Record<string, number | null>;
};

export type ExcelImportResult = {
  firms: string[];
  items: ExcelImportRow[];
  errors: string[];
};

/**
 * Beklenen Excel format:
 * | Kalem | Kategori | Birim | Miktar | Hedef | Firma1 | Firma2 | ... |
 * İlk satır: header
 * Diğer satırlar: kalem verileri
 */
export function parseExcelImport(buffer: ArrayBuffer): ExcelImportResult {
  const errors: string[] = [];
  const wb = XLSX.read(buffer, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  if (!sheet) return { firms: [], items: [], errors: ["Excel dosyasında sayfa bulunamadı."] };

  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null });
  if (json.length === 0) return { firms: [], items: [], errors: ["Excel dosyası boş."] };

  const headers = Object.keys(json[0]);
  const reservedHeaders = ["kalem", "kategori", "birim", "miktar", "hedef"];
  const firmHeaders = headers.filter((h) => !reservedHeaders.includes(h.toLowerCase()));

  if (firmHeaders.length === 0) errors.push("Firma sütunları bulunamadı (Kalem,Kategori,Birim,Miktar,Hedef sütunlarından sonraki kolonlar firma olmalı).");

  const items: ExcelImportRow[] = [];
  for (const row of json) {
    const name = String(row["Kalem"] ?? row["kalem"] ?? "").trim();
    if (!name) continue;

    const cat = String(row["Kategori"] ?? row["kategori"] ?? "Diğer").trim();
    const category: ItemCategory = (ITEM_CATEGORIES as readonly string[]).includes(cat)
      ? (cat as ItemCategory)
      : "Diğer";

    const unit = row["Birim"] ?? row["birim"];
    const qty = Number(row["Miktar"] ?? row["miktar"] ?? 1);
    const target = row["Hedef"] ?? row["hedef"];

    const prices: Record<string, number | null> = {};
    for (const fh of firmHeaders) {
      const v = row[fh];
      prices[fh] = v === null || v === undefined || v === "" ? null : Number(v);
    }

    items.push({
      name,
      category,
      unit: unit ? String(unit) : null,
      qty: Number.isFinite(qty) ? qty : 1,
      target_price: target === null || target === undefined || target === "" ? null : Number(target),
      prices,
    });
  }

  return { firms: firmHeaders, items, errors };
}

export type ExcelExportComparison = {
  name: string;
  type: string;
  currency: Currency;
  budget: number | null;
};

export type ExcelExportFirm = { id: string; name: string };
export type ExcelExportItem = {
  id: string;
  name: string;
  category: string;
  unit: string | null;
  qty: number;
  target_price: number | null;
};

export function exportToExcel(
  comparison: ExcelExportComparison,
  firms: ExcelExportFirm[],
  items: ExcelExportItem[],
  prices: Record<string, Record<string, number | null>>,
  stats: ComparisonStats
) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Fiyat Matrisi
  const priceRows: Array<Record<string, string | number | null>> = items.map((it) => {
    const row: Record<string, string | number | null> = {
      Kalem: it.name,
      Kategori: it.category,
      Birim: it.unit ?? "",
      Miktar: it.qty,
      Hedef: it.target_price ?? null,
    };
    for (const f of firms) {
      row[f.name] = prices[it.id]?.[f.id] ?? null;
    }
    return row;
  });
  const ws1 = XLSX.utils.json_to_sheet(priceRows);
  XLSX.utils.book_append_sheet(wb, ws1, "Fiyat Matrisi");

  // Sheet 2: Sıralama
  const rankRows = stats.firms.map((f, idx) => ({
    Sıra: idx + 1,
    Firma: f.firmName,
    Skor: f.score,
    "Kapsam %": Math.round(f.scope * 100),
    "Sapma %": f.absDev !== null ? Math.round(f.absDev * 1000) / 10 : "",
    "Ağırlıklı Toplam": Math.round(f.weightedTotal),
    "En Düşük Sayısı": f.lowCount,
  }));
  const ws2 = XLSX.utils.json_to_sheet(rankRows);
  XLSX.utils.book_append_sheet(wb, ws2, "Sıralama");

  // Download
  XLSX.writeFile(wb, `${comparison.name.replace(/[^\w\s-]/g, "_")}.xlsx`);
}
