import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Mail, Phone, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { formatCompactCurrency } from "@/lib/currency";
import { METRICS, scoreLabel, hundredToTen, type MetricKey } from "@/lib/metrics";
import type { Currency } from "@/lib/constants";

export default async function FirmDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: firm } = await supabase.from("firms").select("*").eq("id", id).single();
  if (!firm) notFound();

  const [{ data: comparisonRows }, { data: history }, { data: scoreRows }] = await Promise.all([
    supabase
      .from("comparison_firms")
      .select("comparison_id, comparisons (id, name, type, status, currency, project_id, created_at)")
      .eq("firm_id", id),
    supabase
      .from("firm_price_history")
      .select("*")
      .eq("firm_id", id)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("firm_manual_scores")
      .select("metric_key, score, notes, comparison_id, comparisons (name)")
      .eq("firm_id", id)
      .not("notes", "is", null),
  ]);

  type CompRow = { id: string; name: string; type: string; status: string; currency: string; project_id: string | null; created_at: string };
  const comparisons = (comparisonRows ?? [])
    .map((cf) => {
      const c = (cf as { comparisons: CompRow | CompRow[] | null }).comparisons;
      return Array.isArray(c) ? c[0] : c;
    })
    .filter((c): c is CompRow => !!c)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  // Proje isimleri
  const projectIds = Array.from(new Set(comparisons.map((c) => c.project_id).filter((x): x is string => !!x)));
  const projectMap = new Map<string, string>();
  if (projectIds.length > 0) {
    const { data: projs } = await supabase.from("projects").select("id, name").in("id", projectIds);
    for (const p of projs ?? []) projectMap.set(p.id, p.name);
  }

  type ScoreRowDb = {
    metric_key: string;
    score: number;
    notes: string | null;
    comparison_id: string;
    comparisons: { name: string } | { name: string }[] | null;
  };
  const notes = (scoreRows ?? []).map((r) => {
    const row = r as unknown as ScoreRowDb;
    const c = Array.isArray(row.comparisons) ? row.comparisons[0] : row.comparisons;
    return {
      metric: row.metric_key as MetricKey,
      score: Number(row.score),
      note: row.notes ?? "",
      comparisonId: row.comparison_id,
      comparisonName: c?.name ?? "—",
    };
  });

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/firms">
          <ChevronLeft className="mr-1 size-4" /> Firmalar
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{firm.name}</CardTitle>
          <CardDescription className="space-y-1 pt-2">
            {firm.contact_name && <div>Yetkili: {firm.contact_name}</div>}
            <div className="flex flex-wrap gap-3 text-sm">
              {firm.contact_email && (
                <a href={`mailto:${firm.contact_email}`} className="flex items-center gap-1 hover:underline">
                  <Mail className="size-3" /> {firm.contact_email}
                </a>
              )}
              {firm.contact_phone && (
                <span className="flex items-center gap-1">
                  <Phone className="size-3" /> {firm.contact_phone}
                </span>
              )}
            </div>
            {firm.notes && (
              <div className="text-foreground mt-2 text-sm whitespace-pre-line">{firm.notes}</div>
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Karşılaştırma listesi */}
      <Card>
        <CardHeader>
          <CardTitle>Karşılaştırmalar ({comparisons.length})</CardTitle>
          <CardDescription>Bu firmanın katıldığı tüm karşılaştırmalar</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {comparisons.length === 0 ? (
            <p className="text-muted-foreground p-4 text-sm">Henüz hiçbir karşılaştırmada yer almadı.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Karşılaştırma</TableHead>
                  <TableHead>Tür</TableHead>
                  <TableHead>Proje</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Tarih</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisons.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Link href={`/comparisons/${c.id}`} className="font-medium hover:underline">
                        {c.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{c.type}</Badge>
                    </TableCell>
                    <TableCell>
                      {c.project_id ? (
                        <Link href={`/projects/${c.project_id}`} className="text-sm hover:underline">
                          {projectMap.get(c.project_id) ?? "—"}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={c.status === "decided" ? "default" : "outline"}>{c.status}</Badge>
                    </TableCell>
                    <TableCell>{new Date(c.created_at).toLocaleDateString("tr-TR")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Manuel skor notları (ödeme şartları, finansal vs.) */}
      {notes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Değerlendirme Notları</CardTitle>
            <CardDescription>
              Karşılaştırmalarda bu firma için yazılmış manuel metrik notları
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {notes.map((n, idx) => (
                <li key={idx} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{METRICS[n.metric]?.label ?? n.metric}</Badge>
                      <Badge className="bg-blue-100 text-blue-700">
                        {hundredToTen(n.score)}/10 — {scoreLabel(hundredToTen(n.score))}
                      </Badge>
                    </div>
                    <Link href={`/comparisons/${n.comparisonId}`} className="text-muted-foreground text-xs hover:underline">
                      {n.comparisonName}
                    </Link>
                  </div>
                  <p className="mt-2 text-sm whitespace-pre-line">{n.note}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Fiyat geçmişi */}
      <Card>
        <CardHeader>
          <CardTitle>Fiyat Geçmişi</CardTitle>
          <CardDescription>Son 50 teklif</CardDescription>
        </CardHeader>
        <CardContent>
          {history && history.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Karşılaştırma</TableHead>
                  <TableHead>Kalem</TableHead>
                  <TableHead className="text-right">Birim</TableHead>
                  <TableHead className="text-right">Fiyat</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((h, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{new Date(h.created_at).toLocaleDateString("tr-TR")}</TableCell>
                    <TableCell>
                      <Link href={`/comparisons/${h.comparison_id}`} className="hover:underline">
                        {h.comparison_name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {h.item_name}
                      <Badge variant="outline" className="ml-2 text-xs">
                        {h.item_category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{h.unit ?? "—"}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCompactCurrency(Number(h.price), h.currency as Currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-6 text-center">
              <FileText className="text-muted-foreground mx-auto size-8" />
              <p className="text-muted-foreground mt-2 text-sm">Henüz teklif yok.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
