import React, { memo, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  GripVertical,
  ChevronDown,
  ChevronRight,
  Folder,
  FileText,
} from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TreeNodeActions from "./TreeNodeActions";
import MoveToDropdown from "./MoveToDropdown";
import { TreeNode, TreeNodeItemProps } from "./TreeNodeItem.types";

// ... (Utility functions collectDescendants and getAllFolders remain the same) ...
function collectDescendants(node: TreeNode, set: Set<string>) {
  for (const child of node.children) {
    set.add(child._id);
    collectDescendants(child, set);
  }
}

function getAllFolders(
  tree: TreeNode[],
  excludeId: string,
  descendants = new Set()
): TreeNode[] {
  let result: TreeNode[] = [];
  for (const node of tree) {
    if (node._id !== excludeId && !descendants.has(node._id)) {
      result.push(node);
      result = result.concat(
        getAllFolders(node.children, excludeId, descendants)
      );
    }
  }
  return result;
}
// ... (End of Utility functions) ...

/* eslint-disable complexity */
export const TreeNodeItem = memo(
  ({
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
    handleDelete,
    renderTree,
  }: TreeNodeItemProps) => {
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
      // Ensure drag layer is slightly above others but below modals
      zIndex: isDragging ? 10 : 0, 
    };

    const hasChildren = doc.children && doc.children.length > 0;
    const descendants = useMemo(() => {
      const s = new Set<string>();
      collectDescendants(doc, s);
      return s;
    }, [doc]);

    const allFolders = useMemo(
      () => getAllFolders(tree, doc._id, descendants),
      [tree, doc._id, descendants]
    );

    // Extract small handlers
    const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY, doc });
    };

    const handleToggleExpand = () =>
      setExpanded((prev) => ({ ...prev, [doc._id]: !prev[doc._id] }));

    const handleToggleMoveDropdown = () =>
      setMoveDropdown(moveDropdown === doc._id ? null : doc._id);

    const handleRenameClick = () => handleRename(doc._id, doc.title);

    const handleDeleteClick = () => handleDelete(doc._id, doc.title);

    const handleToggleStar = () => toggleStarred({ id: doc._id });

    return (
      <motion.li
        ref={setNodeRef}
        style={style}
        className={`w-full ${isDragging ? "opacity-75" : ""}`}
        // Keep initial motion for smooth loading transition, but simplify
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div
          // 💡 ENHANCEMENT: Clean, efficient styling and dynamic indentation
          className={`
            group flex items-center w-full min-h-8 text-sm cursor-pointer whitespace-nowrap transition-colors duration-200
            ${level > 0 ? `pl-[${level * 16}px]` : "pl-2"}
            pr-2 py-1.5 rounded-sm
            hover:bg-gray-100 dark:hover:bg-slate-700
            dark:text-gray-200 text-gray-800
            ${isDragging ? "bg-gray-200 dark:bg-slate-600 shadow-md" : ""}
          `}
          onContextMenu={handleContextMenu}
        >
          {/* 1. Drag Handle (Only visible on hover/drag) */}
          <button
            {...attributes}
            {...listeners}
            className={`
              p-0 mr-1 flex-shrink-0 cursor-grab active:cursor-grabbing transition-opacity duration-200
              ${isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
            `}
            aria-label="Drag to reorder"
          >
            <GripVertical className="h-4 w-4 text-gray-400/70 hover:text-gray-400" />
          </button>
          
          {/* 2. Expand/Collapse Button */}
          {hasChildren ? (
            <button
              onClick={handleToggleExpand}
              className="p-0 mr-1 flex-shrink-0"
              aria-label={
                expanded[doc._id] ? "Collapse folder" : "Expand folder"
              }
            >
              {expanded[doc._id] ? (
                <ChevronDown className="h-4 w-4 text-gray-400/80" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-400/80" />
              )}
            </button>
          ) : (
            // Spacer for alignment if no children
            <span className="w-5 flex-shrink-0" />
          )}
          
          {/* 3. Document/Folder Icon (Smaller, aligned) */}
          {doc.isFolder ? (
            <Folder className="h-4 w-4 mr-2 flex-shrink-0 text-yellow-500/80" />
          ) : (
            <FileText className="h-4 w-4 mr-2 flex-shrink-0 text-indigo-400/80" />
          )}
          
          {/* 4. Title/Rename Input */}
          <div className="flex-1 min-w-0">
            {editingId === doc._id ? (
              <input
                // 💡 ENHANCEMENT: Smaller text size, neutral colors
                className="w-full text-sm text-gray-800 dark:text-gray-200 bg-transparent border-b border-gray-300 dark:border-gray-500 focus:outline-none focus:border-indigo-500 px-1"
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
                  // 💡 ENHANCEMENT: Smaller text size, neutral colors
                  className="truncate flex-1 text-sm text-gray-800 dark:text-gray-200 hover:text-indigo-500 dark:hover:text-indigo-400"
                >
                  {doc.title || "Untitled"}
                </Link>
              </div>
            )}
          </div>
          
          {/* 5. Actions (Hidden by default, visible on group-hover) */}
          <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2">
            <TreeNodeActions
              doc={doc}
              onToggleMove={handleToggleMoveDropdown}
              onRename={handleRenameClick}
              onToggleStar={handleToggleStar}
              onDelete={handleDeleteClick}
              isDisabled={!doc}
            />
          </div>
          
          {/* 6. Move to dropdown (outside for positioning) */}
          <div className="relative">
            <MoveToDropdown
              openForId={moveDropdown}
              doc={doc}
              setOpenForId={setMoveDropdown}
              handleMoveTo={handleMoveTo}
              allFolders={allFolders}
            />
          </div>
        </div>
        {hasChildren && expanded[doc._id] && (
          // Adjusted wrapper for children for clean vertical stacking
          <div className="pt-0">{renderTree(doc.children, level + 1, tree)}</div>
        )}
      </motion.li>
    );
  }
);

TreeNodeItem.displayName = "TreeNodeItem";