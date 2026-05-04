import Link from "next/link";
import { Plus, GitCompareArrows, Building2, FolderKanban, FileStack } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/get-profile";
import { formatCompactCurrency } from "@/lib/currency";

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const [{ count: comparisonsCount }, { count: projectsCount }, { count: firmsCount }, { data: recent }] = await Promise.all([
    supabase.from("comparisons").select("*", { count: "exact", head: true }),
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase.from("firms").select("*", { count: "exact", head: true }),
    supabase
      .from("comparisons")
      .select("id, name, type, status, currency, budget, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Hoş geldin, {profile?.full_name?.split(" ")[0] ?? profile?.email}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            EPC karar destek platformuna genel bakış.
          </p>
        </div>
        <Button asChild>
          <Link href="/comparisons/new">
            <Plus className="mr-1 size-4" /> Yeni Karşılaştırma
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiTile icon={GitCompareArrows} label="Karşılaştırma" value={comparisonsCount ?? 0} href="/comparisons" />
        <KpiTile icon={FolderKanban} label="Proje" value={projectsCount ?? 0} href="/projects" />
        <KpiTile icon={Building2} label="Firma" value={firmsCount ?? 0} href="/firms" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Son Karşılaştırmalar</CardTitle>
          <CardDescription>En son eklenen 5 karşılaştırma</CardDescription>
        </CardHeader>
        <CardContent>
          {recent && recent.length > 0 ? (
            <ul className="divide-y">
              {recent.map((c) => (
                <li key={c.id} className="flex items-center justify-between py-3">
                  <div>
                    <Link href={`/comparisons/${c.id}`} className="font-medium hover:underline">
                      {c.name}
                    </Link>
                    <div className="text-muted-foreground text-xs">
                      {c.type} · {new Date(c.created_at).toLocaleDateString("tr-TR")}
                    </div>
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {c.budget ? formatCompactCurrency(c.budget, c.currency) : "—"}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-8 text-center">
              <FileStack className="text-muted-foreground mx-auto size-10" />
              <p className="text-muted-foreground mt-2 text-sm">Henüz karşılaştırma yok.</p>
              <Button asChild className="mt-4" variant="outline">
                <Link href="/comparisons/new">
                  <Plus className="mr-1 size-4" /> İlk karşılaştırmayı oluştur
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function KpiTile({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="hover:bg-muted/30 transition-colors">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-lg">
            <Icon className="size-5" />
          </div>
          <div>
            <div className="text-muted-foreground text-sm">{label}</div>
            <div className="text-2xl font-semibold">{value}</div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
