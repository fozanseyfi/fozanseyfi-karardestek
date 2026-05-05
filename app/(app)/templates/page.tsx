import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, FileStack } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function TemplatesPage() {
  const supabase = await createClient();
  const { data: templates } = await supabase
    .from("templates")
    .select("*")
    .order("category")
    .order("name");

  const grouped: Record<string, typeof templates> = {};
  for (const t of templates ?? []) {
    if (!grouped[t.category]) grouped[t.category] = [];
    grouped[t.category]!.push(t);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Şablonlar</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            GES &amp; RES için hazır kalem şablonları. Yeni karşılaştırmada başlangıç olarak kullanabilirsin.
          </p>
        </div>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileStack className="text-muted-foreground mx-auto size-10" />
            <p className="text-muted-foreground mt-2 text-sm">Şablon yok.</p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(grouped).map(([category, list]) => (
          <div key={category} className="space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-medium">
              <Badge variant={category === "GES" ? "default" : category === "RES" ? "secondary" : "outline"}>
                {category}
              </Badge>
              <span className="text-muted-foreground text-sm">({list?.length ?? 0})</span>
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {list?.map((t) => (
                <Card key={t.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{t.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {t.type} · {Array.isArray(t.items) ? t.items.length : 0} kalem
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {t.description && <p className="text-muted-foreground text-sm">{t.description}</p>}
                    <Button asChild size="sm" className="w-full">
                      <Link href={`/templates/${t.id}`}>İncele</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
