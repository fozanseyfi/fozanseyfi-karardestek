import Link from "next/link";
import { Plus, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select(
      "id, name, description, created_at, comparisons (id, name, type, status, created_at)"
    )
    .order("created_at", { ascending: false });

  type ProjRow = {
    id: string;
    name: string;
    description: string | null;
    created_at: string;
    comparisons: { id: string; name: string; type: string; status: string; created_at: string }[];
  };
  const rows = (projects ?? []) as unknown as ProjRow[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projeler</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Karşılaştırmalarını proje altında gruplandır.
          </p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="mr-1 size-4" /> Yeni Proje
          </Link>
        </Button>
      </div>

      {rows.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proje</TableHead>
                  <TableHead className="text-center">Karşılaştırma</TableHead>
                  <TableHead>Son Karşılaştırma</TableHead>
                  <TableHead>Tarih</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((p) => {
                  const sorted = [...p.comparisons].sort((a, b) => b.created_at.localeCompare(a.created_at));
                  const latest = sorted[0];
                  return (
                    <TableRow key={p.id} className="hover:bg-muted/30">
                      <TableCell>
                        <Link href={`/projects/${p.id}`} className="font-medium hover:underline">
                          {p.name}
                        </Link>
                        {p.description && (
                          <div className="text-muted-foreground line-clamp-1 text-xs">{p.description}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={p.comparisons.length > 0 ? "secondary" : "outline"}>
                          {p.comparisons.length}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {latest ? (
                          <Link href={`/comparisons/${latest.id}`} className="text-sm hover:underline">
                            {latest.name}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(p.created_at).toLocaleDateString("tr-TR")}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <FolderKanban className="text-muted-foreground mx-auto size-10" />
            <p className="text-muted-foreground mt-2">Henüz proje yok.</p>
            <Button asChild className="mt-4">
              <Link href="/projects/new">
                <Plus className="mr-1 size-4" /> İlk projeyi oluştur
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
