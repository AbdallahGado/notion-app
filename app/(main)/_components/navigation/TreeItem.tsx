"use client";

import React from "react";
import { ChevronRight, Folder, FileText, MoreVertical, Pencil, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { 
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";

interface TreeNode {
  _id: string;
  title?: string;
  parentDocument?: string;
  isFolder?: boolean;
  starred?: boolean;
  children?: TreeNode[];
}

interface TreeItemProps {
  doc: TreeNode;
  level?: number;
  expanded: Record<string, boolean>;
  onToggleExpand: (id: string) => void;
  pathname: string;
  editingId: string | null;
  editValue: string;
  onRename: (id: string, value: string) => void;
  onSetEditing: (id: string | null, value?: string) => void;
  onSetEditValue: (value: string) => void;
  onToggleStarred: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TreeItem = ({
  doc,
  level = 0,
  expanded,
  onToggleExpand,
  pathname,
  editingId,
  editValue,
  onRename,
  onSetEditing,
  onSetEditValue,
  onToggleStarred,
  onDelete,
}: TreeItemProps) => {
  const isSelected = pathname.includes(doc._id);
  const isExpanded = !!expanded[doc._id];

  const handleRename = () => {
    if (!editValue.trim()) return;
    onRename(doc._id, editValue.trim());
  };

  return (
    <div className="group/item">
      <div
        className={cn(
          "flex items-center gap-2 py-1 px-2 rounded-lg cursor-pointer transition-colors relative",
          isSelected ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
        )}
        style={{ paddingLeft: level ? `${(level * 12) + 8}px` : "8px" }}
      >
        <div 
          role="button" 
          className={cn("p-0.5 rounded-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors", (!doc.children?.length && !doc.isFolder) && "opacity-0")}
          onClick={(e) => { e.stopPropagation(); onToggleExpand(doc._id); }}
        >
          <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", isExpanded && "rotate-90")} />
        </div>

        {doc.isFolder ? <Folder className="h-4 w-4 text-amber-400 shrink-0" /> : <FileText className="h-4 w-4 shrink-0" />}

        {editingId === doc._id ? (
          <input 
            value={editValue} 
            onChange={(e) => onSetEditValue(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
            autoFocus
            className="flex-1 bg-transparent border-b border-indigo-500 text-sm focus:outline-none px-1"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <Link href={`/documents/${doc._id}`} className="flex-1 truncate text-sm font-medium">
            {doc.title || "Untitled"}
          </Link>
        )}

        <div className="opacity-0 group-hover/item:opacity-100 flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div role="button" className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md">
                <MoreVertical className="h-3.5 w-3.5" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 glass-panel" forceMount>
              <DropdownMenuItem onClick={() => onSetEditing(doc._id, doc.title || "")}>
                <Pencil className="h-4 w-4 mr-2" /> Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleStarred(doc._id)}>
                <Star className={cn("h-4 w-4 mr-2", doc.starred && "fill-yellow-400 text-yellow-400")} /> 
                {doc.starred ? "Unstar" : "Star"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500" onClick={() => onDelete(doc._id)}>
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {isExpanded && doc.children && (
        <div>
          {doc.children.map((child) => (
            <TreeItem 
              key={child._id} 
              doc={child} 
              level={level + 1} 
              expanded={expanded}
              onToggleExpand={onToggleExpand}
              pathname={pathname}
              editingId={editingId}
              editValue={editValue}
              onRename={onRename}
              onSetEditing={onSetEditing}
              onSetEditValue={onSetEditValue}
              onToggleStarred={onToggleStarred}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};
