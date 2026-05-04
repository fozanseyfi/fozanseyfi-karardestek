"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
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
import { NewFirmDialog } from "./new-firm-dialog";

export type FirmOption = { id: string; name: string };

export function FirmCombobox({
  options,
  selectedId,
  onSelect,
  onFirmCreated,
  placeholder = "Firma ara veya seç...",
  excludeIds = [],
}: {
  options: FirmOption[];
  selectedId?: string | null;
  onSelect: (firm: FirmOption) => void;
  onFirmCreated: (firm: FirmOption) => void;
  placeholder?: string;
  excludeIds?: string[];
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [newDialogOpen, setNewDialogOpen] = useState(false);

  const selected = options.find((o) => o.id === selectedId);
  const visibleOptions = options.filter((o) => !excludeIds.includes(o.id));

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
            {selected ? selected.name : <span className="text-muted-foreground">{placeholder}</span>}
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Firma adı yaz..."
              value={search}
              onValueChange={setSearch}
              className="h-10"
            />
            <CommandList>
              <CommandEmpty>
                <div className="space-y-2 p-3 text-center">
                  <p className="text-muted-foreground text-sm">
                    {search.length >= 3 ? `"${search}" bulunamadı.` : "En az 3 harf yaz."}
                  </p>
                  {search.length >= 2 && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setOpen(false);
                        setNewDialogOpen(true);
                      }}
                    >
                      <Plus className="mr-1 size-4" />
                      &quot;{search}&quot; olarak yeni firma ekle
                    </Button>
                  )}
                </div>
              </CommandEmpty>
              <CommandGroup heading="Mevcut Firmalar">
                {visibleOptions.map((firm) => (
                  <CommandItem
                    key={firm.id}
                    value={firm.name}
                    onSelect={() => {
                      onSelect(firm);
                      setOpen(false);
                      setSearch("");
                    }}
                  >
                    <Check className={cn("mr-2 size-4", selectedId === firm.id ? "opacity-100" : "opacity-0")} />
                    {firm.name}
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
                  Yeni Firma Ekle
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <NewFirmDialog
        open={newDialogOpen}
        onOpenChange={setNewDialogOpen}
        initialName={search}
        onCreated={(firm) => {
          onFirmCreated(firm);
          onSelect(firm);
          setSearch("");
        }}
      />
    </>
  );
}
