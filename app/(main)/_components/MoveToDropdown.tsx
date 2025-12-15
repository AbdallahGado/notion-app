import React, { memo } from "react";
import { X } from "lucide-react";
import type { TreeNode } from "./TreeNodeItem.types";

type Props = {
  openForId: string | null;
  doc: TreeNode;
  setOpenForId: (id: string | null) => void;
  handleMoveTo: (id: string, parentId?: string) => void;
  allFolders: TreeNode[];
};

const MoveToDropdown = ({
  openForId,
  doc,
  setOpenForId,
  handleMoveTo,
  allFolders,
}: Readonly<Props>) => {
  if (openForId !== doc._id) return null;

  return (
    <div className="move-to-dropdown absolute right-0 z-20 mt-2 w-56 bg-white dark:bg-[#23233a] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Move to folder:
        </div>
        <button
          onClick={() => setOpenForId(null)}
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
  );
};

export default memo(MoveToDropdown);
