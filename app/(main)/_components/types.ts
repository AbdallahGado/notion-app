import type { Doc } from "@/convex/_generated/dataModel";
import type { ReactNode } from "react";

export interface TreeNode extends Doc<"documents"> {
  children: TreeNode[];
}

export interface SortableItemProps {
  doc: TreeNode;
  level: number;
  tree: TreeNode[];
  expanded: Record<string, boolean>;
  setExpanded: (prev: Record<string, boolean>) => void;
  editingId: string | null;
  editValue: string;
  setEditValue: (value: string) => void;
  setEditingId: (id: string | null) => void;
  handleRename: (id: string, title: string) => void;
  handleRenameSave: (id: string) => void;
  toggleStarred: (args: { id: string }) => void;
  setContextMenu: (ctx: { x: number; y: number; doc: TreeNode } | null) => void;
  moveDropdown: string | null;
  setMoveDropdown: (id: string | null) => void;
  handleMoveTo: (docId: string, parentId: string | undefined) => void;
  handleDelete: (id: string, title: string) => void;
  allFolders: TreeNode[];
  renderTree: (nodes: TreeNode[], level: number, tree: TreeNode[]) => ReactNode;
}
