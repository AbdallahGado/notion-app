import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  GripVertical,
  ChevronDown,
  ChevronRight,
  Folder,
  FileText,
  Star,
  MoreVertical,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { Doc } from "@/convex/_generated/dataModel";

export interface TreeNode extends Doc<"documents"> {
  children: TreeNode[];
}

interface SortableItemProps {
  doc: TreeNode;
  level: number;
  tree: TreeNode[];
  expanded: Record<string, boolean>;
  setExpanded: (
    fn: (e: Record<string, boolean>) => Record<string, boolean>
  ) => void;
  editingId: string | null;
  editValue: string;
  setEditValue: (v: string) => void;
  setEditingId: (id: string | null) => void;
  handleRename: (id: string, title: string) => void;
  handleRenameSave: (id: string) => void;
  toggleStarred: (args: { id: string }) => void;
  setContextMenu: (ctx: { x: number; y: number; doc: TreeNode } | null) => void;
  moveDropdown: string | null;
  setMoveDropdown: (id: string | null) => void;
  handleMoveTo: (docId: string, parentId: string | undefined) => void;
  allFolders: TreeNode[];
  renderTree: (
    nodes: TreeNode[],
    level: number,
    tree: TreeNode[]
  ) => React.ReactNode;
  handleDelete: (id: string, title: string) => void;
}

