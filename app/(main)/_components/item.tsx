"use client";

import { LucideIcon, ChevronUp, ChevronDown } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

interface ItemProps {
  id: Id<"documents">;
  documentIcon?: string;
  active?: boolean;
  expanded?: boolean;
  isSearch?: boolean;
  level?: number;
  onExpand?: () => void;
  label: string;
  onClick: () => void;
  icon: LucideIcon;
}

export const Item = ({
  id,
  label,
  onClick,
  icon: Icon,
  active,
  documentIcon,
  isSearch,
  level = 0,
  onExpand,
  expanded,
}: ItemProps) => {
  const ChevronIcon = expanded ? ChevronUp : ChevronDown;

  return (
    <div
      onClick={onClick}
      tabIndex={0}
      role="button"
      style={{ paddingLeft: level ? `${level * 12 + 12}px` : "9px" }}
      className={cn(
        "group min-h-[27px] text-sm py-1 pr-3 w-full hover:bg-slate-400/5 flex items-center text-muted-foreground font-medium",
        active && "bg-slate-400/5 text-orange-400 font-bold"
      )}
    >
      {!!id && (
        <div>
          <ChevronIcon className="h-[18px] mr-1 text-muted-foreground" />
        </div>
      )}
      <Icon className="shrink-0 h-[18px] mr-1 text-muted-foreground" />
      <span className="truncate">{label}</span>
    </div>
  );
};
