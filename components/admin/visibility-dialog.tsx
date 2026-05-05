"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  EyeOff,
  Search,
  GitCompareArrows,
  FolderKanban,
  Building2,
  Lock,
  Pencil,
  Settings2,
} from "lucide-react";
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
  setResourceLocked,
  getLockedResourcesForUser,
  getOrgResources,
  type AvailableResources,
} from "@/app/(app)/admin/users/visibility-actions";

type ResourceType = "comparison" | "project" | "firm";
type AccessState = "full" | "readonly" | "hidden";

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
  const [locked, setLocked] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    Promise.all([
      getOrgResources(),
      getHiddenResourcesForUser(userId),
      getLockedResourcesForUser(userId),
    ])
      .then(([res, h, l]) => {
        setResources(res);
        setHidden(new Set(h.map((x) => `${x.resource_type}:${x.resource_id}`)));
        setLocked(new Set(l.map((x) => `${x.resource_type}:${x.resource_id}`)));
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Yükleme hatası"))
      .finally(() => setLoading(false));
  }, [open, userId]);

  function getState(type: ResourceType, id: string): AccessState {
    const key = `${type}:${id}`;
    if (hidden.has(key)) return "hidden";
    if (locked.has(key)) return "readonly";
    return "full";
  }

  function setState(type: ResourceType, id: string, target: AccessState) {
    const key = `${type}:${id}`;
    const current = getState(type, id);
    if (current === target) return;

    startTransition(async () => {
      try {
        // İhtiyaç: hem hidden hem locked'ı doğru hale getir
        const wantHidden = target === "hidden";
        const wantLocked = target === "readonly";

        // Hidden state senkronize et
        if (hidden.has(key) !== wantHidden) {
          await setResourceHidden(userId, type, id, wantHidden);
          setHidden((prev) => {
            const next = new Set(prev);
            if (wantHidden) next.add(key);
            else next.delete(key);
            return next;
          });
        }
        // Locked state senkronize et
        if (locked.has(key) !== wantLocked) {
          await setResourceLocked(userId, type, id, wantLocked);
          setLocked((prev) => {
            const next = new Set(prev);
            if (wantLocked) next.add(key);
            else next.delete(key);
            return next;
          });
        }
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Hata");
      }
    });
  }

  const filterMatch = (name: string) =>
    !search || name.toLowerCase().includes(search.toLowerCase());

  const filteredComparisons = resources.comparisons.filter((r) => filterMatch(r.name));
  const filteredProjects = resources.projects.filter((r) => filterMatch(r.name));
  const filteredFirms = resources.firms.filter((r) => filterMatch(r.name));

  if (userRole === "admin") {
    return (
      <Button variant="ghost" size="sm" disabled title="Admin'in erişimi kısıtlanamaz">
        <Settings2 className="size-4 opacity-30" />
      </Button>
    );
  }

  const totalCustomized = hidden.size + locked.size;

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)} title="Erişim yönetimi">
        <Settings2 className="size-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings2 className="size-5" /> {userName} — Erişim Yönetimi
            </DialogTitle>
            <DialogDescription>
              {userRole === "viewer" ? (
                <>
                  Bu görüntüleyici kullanıcı için kaynakları <strong>gizleyebilirsin</strong>. Default: tüm kaynaklar
                  görünür.
                </>
              ) : (
                <>
                  Bu kullanıcı için her kaynağa <strong>3 farklı erişim</strong> atayabilirsin: <em>Tam Erişim</em>{" "}
                  (görür + düzenler), <em>Salt Okunur</em> (görür ama düzenleyemez), <em>Gizli</em> (göremez). Default:
                  Tam Erişim.
                </>
              )}
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
                  getState={getState}
                  setState={setState}
                  pending={pending}
                  isViewer={userRole === "viewer"}
                />
              </TabsContent>
              <TabsContent value="project" className="max-h-[50vh] overflow-y-auto">
                <ResourceList
                  items={filteredProjects}
                  type="project"
                  getState={getState}
                  setState={setState}
                  pending={pending}
                  isViewer={userRole === "viewer"}
                />
              </TabsContent>
              <TabsContent value="firm" className="max-h-[50vh] overflow-y-auto">
                <ResourceList
                  items={filteredFirms}
                  type="firm"
                  getState={getState}
                  setState={setState}
                  pending={pending}
                  isViewer={userRole === "viewer"}
                />
              </TabsContent>
            </Tabs>
          )}

          <div className="text-muted-foreground border-t pt-2 text-xs">
            <strong>{totalCustomized}</strong> kaynak özelleştirilmiş ({hidden.size} gizli
            {userRole !== "viewer" && `, ${locked.size} salt okunur`})
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ResourceList({
  items,
  type,
  getState,
  setState,
  pending,
  isViewer,
}: {
  items: { id: string; name: string }[];
  type: ResourceType;
  getState: (t: ResourceType, id: string) => AccessState;
  setState: (t: ResourceType, id: string, target: AccessState) => void;
  pending: boolean;
  isViewer: boolean;
}) {
  if (items.length === 0) {
    return <div className="text-muted-foreground py-8 text-center text-sm">Hiç kayıt yok.</div>;
  }
  return (
    <ul className="divide-y">
      {items.map((it) => {
        const s = getState(type, it.id);
        return (
          <li
            key={it.id}
            className={cn(
              "flex items-center justify-between gap-3 py-2",
              s === "hidden" && "bg-rose-50/30",
              s === "readonly" && "bg-amber-50/30"
            )}
          >
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <span className={cn("truncate text-sm", s === "hidden" && "text-muted-foreground line-through")}>
                {it.name}
              </span>
              {s === "hidden" && (
                <Badge variant="outline" className="text-rose-600 text-[10px]">
                  GİZLİ
                </Badge>
              )}
              {s === "readonly" && (
                <Badge variant="outline" className="text-amber-700 text-[10px]">
                  SALT OKUNUR
                </Badge>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1 rounded-md border bg-white p-0.5">
              <StateBtn
                active={s === "full"}
                onClick={() => setState(type, it.id, "full")}
                disabled={pending || isViewer}
                tone="emerald"
                title={isViewer ? "Görüntüleyici düzenleyemez" : "Tam erişim (görür + düzenler)"}
              >
                <Pencil className="size-3" />
              </StateBtn>
              {!isViewer && (
                <StateBtn
                  active={s === "readonly"}
                  onClick={() => setState(type, it.id, "readonly")}
                  disabled={pending}
                  tone="amber"
                  title="Salt okunur (görür ama düzenleyemez)"
                >
                  <Lock className="size-3" />
                </StateBtn>
              )}
              <StateBtn
                active={s === "hidden"}
                onClick={() => setState(type, it.id, "hidden")}
                disabled={pending}
                tone="rose"
                title="Gizli (göremez)"
              >
                <EyeOff className="size-3" />
              </StateBtn>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function StateBtn({
  active,
  onClick,
  disabled,
  tone,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  disabled: boolean;
  tone: "emerald" | "amber" | "rose";
  title: string;
  children: React.ReactNode;
}) {
  const toneClasses = {
    emerald: "bg-emerald-600 text-white",
    amber: "bg-amber-500 text-white",
    rose: "bg-rose-600 text-white",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "flex size-7 items-center justify-center rounded transition-colors",
        active ? toneClasses[tone] : "text-slate-500 hover:bg-slate-100",
        disabled && "cursor-not-allowed opacity-40"
      )}
    >
      {children}
    </button>
  );
}

type ResourceTypeT = ResourceType;
export type { ResourceTypeT };