const ActionsDropdown = React.memo(
  ({
    doc,
    moveDropdown,
    setMoveDropdown,
    handleRename,
    toggleStarred,
    handleDelete,
  }: {
    doc: TreeNode;
    moveDropdown: string | null;
    setMoveDropdown: (id: string | null) => void;
    handleRename: (id: string, title: string) => void;
    toggleStarred: (args: { id: string }) => void;
    handleDelete: (id: string, title: string) => void;
  }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="ml-1 p-2 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900 group"
          aria-label="More actions"
        >
          <MoreVertical className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 transition" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={() =>
            setMoveDropdown(moveDropdown === doc._id ? null : doc._id)
          }
        >
          <ChevronRight className="h-4 w-4 mr-2 text-indigo-400 rotate-90" />{" "}
          Move to
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleRename(doc._id ?? "", doc.title ?? "")}
        >
          <Pencil className="h-4 w-4 mr-2 text-indigo-400" /> Rename
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => toggleStarred({ id: doc._id })}>
          <Star
            className={`h-4 w-4 mr-2 ${doc.starred ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
            fill={doc.starred ? "#facc15" : "none"}
          />
          {doc.starred ? "Unfavorite" : "Favorite"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleDelete(doc._id ?? "", doc.title ?? "")}
          className="text-red-600"
        >
          <Trash2 className="h-4 w-4 mr-2" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
);

const MoveDropdown = React.memo(
  ({
    doc,
    moveDropdown,
    setMoveDropdown,
    handleMoveTo,
    allFolders,
  }: {
    doc: TreeNode;
    moveDropdown: string | null;
    setMoveDropdown: (id: string | null) => void;
    handleMoveTo: (docId: string, parentId: string | undefined) => void;
    allFolders: TreeNode[];
  }) => (
    <div className="relative">
      {moveDropdown === doc._id && (
        <div className="move-to-dropdown absolute right-0 z-20 mt-2 w-56 bg-white dark:bg-[#23233a] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Move to folder:
            </div>
            <button
              onClick={() => setMoveDropdown(null)}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Close move to"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          </div>
          <button
            className="w-full text-left px-2 py-1 rounded hover:bg-indigo-100 dark:hover:bg-indigo-800 text-sm"
            onClick={() => handleMoveTo(doc._id, undefined)}
          >
            (No parent)
          </button>
          {allFolders.map((folder) => (
            <button
              key={folder._id}
              className="w-full text-left px-2 py-1 rounded hover:bg-indigo-100 dark:hover:bg-indigo-800 text-sm"
              onClick={() => handleMoveTo(doc._id, folder._id)}
            >
              {folder.title || "Untitled"}
            </button>
          ))}
        </div>
      )}
    </div>
  )
);

const TitleDisplay = React.memo(
  ({
    doc,
    editingId,
    editValue,
    setEditValue,
    setEditingId,
    handleRenameSave,
  }: {
    doc: TreeNode;
    editingId: string | null;
    editValue: string;
    setEditValue: (v: string) => void;
    setEditingId: (id: string | null) => void;
    handleRenameSave: (id: string) => void;
  }) =>
    editingId === doc._id ? (
      <input
        className="w-full text-lg font-medium text-indigo-600 dark:text-indigo-300 bg-transparent border-b border-indigo-300 focus:outline-none focus:border-indigo-500 px-1"
        value={editValue}
        autoFocus
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={() => handleRenameSave(doc._id)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleRenameSave(doc._id);
          if (e.key === "Escape") setEditingId(null);
        }}
      />
    ) : (
      <div className="flex items-center gap-1 min-w-0 flex-1">
        <Link
          href={`/documents/${doc._id}`}
          className="truncate flex-1 text-lg font-medium text-indigo-600 dark:text-indigo-300 hover:underline"
        >
          {doc.title || "Untitled"}
        </Link>
      </div>
    )
);

// Give memoized subcomponents display names to improve DevTools & satisfy lint rules
ActionsDropdown.displayName = "ActionsDropdown";
MoveDropdown.displayName = "MoveDropdown";
TitleDisplay.displayName = "TitleDisplay";

const SortableItem: React.FC<SortableItemProps> = ({
  doc,
  level,
  tree,
  expanded,
  setExpanded,
  editingId,
  editValue,
  setEditValue,
  setEditingId,
  handleRename,
  handleRenameSave,
  toggleStarred,
  setContextMenu,
  moveDropdown,
  setMoveDropdown,
  handleMoveTo,
  allFolders,
  renderTree,
  handleDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: doc._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };
  const hasChildren = doc.children && doc.children.length > 0;

  return (
    <motion.li
      ref={setNodeRef}
      style={style}
      className={`py-2 ${isDragging ? "opacity-50" : ""}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer backdrop-blur-md border border-white/30 dark:border-slate-600/40 hover:border-white/50 dark:hover:border-slate-500/60 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/20 bg-white/15 dark:bg-slate-800/30 hover:bg-gradient-to-r hover:from-white/25 hover:via-white/20 hover:to-white/15 dark:hover:from-slate-800/40 dark:hover:via-slate-800/35 dark:hover:to-slate-800/30 ${isDragging ? "shadow-2xl scale-105" : ""}`}
        onContextMenu={(e: React.MouseEvent<HTMLDivElement>) => {
          e.preventDefault();
          setContextMenu({ x: e.clientX, y: e.clientY, doc });
        }}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        <button
          {...attributes}
          {...listeners}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-grab active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </button>
        {hasChildren ? (
          <button
            onClick={() =>
              setExpanded((e) => ({ ...e, [doc._id]: !e[doc._id] }))
            }
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label={expanded[doc._id] ? "Collapse folder" : "Expand folder"}
          >
            {expanded[doc._id] ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <span className="w-5" />
        )}
        {doc.isFolder ? (
          <Folder className="h-5 w-5 text-yellow-500" />
        ) : (
          <FileText className="h-5 w-5 text-indigo-400 dark:text-indigo-300 flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <TitleDisplay
            doc={doc}
            editingId={editingId}
            editValue={editValue}
            setEditValue={setEditValue}
            setEditingId={setEditingId}
            handleRenameSave={handleRenameSave}
          />
        </div>
        <button
          onClick={() => toggleStarred({ id: doc._id })}
          className="p-2 rounded-full hover:bg-yellow-50 dark:hover:bg-yellow-900 group"
          aria-label={doc.starred ? "Unstar note" : "Star note"}
        >
          <Star
            className={`h-5 w-5 ${doc.starred ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} group-hover:text-yellow-500 transition`}
            fill={doc.starred ? "#facc15" : "none"}
          />
        </button>
        <ActionsDropdown
          doc={doc}
          moveDropdown={moveDropdown}
          setMoveDropdown={setMoveDropdown}
          handleRename={handleRename}
          toggleStarred={toggleStarred}
          handleDelete={handleDelete}
        />
        <MoveDropdown
          doc={doc}
          moveDropdown={moveDropdown}
          setMoveDropdown={setMoveDropdown}
          handleMoveTo={handleMoveTo}
          allFolders={allFolders}
        />
      </motion.div>
      {hasChildren && expanded[doc._id] && (
        <div>{renderTree(doc.children, level + 1, tree)}</div>
      )}
    </motion.li>
  );
};

// Set displayName for the main component
SortableItem.displayName = "SortableItem";

export default SortableItem;
