import Link from "next/link";
import { Plus, FileStack } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/get-profile";
import { StatusBadge } from "@/components/comparison/status-button";
import { GettingStartedChecklist } from "@/components/onboarding/getting-started-checklist";

type Status = "draft" | "in_review" | "decided" | "archived";

/** Dashboard — sade: başlık, dört sayı, son karşılaştırmalar tablosu. */
export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  // Her sorgu izole: biri patlasa bile sayfa açılsın
  let comparisonsCount = 0;
  let projectsCount = 0;
  let firmsCount = 0;
  let decidedCount = 0;
  let recent: Array<{
    id: string;
    name: string;
    type: string;
    status: string;
    created_at: string;
  }> = [];

  try {
    const results = await Promise.all([
      supabase.from("comparisons").select("*", { count: "exact", head: true }),
      supabase.from("projects").select("*", { count: "exact", head: true }),
      supabase
        .from("firms")
        .select("*", { count: "exact", head: true })
        .eq("is_sample", false),
      supabase
        .from("comparisons")
        .select("*", { count: "exact", head: true })
        .eq("status", "decided"),
      supabase
        .from("comparisons")
        .select("id, name, type, status, created_at")
        .order("created_at", { ascending: false })
        .limit(8),
    ]);
    comparisonsCount = results[0].count ?? 0;
    projectsCount = results[1].count ?? 0;
    firmsCount = results[2].count ?? 0;
    decidedCount = results[3].count ?? 0;
    recent = (results[4].data as typeof recent) ?? [];
  } catch (err) {
    console.error("[dashboard] queries failed:", err);
  }

  const canEdit = profile?.role !== "viewer";
  const kpis = [
    { label: "Karşılaştırma", value: comparisonsCount, href: "/comparisons" },
    { label: "Karar verilen", value: decidedCount, href: "/comparisons" },
    { label: "Proje", value: projectsCount, href: "/projects" },
    { label: "Firma", value: firmsCount, href: "/firms" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            {comparisonsCount} karşılaştırma kaydı
          </p>
        </div>
        {canEdit && (
          <Button asChild size="sm">
            <Link href="/comparisons/new">
              <Plus className="mr-1 size-4" /> Yeni Karşılaştırma
            </Link>
          </Button>
        )}
      </div>

      {!profile?.onboarding_completed && (
        <GettingStartedChecklist
          hasProject={projectsCount > 0}
          hasFirm={firmsCount > 0}
          hasComparison={comparisonsCount > 0}
          hasDecision={decidedCount > 0}
        />
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {kpis.map((k) => (
          <Link key={k.label} href={k.href}>
            <Card
              data-kpi
              className="hover:border-primary/40 gap-0 py-0 transition-colors"
            >
              <CardContent className="p-4">
                <div className="text-muted-foreground text-[12px] font-medium">
                  {k.label}
                </div>
                <div className="mt-1 text-2xl font-semibold tabular-nums">
                  {k.value}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="gap-0 py-0">
        <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
          <h2 className="text-sm font-semibold">Son Karşılaştırmalar</h2>
          <Link
            href="/comparisons"
            className="text-primary text-xs font-medium hover:underline"
          >
            Tümünü gör →
          </Link>
        </div>
        {recent.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="px-4 py-2 font-medium">Karşılaştırma</th>
                  <th className="px-4 py-2 font-medium">Tür</th>
                  <th className="px-4 py-2 font-medium">Tarih</th>
                  <th className="px-4 py-2 font-medium">Durum</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="px-4 py-2">
                      <Link
                        href={`/comparisons/${c.id}`}
                        className="font-medium hover:underline"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="text-muted-foreground px-4 py-2">
                      {c.type}
                    </td>
                    <td className="text-muted-foreground px-4 py-2 tabular-nums">
                      {new Date(c.created_at).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-4 py-2">
                      <StatusBadge status={c.status as Status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-4 py-10 text-center">
            <p className="text-muted-foreground text-sm">
              Henüz karşılaştırma yok.
            </p>
            {canEdit && (
              <Button asChild className="mt-3" variant="outline" size="sm">
                <Link href="/templates">
                  <FileStack className="mr-1 size-4" /> Şablondan başlat
                </Link>
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
