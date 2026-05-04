import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function FirmsPage() {
  const supabase = await createClient();
  const { data: firms } = await supabase
    .from("firms")
    .select("id, name, contact_name, contact_email")
    .order("name");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Firmalar</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Tüm firmaları içeren merkezi havuz.
          </p>
        </div>
        <Button asChild>
          <Link href="/firms/new">
            <Plus className="mr-1 size-4" /> Yeni Firma
          </Link>
        </Button>
      </div>

      {firms && firms.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {firms.map((f) => (
            <Link key={f.id} href={`/firms/${f.id}`}>
              <Card className="hover:bg-muted/30 h-full transition-colors">
                <CardContent className="p-5">
                  <h3 className="font-semibold">{f.name}</h3>
                  {f.contact_name && <p className="text-muted-foreground mt-1 text-sm">{f.contact_name}</p>}
                  {f.contact_email && (
                    <p className="mt-2 text-sm text-blue-600">{f.contact_email}</p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Henüz firma yok.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
