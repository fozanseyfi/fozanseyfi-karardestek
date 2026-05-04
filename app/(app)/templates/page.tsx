import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Şablonlar</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          GES &amp; RES için hazır kalem şablonları.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Yakında</CardTitle>
          <CardDescription>Faz 3&apos;te GES ve RES hazır şablonları eklenecek.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            GES (Mekanik kazık, panel taşıma, montaj, MV/LV kablo, trafo, inverter, izleme sistemi…) ve RES (kule
            montaj, vinç, foundation, kablo…) şablonları sihirbazda &quot;şablondan başla&quot; seçeneği ile hızlı
            kullanım sağlayacak.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
