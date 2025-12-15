import { Dispatch, SetStateAction } from "react";
import type { Doc } from "@/convex/_generated/dataModel";

export interface TreeNode extends Doc<"documents"> {
  children: TreeNode[];
}

export interface TreeNodeItemProps {
  doc: TreeNode;
  level: number;
  tree: TreeNode[];
  expanded: Record<string, boolean>;
  setExpanded: Dispatch<SetStateAction<Record<string, boolean>>>;
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
  renderTree: (
    nodes: TreeNode[],
    level: number,
    tree: TreeNode[]
  ) => React.ReactNode;
}
