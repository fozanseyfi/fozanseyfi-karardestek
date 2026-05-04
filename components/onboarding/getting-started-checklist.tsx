"use client";

import Link from "next/link";
import { Check, Circle, Sparkles, FolderKanban, Building2, GitCompareArrows, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ChecklistProps = {
  hasProject: boolean;
  hasFirm: boolean;
  hasComparison: boolean;
  hasDecision: boolean;
};

export function GettingStartedChecklist(props: ChecklistProps) {
  const items = [
    {
      done: true,
      icon: Sparkles,
      label: "Hesabını oluşturdun",
      sub: "Hoş geldin!",
      action: null,
    },
    {
      done: props.hasProject,
      icon: FolderKanban,
      label: "İlk projeni oluştur",
      sub: "Karşılaştırmalarını gruplandır",
      action: { href: "/projects/new", label: "Proje Oluştur" },
    },
    {
      done: props.hasFirm,
      icon: Building2,
      label: "İlk firmanı ekle",
      sub: "Yetkili, e-posta, telefon bilgileri",
      action: { href: "/firms/new", label: "Firma Ekle" },
    },
    {
      done: props.hasComparison,
      icon: GitCompareArrows,
      label: "İlk karşılaştırmanı yarat",
      sub: "Sıfırdan veya şablondan",
      action: { href: "/templates", label: "Şablondan Başla" },
    },
    {
      done: props.hasDecision,
      icon: Trophy,
      label: "İlk kararını ver",
      sub: "Karar Özeti sekmesinden firma seç",
      action: null,
    },
  ];

  const completed = items.filter((i) => i.done).length;
  const total = items.length;

  if (completed === total) return null;

  return (
    <Card className="border-primary/20 from-primary/5 bg-gradient-to-br to-transparent">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="text-primary size-4" /> Başlangıç Kontrol Listesi
            </CardTitle>
            <CardDescription>
              {completed}/{total} tamamlandı — hızlıca platforma alış
            </CardDescription>
          </div>
          <div className="text-primary text-2xl font-bold tabular-nums">
            {Math.round((completed / total) * 100)}%
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <li
                key={idx}
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-3 transition-colors",
                  item.done ? "bg-emerald-50/50 border-emerald-200/50" : "hover:bg-muted/30"
                )}
              >
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full",
                    item.done ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"
                  )}
                >
                  {item.done ? <Check className="size-4" /> : <Icon className="size-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={cn("font-medium", item.done && "text-muted-foreground line-through")}>
                    {item.label}
                  </div>
                  <div className="text-muted-foreground text-xs">{item.sub}</div>
                </div>
                {!item.done && item.action && (
                  <Button asChild size="sm" variant="outline">
                    <Link href={item.action.href}>{item.action.label}</Link>
                  </Button>
                )}
                {item.done && <Circle className="size-3 text-emerald-600 fill-emerald-600" />}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
