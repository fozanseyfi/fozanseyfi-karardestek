import Link from "next/link";
import { Plus, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";

type FirmRow = {
  id: string;
  name: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  comparison_firms: { comparison_id: string; comparisons: { id: string; name: string; project_id: string | null; status: string } | null }[];
};

export default async function FirmsPage() {
  const supabase = await createClient();
  const { data: firms } = await supabase
    .from("firms")
    .select(
      "id, name, contact_name, contact_email, contact_phone, comparison_firms (comparison_id, comparisons (id, name, project_id, status))"
    )
    .eq("is_sample", false)
    .order("name");

  const rows = (firms ?? []) as unknown as FirmRow[];

  // Tüm proje id'leri için isim sözlüğü
  const projectIds = Array.from(
    new Set(
      rows.flatMap((r) => r.comparison_firms.map((cf) => cf.comparisons?.project_id).filter((x): x is string => !!x))
    )
  );
  const projectMap = new Map<string, string>();
  if (projectIds.length > 0) {
    const { data: projs } = await supabase.from("projects").select("id, name").in("id", projectIds);
    for (const p of projs ?? []) projectMap.set(p.id, p.name);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Firmalar</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Merkezi firma havuzu. Bir firma birden fazla karşılaştırma ve projede kullanılabilir.
          </p>
        </div>
        <Button asChild>
          <Link href="/firms/new">
            <Plus className="mr-1 size-4" /> Yeni Firma
          </Link>
        </Button>
      </div>

      {rows.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Firma</TableHead>
                  <TableHead>Yetkili / İletişim</TableHead>
                  <TableHead className="text-center">Karşılaştırma</TableHead>
                  <TableHead>Projeler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((f) => {
                  const compCount = f.comparison_firms.length;
                  const projects = Array.from(
                    new Set(
                      f.comparison_firms
                        .map((cf) => cf.comparisons?.project_id)
                        .filter((x): x is string => !!x)
                    )
                  );
                  return (
                    <TableRow key={f.id} className="hover:bg-muted/30">
                      <TableCell>
                        <Link href={`/firms/${f.id}`} className="font-medium hover:underline">
                          {f.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {f.contact_name && <div>{f.contact_name}</div>}
                          {f.contact_email && (
                            <a href={`mailto:${f.contact_email}`} className="text-muted-foreground text-xs hover:underline">
                              {f.contact_email}
                            </a>
                          )}
                          {f.contact_phone && <div className="text-muted-foreground text-xs">{f.contact_phone}</div>}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={compCount > 0 ? "secondary" : "outline"}>
                          {compCount}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {projects.length === 0 ? (
                            <span className="text-muted-foreground text-xs">—</span>
                          ) : (
                            projects.slice(0, 3).map((pid) => (
                              <Link key={pid} href={`/projects/${pid}`}>
                                <Badge variant="outline" className="text-xs hover:bg-muted">
                                  {projectMap.get(pid) ?? "?"}
                                </Badge>
                              </Link>
                            ))
                          )}
                          {projects.length > 3 && (
                            <Badge variant="outline" className="text-xs">+{projects.length - 3}</Badge>
                          )}
                        </div>
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
            <Building2 className="text-muted-foreground mx-auto size-10" />
            <p className="text-muted-foreground mt-2">Henüz firma yok.</p>
            <Button asChild className="mt-4">
              <Link href="/firms/new">
                <Plus className="mr-1 size-4" /> İlk firmayı ekle
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
