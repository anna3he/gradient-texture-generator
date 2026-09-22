"use client";

import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export function Folder({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Collapsible
      defaultOpen={defaultOpen}
      className="border-b border-white/6 last:border-b-0"
    >
      <CollapsibleTrigger className="group flex h-10 w-full items-center justify-between px-3 text-left">
        <span className="text-[11px] font-medium tracking-[0.14em] text-white/55 uppercase">
          {title}
        </span>
        <ChevronDown className="size-3.5 text-white/35 transition-transform group-data-open:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden">
        <div className={cn("flex flex-col gap-3 px-3 pb-3.5")}>{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}
