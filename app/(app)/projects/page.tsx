import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, description, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projeler</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Karşılaştırmalarınızı projeler altında gruplandırın.
          </p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="mr-1 size-4" /> Yeni Proje
          </Link>
        </Button>
      </div>

      {projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Card key={p.id}>
              <CardContent className="p-5">
                <h3 className="font-semibold">{p.name}</h3>
                {p.description && <p className="text-muted-foreground mt-1 text-sm">{p.description}</p>}
                <p className="text-muted-foreground mt-3 text-xs">
                  {new Date(p.created_at).toLocaleDateString("tr-TR")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Henüz proje yok.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
