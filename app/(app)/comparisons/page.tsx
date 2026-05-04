import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { formatCompactCurrency } from "@/lib/currency";
import type { Currency } from "@/lib/constants";
import { ExcelImportDialog } from "@/components/comparison/excel-import-dialog";
import { StatusBadge } from "@/components/comparison/status-button";

export default async function ComparisonsListPage() {
  const supabase = await createClient();
  const { data: comparisons } = await supabase
    .from("comparisons")
    .select("id, name, type, status, currency, budget, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Karşılaştırmalar</h1>
          <p className="text-muted-foreground mt-1 text-sm">Tüm teklif karşılaştırmaları.</p>
        </div>
        <div className="flex gap-2">
          <ExcelImportDialog />
          <Button asChild>
            <Link href="/comparisons/new">
              <Plus className="mr-1 size-4" /> Yeni
            </Link>
          </Button>
        </div>
      </div>

      {comparisons && comparisons.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {comparisons.map((c) => (
            <Link key={c.id} href={`/comparisons/${c.id}`}>
              <Card className="hover:bg-muted/30 h-full transition-colors">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 leading-tight font-medium">{c.name}</h3>
                    <Badge variant="secondary">{c.type}</Badge>
                  </div>
                  <div className="text-muted-foreground flex items-center justify-between text-sm">
                    <span>{new Date(c.created_at).toLocaleDateString("tr-TR")}</span>
                    <span className="font-medium">
                      {c.budget ? formatCompactCurrency(c.budget, c.currency as Currency) : "—"}
                    </span>
                  </div>
                  <StatusBadge status={c.status as "draft" | "in_review" | "decided" | "archived"} />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Henüz karşılaştırma yok.</p>
            <Button asChild className="mt-4">
              <Link href="/comparisons/new">
                <Plus className="mr-1 size-4" /> İlk karşılaştırmayı oluştur
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

