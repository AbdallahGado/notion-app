import React, { memo } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Pencil,
  Star,
  Trash2,
  MoreVertical,
  ArrowRight,
} from "lucide-react"; // Changed ChevronRight to ArrowRight for 'Move to' clarity
import type { TreeNode } from "./TreeNodeItem.types";

type Props = {
  doc: TreeNode;
  onToggleMove: () => void;
  onRename: () => void;
  onToggleStar: () => void;
  onDelete: () => void;
  isDisabled?: boolean;
};

function TreeNodeActions({
  doc,
  onToggleMove,
  onRename,
  onToggleStar,
  onDelete,
  isDisabled = false,
}: Readonly<Props>) {
  // Define a consistent icon size for actions
  const ICON_SIZE = "h-4 w-4";
  
  // Define a subtle hover background style
  const HOVER_BG = "hover:bg-gray-200 dark:hover:bg-slate-600";

  return (
    <div className="flex items-center gap-0.5">
      {/* 1. Star Button (Small and Subtle) */}
      <button
        onClick={onToggleStar}
        className={`p-1 rounded-sm ${HOVER_BG} transition duration-150`}
        aria-label={doc.starred ? "Unstar note" : "Star note"}
      >
        <Star
          // 💡 ENHANCEMENT: Smaller icon (h-4 w-4), fainter default text
          className={`${ICON_SIZE} ${
            doc.starred
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-400 dark:text-gray-500"
          } transition duration-150`}
          fill={doc.starred ? "#facc15" : "none"}
        />
      </button>

      {/* 2. More Actions Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            // 💡 ENHANCEMENT: Smaller padding, neutral hover color
            className={`p-1 rounded-sm ${HOVER_BG} transition duration-150`}
            aria-label="More actions"
            disabled={isDisabled}
          >
            <MoreVertical 
              // 💡 ENHANCEMENT: Smaller icon (h-4 w-4), neutral text color
              className={`${ICON_SIZE} text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition`} 
            />
          </button>
        </DropdownMenuTrigger>
        
        {/* 3. Dropdown Menu Content */}
        {/* NOTE: Assuming '@/components/ui/dropdown-menu' handles dark mode for the content container */}
        <DropdownMenuContent align="end" className="w-48 shadow-lg dark:border-slate-600">
          
          {/* Move to */}
          <DropdownMenuItem onClick={onToggleMove}>
            {/* 💡 ENHANCEMENT: Changed icon to ArrowRight, used neutral accent color */}
            <ArrowRight className={`${ICON_SIZE} mr-2 text-gray-500 dark:text-gray-400`} />
            Move to
          </DropdownMenuItem>

          {/* Rename */}
          <DropdownMenuItem onClick={onRename}>
            <Pencil className={`${ICON_SIZE} mr-2 text-gray-500 dark:text-gray-400`} /> 
            Rename
          </DropdownMenuItem>

          {/* Star/Favorite */}
          <DropdownMenuItem onClick={onToggleStar}>
            <Star
              className={`${ICON_SIZE} mr-2 ${
                doc.starred
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-400 dark:text-gray-500"
              }`}
              fill={doc.starred ? "#facc15" : "none"}
            />
            {doc.starred ? "Unfavorite" : "Favorite"}
          </DropdownMenuItem>

          <DropdownMenuSeparator className="dark:bg-slate-700" />
          
          {/* Delete */}
          {/* 💡 ENHANCEMENT: Use hover state for emphasis on text-red-600 */}
          <DropdownMenuItem onClick={onDelete} className="focus:bg-red-50 dark:focus:bg-red-900/50 text-red-600 dark:text-red-400">
            <Trash2 className={`${ICON_SIZE} mr-2`} /> 
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
export default memo(TreeNodeActions);