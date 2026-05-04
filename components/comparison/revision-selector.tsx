"use client";

import Link from "next/link";
import { History } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function RevisionSelector({
  comparisonId,
  current,
  available,
  latest,
}: {
  comparisonId: string;
  current: number;
  available: number[];
  latest: number;
}) {
  if (available.length <= 1) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <History className="mr-1 size-4" />
          Revize {current}
          {current === latest && <span className="text-muted-foreground ml-1 text-xs">(son)</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Revize Geçmişi</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {available.map((r) => (
          <DropdownMenuItem key={r} asChild>
            <Link href={`/comparisons/${comparisonId}${r === latest ? "" : `?revision=${r}`}`}>
              Revize {r} {r === latest && <span className="text-muted-foreground ml-2 text-xs">(son)</span>}
              {r === current && <span className="ml-2 text-xs">●</span>}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
