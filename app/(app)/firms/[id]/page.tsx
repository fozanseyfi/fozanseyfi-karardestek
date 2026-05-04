import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { formatCompactCurrency } from "@/lib/currency";
import type { Currency } from "@/lib/constants";

export default async function FirmDetailPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: firm } = await supabase.from("firms").select("*").eq("id", id).single();
  if (!firm) notFound();

  const { data: history } = await supabase
    .from("firm_price_history")
    .select("*")
    .eq("firm_id", id)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/firms">
          <ChevronLeft className="mr-1 size-4" /> Firmalar
        </Link>
      </Button>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{firm.name}</h1>
        <div className="text-muted-foreground mt-1 text-sm">
          {firm.contact_name && <span>{firm.contact_name}</span>}
          {firm.contact_email && (
            <>
              {firm.contact_name && <span> · </span>}
              <a href={`mailto:${firm.contact_email}`} className="hover:underline">
                {firm.contact_email}
              </a>
            </>
          )}
          {firm.contact_phone && (
            <>
              {(firm.contact_email || firm.contact_name) && <span> · </span>}
              <span>{firm.contact_phone}</span>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fiyat Geçmişi</CardTitle>
          <CardDescription>Bu firmanın tüm karşılaştırmalardaki teklif fiyatları (son 100).</CardDescription>
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
                      <Badge variant="outline" className="ml-2">
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
            <p className="text-muted-foreground text-sm">Bu firma henüz hiçbir karşılaştırmada yer almadı.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
