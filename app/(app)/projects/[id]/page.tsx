import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Plus, GitCompareArrows } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/get-profile";
import { canCreateComparison } from "@/lib/permissions";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  const canCreate = canCreateComparison(profile);
  const supabase = await createClient();
  const { data: project } = await supabase.from("projects").select("*").eq("id", id).single();
  if (!project) notFound();

  const { data: comparisons } = await supabase
    .from("comparisons")
    .select("id, name, type, status, currency, created_at")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/projects">
          <ChevronLeft className="mr-1 size-4" /> Projeler
        </Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
          {project.description && (
            <p className="text-muted-foreground mt-1 text-sm">{project.description}</p>
          )}
        </div>
        {canCreate && (
          <Button asChild>
            <Link href={`/comparisons/new`}>
              <Plus className="mr-1 size-4" /> Bu Projeye Karşılaştırma Ekle
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Karşılaştırmalar ({comparisons?.length ?? 0})</CardTitle>
          <CardDescription>Bu projeye bağlı tüm karşılaştırmalar</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {comparisons && comparisons.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Karşılaştırma</TableHead>
                  <TableHead>Tür</TableHead>
                  <TableHead>Para Birimi</TableHead>
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
                    <TableCell>{c.currency}</TableCell>
                    <TableCell>
                      <Badge variant={c.status === "decided" ? "default" : "outline"}>{c.status}</Badge>
                    </TableCell>
                    <TableCell>{new Date(c.created_at).toLocaleDateString("tr-TR")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center">
              <GitCompareArrows className="text-muted-foreground mx-auto size-10" />
              <p className="text-muted-foreground mt-2 text-sm">Bu projeye henüz karşılaştırma eklenmedi.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
