import Link from "next/link";
import {
  Plus,
  GitCompareArrows,
  Building2,
  FolderKanban,
  FileStack,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Trophy,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/get-profile";
import { formatCompactCurrency } from "@/lib/currency";
import type { Currency } from "@/lib/constants";
import { StatusChart } from "@/components/dashboard/status-chart";
import { StatusBadge } from "@/components/comparison/status-button";
import { GettingStartedChecklist } from "@/components/onboarding/getting-started-checklist";

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const [
    { count: comparisonsCount },
    { count: projectsCount },
    { count: firmsCount },
    { count: decidedCount },
    { data: recent },
    { data: byStatus },
    { data: latestDecided },
  ] = await Promise.all([
    supabase.from("comparisons").select("*", { count: "exact", head: true }),
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase.from("firms").select("*", { count: "exact", head: true }).eq("is_sample", false),
    supabase
      .from("comparisons")
      .select("*", { count: "exact", head: true })
      .eq("status", "decided"),
    supabase
      .from("comparisons")
      .select("id, name, type, status, currency, created_at, project_id")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase.from("comparisons").select("status"),
    supabase
      .from("comparisons")
      .select("id, name, decided_firm_id, decision_date")
      .eq("status", "decided")
      .order("decision_date", { ascending: false })
      .limit(3),
  ]);

  // Status dağılımı
  const statusCounts: Record<string, number> = { draft: 0, in_review: 0, decided: 0, archived: 0 };
  for (const c of byStatus ?? []) {
    statusCounts[c.status] = (statusCounts[c.status] ?? 0) + 1;
  }
  const statusData = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));

  // Karar verilen firma adlarını al
  const decidedFirmIds = (latestDecided ?? []).map((d) => d.decided_firm_id).filter((x): x is string => !!x);
  const firmNames = new Map<string, string>();
  if (decidedFirmIds.length > 0) {
    const { data: fs } = await supabase.from("firms").select("id, name").in("id", decidedFirmIds);
    for (const f of fs ?? []) firmNames.set(f.id, f.name);
  }

  const firstName = profile?.full_name?.split(" ")[0] ?? profile?.email?.split("@")[0] ?? "";

  return (
    <div className="space-y-8">
      {/* HERO */}
      <div className="from-primary via-primary/95 to-primary/80 relative overflow-hidden rounded-2xl bg-gradient-to-br p-8 text-white shadow-xl">
        <div className="bg-grid-white/[0.05] absolute inset-0 [mask-image:radial-gradient(ellipse_at_top_left,white,transparent_70%)]" />
        <div className="relative">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="size-4 opacity-80" />
            <span className="text-xs font-medium tracking-wide uppercase opacity-90">
              EPC Karar Destek Platformu
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            {firstName ? `Hoş geldin, ${firstName}` : "Hoş geldin"}
          </h1>
          <p className="mt-2 max-w-xl text-base opacity-90">
            GES &amp; RES projelerinde taşeron, malzeme ve hizmet tekliflerini akıllı skor algoritmasıyla
            değerlendir.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button asChild size="lg" variant="secondary" className="font-semibold">
              <Link href="/comparisons/new">
                <Plus className="mr-1 size-4" /> Yeni Karşılaştırma
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:text-white"
            >
              <Link href="/templates">
                <Sparkles className="mr-1 size-4" /> Şablonları Gör
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Onboarding checklist (tüm tamamlanana kadar görünür) */}
      <GettingStartedChecklist
        hasProject={(projectsCount ?? 0) > 0}
        hasFirm={(firmsCount ?? 0) > 0}
        hasComparison={(comparisonsCount ?? 0) > 0}
        hasDecision={(decidedCount ?? 0) > 0}
      />

      {/* KPI GRID */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiTile
          icon={GitCompareArrows}
          label="Karşılaştırma"
          value={comparisonsCount ?? 0}
          tone="blue"
          href="/comparisons"
        />
        <KpiTile
          icon={Trophy}
          label="Karar Verildi"
          value={decidedCount ?? 0}
          tone="emerald"
          href="/comparisons"
        />
        <KpiTile icon={FolderKanban} label="Proje" value={projectsCount ?? 0} tone="violet" href="/projects" />
        <KpiTile icon={Building2} label="Firma" value={firmsCount ?? 0} tone="amber" href="/firms" />
      </div>

      {/* MIDDLE GRID: status chart + quick actions */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-4 text-blue-600" /> Karşılaştırma Durumu
            </CardTitle>
            <CardDescription>Tüm karşılaştırmaların aşamalara göre dağılımı</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusChart data={statusData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hızlı İşlemler</CardTitle>
            <CardDescription>En sık kullanılan aksiyonlar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <QuickAction icon={Plus} label="Yeni Karşılaştırma" href="/comparisons/new" tone="blue" />
            <QuickAction icon={Sparkles} label="Şablondan Başla" href="/templates" tone="amber" />
            <QuickAction icon={Building2} label="Yeni Firma" href="/firms/new" tone="emerald" />
            <QuickAction icon={FolderKanban} label="Yeni Proje" href="/projects/new" tone="violet" />
          </CardContent>
        </Card>
      </div>

      {/* BOTTOM: Recent + Decided */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="size-4 text-blue-600" /> Son Karşılaştırmalar
              </CardTitle>
              <CardDescription>En son eklenen 6 karşılaştırma</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/comparisons">
                Tümü <ArrowRight className="ml-1 size-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recent && recent.length > 0 ? (
              <ul className="divide-y">
                {recent.map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <Link href={`/comparisons/${c.id}`} className="line-clamp-1 font-medium hover:underline">
                        {c.name}
                      </Link>
                      <div className="text-muted-foreground mt-0.5 flex items-center gap-2 text-xs">
                        <Badge variant="outline" className="text-[10px]">
                          {c.type}
                        </Badge>
                        <span>{new Date(c.created_at).toLocaleDateString("tr-TR")}</span>
                      </div>
                    </div>
                    <StatusBadge status={c.status as "draft" | "in_review" | "decided" | "archived"} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-12 text-center">
                <FileStack className="text-muted-foreground mx-auto size-10" />
                <p className="text-muted-foreground mt-2 text-sm">Henüz karşılaştırma yok.</p>
                <Button asChild className="mt-4" variant="outline">
                  <Link href="/templates">
                    <Sparkles className="mr-1 size-4" /> Şablondan başlat
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="size-4 text-emerald-600" /> Son Kararlar
            </CardTitle>
            <CardDescription>En son verilen 3 karar</CardDescription>
          </CardHeader>
          <CardContent>
            {latestDecided && latestDecided.length > 0 ? (
              <ul className="space-y-3">
                {latestDecided.map((d) => (
                  <li key={d.id} className="border-l-2 border-emerald-500 pl-3">
                    <Link href={`/comparisons/${d.id}`} className="line-clamp-1 text-sm font-medium hover:underline">
                      {d.name}
                    </Link>
                    {d.decided_firm_id && firmNames.get(d.decided_firm_id) && (
                      <div className="mt-0.5 flex items-center gap-1 text-xs">
                        <Trophy className="size-3 text-emerald-600" />
                        <span className="text-emerald-700">{firmNames.get(d.decided_firm_id)}</span>
                      </div>
                    )}
                    {d.decision_date && (
                      <div className="text-muted-foreground mt-0.5 text-[11px]">
                        {new Date(d.decision_date).toLocaleDateString("tr-TR")}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground py-6 text-center text-sm">Henüz karar verilmemiş.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const TONES = {
  blue: { bg: "bg-blue-50", text: "text-blue-700", iconBg: "bg-blue-600", iconText: "text-white" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", iconBg: "bg-emerald-600", iconText: "text-white" },
  violet: { bg: "bg-violet-50", text: "text-violet-700", iconBg: "bg-violet-600", iconText: "text-white" },
  amber: { bg: "bg-amber-50", text: "text-amber-700", iconBg: "bg-amber-500", iconText: "text-white" },
};

function KpiTile({
  icon: Icon,
  label,
  value,
  tone,
  href,
  budget,
  currency,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  tone: keyof typeof TONES;
  href: string;
  budget?: number;
  currency?: Currency;
}) {
  const t = TONES[tone];
  return (
    <Link href={href}>
      <Card className={`${t.bg} group cursor-pointer overflow-hidden border-transparent transition-all hover:shadow-lg`}>
        <CardContent className="relative p-5">
          <div className={`mb-3 flex size-12 items-center justify-center rounded-xl ${t.iconBg} ${t.iconText} shadow-sm`}>
            <Icon className="size-6" />
          </div>
          <div className={`text-xs font-medium tracking-wide uppercase ${t.text} opacity-80`}>{label}</div>
          <div className="mt-1 text-3xl font-bold tabular-nums">{value}</div>
          {budget !== undefined && currency && (
            <div className={`text-xs ${t.text} opacity-70`}>
              {formatCompactCurrency(budget, currency)}
            </div>
          )}
          <ArrowRight
            className={`absolute right-4 bottom-4 size-4 ${t.text} opacity-0 transition-opacity group-hover:opacity-70`}
          />
        </CardContent>
      </Card>
    </Link>
  );
}

function QuickAction({
  icon: Icon,
  label,
  href,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  tone: keyof typeof TONES;
}) {
  const t = TONES[tone];
  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 rounded-lg border ${t.bg} border-transparent p-3 transition-all hover:shadow-md`}
    >
      <div className={`flex size-9 shrink-0 items-center justify-center rounded ${t.iconBg} ${t.iconText}`}>
        <Icon className="size-4" />
      </div>
      <span className={`flex-1 text-sm font-medium ${t.text}`}>{label}</span>
      <ArrowRight className={`size-4 ${t.text} opacity-50 transition-transform group-hover:translate-x-0.5`} />
    </Link>
  );
}
