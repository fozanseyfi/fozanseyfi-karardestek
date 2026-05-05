"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { EyeOff, Eye, Search, GitCompareArrows, FolderKanban, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  setResourceHidden,
  getHiddenResourcesForUser,
  getOrgResources,
  type AvailableResources,
} from "@/app/(app)/admin/users/visibility-actions";

type ResourceType = "comparison" | "project" | "firm";

export function VisibilityDialog({
  userId,
  userName,
  userRole,
}: {
  userId: string;
  userName: string;
  userRole: "admin" | "user" | "viewer";
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [resources, setResources] = useState<AvailableResources>({
    comparisons: [],
    projects: [],
    firms: [],
  });
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    Promise.all([getOrgResources(), getHiddenResourcesForUser(userId)])
      .then(([res, h]) => {
        setResources(res);
        setHidden(new Set(h.map((x) => `${x.resource_type}:${x.resource_id}`)));
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Yükleme hatası"))
      .finally(() => setLoading(false));
  }, [open, userId]);

  function toggle(type: ResourceType, id: string, isHidden: boolean) {
    const key = `${type}:${id}`;
    startTransition(async () => {
      try {
        await setResourceHidden(userId, type, id, isHidden);
        setHidden((prev) => {
          const next = new Set(prev);
          if (isHidden) next.add(key);
          else next.delete(key);
          return next;
        });
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Hata");
      }
    });
  }

  function isHidden(type: ResourceType, id: string) {
    return hidden.has(`${type}:${id}`);
  }

  const filterMatch = (name: string) =>
    !search || name.toLowerCase().includes(search.toLowerCase());

  const filteredComparisons = resources.comparisons.filter((r) => filterMatch(r.name));
  const filteredProjects = resources.projects.filter((r) => filterMatch(r.name));
  const filteredFirms = resources.firms.filter((r) => filterMatch(r.name));

  if (userRole === "admin") {
    return (
      <Button variant="ghost" size="sm" disabled title="Admin'in görünürlüğü kısıtlanamaz">
        <EyeOff className="size-4 opacity-30" />
      </Button>
    );
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)} title="Görünürlük yönet">
        <EyeOff className="size-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <EyeOff className="size-5" /> {userName} — Görünürlük Yönetimi
            </DialogTitle>
            <DialogDescription>
              Bu kullanıcıdan gizlemek istediğin kaynakları seç. <strong>Gizli</strong> olarak işaretlenenler
              bu kullanıcının panelinde gözükmez. Default: tüm kaynaklar görünür.
            </DialogDescription>
          </DialogHeader>

          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ara..."
              className="pl-10"
            />
          </div>

          {loading ? (
            <div className="text-muted-foreground py-12 text-center text-sm">Yükleniyor...</div>
          ) : (
            <Tabs defaultValue="comparison">
              <TabsList>
                <TabsTrigger value="comparison" className="gap-1.5">
                  <GitCompareArrows className="size-4" /> Karşılaştırma ({resources.comparisons.length})
                </TabsTrigger>
                <TabsTrigger value="project" className="gap-1.5">
                  <FolderKanban className="size-4" /> Proje ({resources.projects.length})
                </TabsTrigger>
                <TabsTrigger value="firm" className="gap-1.5">
                  <Building2 className="size-4" /> Firma ({resources.firms.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="comparison" className="max-h-[50vh] overflow-y-auto">
                <ResourceList
                  items={filteredComparisons}
                  type="comparison"
                  toggle={toggle}
                  isHidden={isHidden}
                  pending={pending}
                />
              </TabsContent>
              <TabsContent value="project" className="max-h-[50vh] overflow-y-auto">
                <ResourceList
                  items={filteredProjects}
                  type="project"
                  toggle={toggle}
                  isHidden={isHidden}
                  pending={pending}
                />
              </TabsContent>
              <TabsContent value="firm" className="max-h-[50vh] overflow-y-auto">
                <ResourceList
                  items={filteredFirms}
                  type="firm"
                  toggle={toggle}
                  isHidden={isHidden}
                  pending={pending}
                />
              </TabsContent>
            </Tabs>
          )}

          <div className="text-muted-foreground border-t pt-2 text-xs">
            <strong>{hidden.size}</strong> kaynak gizli
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ResourceList({
  items,
  type,
  toggle,
  isHidden,
  pending,
}: {
  items: { id: string; name: string }[];
  type: ResourceType;
  toggle: (t: ResourceType, id: string, hidden: boolean) => void;
  isHidden: (t: ResourceType, id: string) => boolean;
  pending: boolean;
}) {
  if (items.length === 0) {
    return <div className="text-muted-foreground py-8 text-center text-sm">Hiç kayıt yok.</div>;
  }
  return (
    <ul className="divide-y">
      {items.map((it) => {
        const h = isHidden(type, it.id);
        return (
          <li key={it.id} className={cn("flex items-center justify-between gap-2 py-2", h && "bg-rose-50/30")}>
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <span className={cn("truncate text-sm", h && "text-muted-foreground line-through")}>
                {it.name}
              </span>
              {h && (
                <Badge variant="outline" className="text-rose-600 text-[10px]">
                  GİZLİ
                </Badge>
              )}
            </div>
            <Button
              size="sm"
              variant={h ? "default" : "outline"}
              onClick={() => toggle(type, it.id, !h)}
              disabled={pending}
              className={h ? "bg-rose-600 hover:bg-rose-700" : ""}
            >
              {h ? (
                <>
                  <Eye className="mr-1 size-3" /> Göster
                </>
              ) : (
                <>
                  <EyeOff className="mr-1 size-3" /> Gizle
                </>
              )}
            </Button>
          </li>
        );
      })}
    </ul>
  );
}

type ResourceTypeT = ResourceType;
export type { ResourceTypeT };
