"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Plus, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { NewProjectDialog } from "./new-project-dialog";

export type ProjectOption = { id: string; name: string };

export function ProjectCombobox({
  options,
  selectedId,
  onSelect,
  onProjectCreated,
  allowNone = true,
}: {
  options: ProjectOption[];
  selectedId?: string | null;
  onSelect: (project: ProjectOption | null) => void;
  onProjectCreated: (project: ProjectOption) => void;
  allowNone?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [newDialogOpen, setNewDialogOpen] = useState(false);

  const selected = options.find((o) => o.id === selectedId);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="h-11 w-full justify-between text-base font-normal"
          >
            <span className="flex items-center gap-2">
              <FolderKanban className="text-muted-foreground size-4" />
              {selected ? (
                selected.name
              ) : (
                <span className="text-muted-foreground">Proje seç...</span>
              )}
            </span>
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandInput placeholder="Proje ara..." value={search} onValueChange={setSearch} className="h-10" />
            <CommandList>
              <CommandEmpty>
                <div className="space-y-2 p-3 text-center">
                  <p className="text-muted-foreground text-sm">Proje bulunamadı.</p>
                  {search.length >= 2 && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setOpen(false);
                        setNewDialogOpen(true);
                      }}
                    >
                      <Plus className="mr-1 size-4" />
                      &quot;{search}&quot; olarak yeni proje aç
                    </Button>
                  )}
                </div>
              </CommandEmpty>
              {allowNone && (
                <>
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        onSelect(null);
                        setOpen(false);
                        setSearch("");
                      }}
                    >
                      <Check className={cn("mr-2 size-4", !selectedId ? "opacity-100" : "opacity-0")} />
                      <span className="text-muted-foreground">Proje yok</span>
                    </CommandItem>
                  </CommandGroup>
                  <CommandSeparator />
                </>
              )}
              <CommandGroup heading="Projeler">
                {options.map((p) => (
                  <CommandItem
                    key={p.id}
                    value={p.name}
                    onSelect={() => {
                      onSelect(p);
                      setOpen(false);
                      setSearch("");
                    }}
                  >
                    <Check className={cn("mr-2 size-4", selectedId === p.id ? "opacity-100" : "opacity-0")} />
                    {p.name}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    setNewDialogOpen(true);
                  }}
                  className="text-primary"
                >
                  <Plus className="mr-2 size-4" />
                  Yeni Proje Aç
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <NewProjectDialog
        open={newDialogOpen}
        onOpenChange={setNewDialogOpen}
        initialName={search}
        onCreated={(p) => {
          onProjectCreated(p);
          onSelect(p);
          setSearch("");
        }}
      />
    </>
  );
}
