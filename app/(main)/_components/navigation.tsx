// Per-file explicit any directives removed to allow focused fixes; use narrower types where needed.
"use client";

//! THE MANE PAGE

import { ChevronsLeft, MenuIcon, PlusCircle, Search as SearchIcon } from "lucide-react";
import { ElementRef, useRef, useState, useEffect } from "react";

import { useMutation, useQuery } from "convex/react";
import { cn } from "@/lib/utils"; // Utility function for conditional class names
import { api } from "@/convex/_generated/api"; // Ensure the correct path to your API
import { usePathname } from "next/navigation";
import { UserItem } from "./user-item"; // Adjust import paths as necessary
import { toast } from "sonner";
import { showErrorToast } from "@/components/ui/ErrorToast";
import { Id } from "@/convex/_generated/dataModel";
import {
  Folder,
  FileText,
  ChevronRight,
  Star,
  Pencil,
  MoreVertical,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "@/components/mode-toggle";
import { motion } from "framer-motion";
import styles from "./tree.module.css";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavigationProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobile?: boolean;
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (open: boolean) => void;
}

export const Navigation = ({
  isCollapsed,
  setIsCollapsed,
  isMobile = false,
  isMobileMenuOpen = false,
  setIsMobileMenuOpen,
}: NavigationProps) => {
  const isResizingRef = useRef(false); // Ref to track resizing state
  const pathname = usePathname();
  const create = useMutation(api.documents.create); // Mutation for creating documents
  const documents = useQuery(api.documents.getSearch); // Query to fetch documents
  const update = useMutation(api.documents.update);
  const remove = useMutation(api.documents.remove);
  const toggleStarred = useMutation(api.documents.toggleStarred);
  const sidebarRef = useRef<ElementRef<"aside">>(null);
  const navbarRef = useRef<ElementRef<"div">>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // Keep this effect self-contained (do not reference collapse/resetWidth)
  // so we avoid the exhaustive-deps warning while still reacting to layout changes.
  useEffect(() => {
    if (!sidebarRef.current || !navbarRef.current) return;
    if (isMobile) {
      // collapse
      sidebarRef.current.style.width = "0";
      navbarRef.current.style.setProperty("width", "100%");
      navbarRef.current.style.setProperty("left", "0");
    } else {
      // reset width
      sidebarRef.current.style.width = "240px";
      navbarRef.current.style.setProperty("width", "calc(100% - 240px)");
      navbarRef.current.style.setProperty("left", "240px");
    }
  }, [isMobile, pathname]);

  // Start resizing when mouse is down
  const handleMouseDown = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.preventDefault();
    event.stopPropagation();
    isResizingRef.current = true;

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Handle resizing of the sidebar
  const handleMouseMove = (event: MouseEvent) => {
    if (!isResizingRef.current) return;
    let newWidth = event.clientX;
    newWidth = Math.min(Math.max(newWidth, 240), 480);
    if (sidebarRef.current && navbarRef.current) {
      sidebarRef.current.style.width = `${newWidth}px`;
      navbarRef.current.style.setProperty("left", `${newWidth}px`);
      navbarRef.current.style.setProperty(
        "width",
        `calc(100% - ${newWidth}px)`
      );
    }
  };

  // Stop resizing
  const handleMouseUp = () => {
    isResizingRef.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  // Reset sidebar width
  const resetWidth = () => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(false);
      setIsResetting(true);

      sidebarRef.current.style.width = "240px";
      navbarRef.current.style.setProperty("width", "calc(100% - 240px)");
      navbarRef.current.style.setProperty("left", "240px");

      setTimeout(() => {
        setIsResetting(false);
      }, 300);
    }
  };
  // Collapse sidebar
  const collapse = () => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(true);
      setIsResetting(true);
      sidebarRef.current.style.width = "0";
      navbarRef.current.style.setProperty("width", "100%");
      navbarRef.current.style.setProperty("left", "0");

      setTimeout(() => {
        setIsResetting(false);
      }, 300);
    }
  };

  // Handle document creation
  const handleCreate = async () => {
    try {
      await create({ title: "Untitled" });
      toast.success("New note created");
    } catch (error) {
      console.error("Unexpected error during note creation:", error);
      showErrorToast({
        message: "Creation Failed",
        description:
          "An unexpected error occurred while creating the note. Please try again.",
        onRetry: () => {
          void handleCreate();
        },
      });
    }
  };

  const handleCreateFolder = async () => {
    try {
      await create({ title: "Untitled Folder", isFolder: true });
      toast.success("New folder created");
    } catch (error) {
      console.error("Unexpected error during folder creation:", error);
      showErrorToast({
        message: "Folder Creation Failed",
        description:
          "An unexpected error occurred while creating the folder. Please try again.",
        onRetry: () => {
          void handleCreateFolder();
        },
      });
    }
  };
  // Tree logic for sidebar
  type TreeNode = {
    _id: string;
    title?: string;
    parentDocument?: string;
    isFolder?: boolean;
    starred?: boolean;
    children?: TreeNode[];
    [key: string]: unknown;
  };
  function buildTree(
    docs: TreeNode[],
    parent: string | undefined = undefined
  ): TreeNode[] {
    return docs
      .filter((doc) => doc.parentDocument === parent)
      .map((doc) => ({
        ...doc,
        children: buildTree(docs, doc._id),
      }));
  }
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const toggleExpand = (id: string) =>
    setExpanded((e) => ({ ...e, [id]: !e[id] }));
  // Move to logic
  const [moveDropdown, setMoveDropdown] = useState<string | null>(null);

  function getAllFolders(
    tree: TreeNode[],
    excludeId: string,
    descendants: Set<string> = new Set()
  ): TreeNode[] {
    let result: TreeNode[] = [];
    for (const node of tree) {
      if (node._id !== excludeId && !descendants.has(node._id)) {
        result.push(node);
        result = result.concat(
          getAllFolders(node.children ?? [], excludeId, descendants)
        );
      }
    }
    return result;
  }

  function collectDescendants(node: TreeNode, set: Set<string>) {
    for (const child of node.children ?? []) {
      set.add(child._id);
      collectDescendants(child, set);
    }
  }

  // Normalized documents typed as TreeNode[] for safer usage throughout this component
  const docs = (documents ?? []) as TreeNode[];

  async function handleMoveTo(docId: string, parentId: string | undefined) {
    try {
      await update({
        id: docId as Id<"documents">,
        parentDocument: parentId as Id<"documents">,
      });
      toast.success("Note moved");
      setMoveDropdown(null);
    } catch (error) {
      console.error("Unexpected error during move:", error);
      showErrorToast({
        message: "Move Failed",
        description:
          "An unexpected error occurred while moving the note. Please try again.",
        onRetry: () => {
          void handleMoveTo(docId, parentId);
        },
      });
    }
  }

  const handleRename = (id: string, currentTitle?: string) => {
    setEditingId(id);
    setEditValue(currentTitle ?? "");
  };

  const handleRenameSave = async (id: string) => {
    if (!editValue.trim()) return;
    try {
      await update({
        id: id as Id<"documents">,
        title: editValue.trim(),
      });
      toast.success("Note renamed");
      setEditingId(null);
    } catch (error) {
      console.error("Unexpected error during rename:", error);
      showErrorToast({
        message: "Rename Failed",
        description:
          "An unexpected error occurred while renaming the note. Please try again.",
        onRetry: () => {
          void handleRenameSave(id);
        },
      });
    }
  };

  const handleDelete = async (id: string, title?: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${title || "Untitled"}"? This action cannot be undone.`
      )
    )
      return;
    try {
      await remove({ id: id as Id<"documents"> });
      toast.success("Note deleted");
    } catch (error) {
      console.error("Unexpected error during delete:", error);
      showErrorToast({
        message: "Delete Failed",
        description:
          "An unexpected error occurred while deleting the note. Please try again.",
        onRetry: () => {
          void handleDelete(id, title);
        },
      });
    }
  };

  function renderTree(nodes: TreeNode[], level = 0) {
    return (
      <motion.ul
        className={cn(
          "treeContainer",
          level === 0
            ? "pl-0"
            : "pl-4 border-l border-white/30 dark:border-slate-600/40"
        )}
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.03,
            },
          },
        }}
      >
        {nodes.map((doc: TreeNode, index) => {
          const hasChildren = (doc.children ?? []).length > 0;
          // Collect descendants to prevent moving into them
          const descendants = new Set<string>();
          collectDescendants(doc, descendants);
          // All possible folders to move to (excluding self and descendants)
          const allFolders = getAllFolders(
            buildTree(docs),
            doc._id,
            descendants
          );
          return (
            <motion.li
              key={doc._id}
              className={styles.treeNode}
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0 },
              }}
              transition={{ duration: 0.3, delay: index * 0.02 }}
            >
              <motion.div
                className={cn(
                  styles.treeNodeContent,
                  pathname.includes(doc._id) && styles.active
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {hasChildren ? (
                  <button
                    type="button"
                    onClick={() => toggleExpand(doc._id)}
                    aria-pressed={!!expanded[doc._id]}
                    className={styles.expandButton}
                    aria-label={
                      expanded[doc._id] ? "Collapse folder" : "Expand folder"
                    }
                  >
                    <motion.span
                      className={styles.expandIcon}
                      animate={{ rotate: expanded[doc._id] ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </motion.span>
                  </button>
                ) : (
                  <span className="w-5" />
                )}
                {doc.isFolder ? (
                  <Folder
                    className={cn(styles.nodeIcon, "h-5 w-5")}
                    data-type="folder"
                  />
                ) : (
                  <FileText
                    className={cn(styles.nodeIcon, "h-5 w-5")}
                    data-type="file"
                  />
                )}
                {editingId === doc._id ? (
                  <input
                    className="flex-1 text-base font-medium text-indigo-700 dark:text-indigo-200 bg-transparent border-b border-indigo-300 focus:outline-none focus:border-indigo-500 px-1"
                    value={editValue}
                    autoFocus
                    ref={(input) => {
                      if (input) {
                        input.focus();
                        input.setSelectionRange(0, input.value.length);
                      }
                    }}
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
                      className={styles.nodeTitle}
                      tabIndex={0}
                      aria-label={`Open ${doc.title || "Untitled"}`}
                    >
                      {doc.title || "Untitled"}
                    </Link>
                    {doc.isFolder && (
                      <span className="ml-1 text-xs text-gray-400 dark:text-gray-500">
                        ({(doc.children ?? []).length})
                      </span>
                    )}
                  </div>
                )}
                {doc.starred && (
                  <Star className="h-4 w-4 text-yellow-400 ml-1" />
                )}
                {/* Actions dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="ml-1 p-2 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900 group transition-transform duration-100 hover:scale-110 focus:scale-110"
                      aria-label="More actions"
                      tabIndex={0}
                    >
                      <MoreVertical className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 transition" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 font-medium">
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                         <ChevronRight className="h-4 w-4 text-slate-400" />
                         Move to
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="w-48 max-h-60 overflow-y-auto" sideOffset={8} alignOffset={-5}>
                        <DropdownMenuItem onClick={() => handleMoveTo(doc._id, undefined)}>
                           <div className="flex items-center gap-2">
                             <FileText className="h-3 w-3 text-slate-400" />
                             <span className="truncate max-w-[140px]">(No parent)</span>
                           </div>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {allFolders.length === 0 && (
                           <div className="px-2 py-1.5 text-xs text-slate-400 text-center">No folders available</div>
                        )}
                        {allFolders.map((folder) => (
                           <DropdownMenuItem key={folder._id} onClick={() => handleMoveTo(doc._id, folder._id)}>
                              <div className="flex items-center gap-2">
                                <Folder className="h-3 w-3 text-emerald-500" />
                                <span className="truncate max-w-[140px]">{folder.title || "Untitled"}</span>
                              </div>
                           </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleRename(doc._id, doc.title)}
                    >
                      <Pencil className="h-4 w-4 mr-2 text-indigo-400" /> Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        toggleStarred({ id: doc._id as Id<"documents"> })
                      }
                    >
                      <Star
                        className={`h-4 w-4 mr-2 ${doc.starred ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                        fill={doc.starred ? "#facc15" : "none"}
                      />
                      {doc.starred ? "Unfavorite" : "Favorite"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDelete(doc._id, doc.title)}
                      className="text-red-600 group/delete"
                    >
                      <Trash2 className="h-4 w-4 mr-2 group-hover/delete:animate-bounce" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                {/* Manual Move to dropdown removed */}
              </motion.div>
              {/* close item container above before rendering nested lists */}
              {hasChildren && expanded[doc._id] && (
                <motion.div
                  className={styles.childrenContainer}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderTree(doc.children ?? [], level + 1)}
                </motion.div>
              )}
              {doc.isFolder && expanded[doc._id] && !hasChildren && (
                <div className="pl-8 py-2 text-xs text-gray-400 dark:text-gray-500">
                  No notes in this folder
                </div>
              )}
            </motion.li>
          );
        })}
      </motion.ul>
    );
  }

  // Filter and sort documents by search and starred status
  const filteredDocs = docs.filter((doc) =>
    (doc.title || "Untitled").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <aside
        ref={sidebarRef}
        className={cn(
          `group/sidebar h-screen glass-card rounded-r-3xl overflow-y-auto relative flex flex-col w-64 z-[99999] transition-all duration-500 ease-in-out shadow-2xl backdrop-blur-xl bg-white/50 dark:bg-[#1F1F1F]/60 border-r border-black/5 dark:border-white/5`,
          isResetting && "transition-all ease-in-out duration-500",
          isMobile && "w-0"
        )}
      >
        {/* Logo/App Name and Search */}
        <div className="flex flex-col gap-3 px-4 py-6">
          <motion.div
            className="flex items-center gap-2 pl-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
             <div className="h-6 w-6 rounded-md bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-indigo-500/20 shadow-lg">
                J
             </div>
             <span className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">
                Jotion
             </span>
          </motion.div>

          <motion.div
             className="relative pt-2"
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.1 }}
          >
             <SearchIcon className="absolute left-3 top-1/2 -translate-y-[calc(50%-4px)] h-4 w-4 text-slate-400" />
             <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearch(e.target.value)
                }
                className="w-full pl-9 pr-4 py-2 h-9 rounded-lg border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium"
             />
          </motion.div>
        </div>

        {/* Mobile Close Button */}
        {isMobile && (
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen?.(false)}
            className="absolute top-4 right-4 z-10 p-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Close navigation menu"
          >
            <X className="h-4 w-4 text-slate-500" />
          </button>
        )}

        {/* Desktop Collapse Button */}
        {!isMobile && (
          <button
            type="button"
            onClick={collapse}
            className={cn(
              "h-6 w-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer rounded-sm hover:bg-black/5 dark:hover:bg-white/5 absolute top-3 right-3 opacity-0 group-hover/sidebar:opacity-100 transition-all duration-300"
            )}
            aria-label="Collapse sidebar"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
        )}
        <div className="px-4 pt-4 pb-2 flex flex-col gap-2">
          {/* Remove UserItem from here, move to bottom */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  type="button"
                  onClick={handleCreate}
                  className="group w-full flex items-center gap-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white py-2 px-3 rounded-lg hover:bg-gray-100/50 dark:hover:bg-slate-800/50 transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-slate-700"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="p-1 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
                    <PlusCircle className="h-4 w-4" />
                  </div>
                  <span>New Page</span>
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Create a new document</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  type="button"
                  onClick={handleCreateFolder}
                  className="group w-full flex items-center gap-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white py-2 px-3 rounded-lg hover:bg-gray-100/50 dark:hover:bg-slate-800/50 transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-slate-700"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="p-1 rounded-md bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/50 transition-colors">
                    <Folder className="h-4 w-4" />
                  </div>
                  <span>New Folder</span>
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Create a new folder</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex-1 px-2 pt-2 pb-6">
          {filteredDocs.length === 0 ? (
            <div className="py-8 text-center text-gray-400 dark:text-gray-500">
              No results found.
            </div>
          ) : (
            renderTree(buildTree(filteredDocs))
          )}
        </div>
        {/* Theme toggle at the bottom above user info */}
        <div className="px-4 py-4 border-t border-white/40 dark:border-slate-700/50 bg-gradient-to-t from-white/30 via-white/20 to-white/10 dark:from-slate-900/40 dark:via-slate-900/30 dark:to-slate-900/20 backdrop-blur-lg sticky bottom-0 z-10 flex flex-col gap-4 shadow-inner">
          <ModeToggle />
          <UserItem />
        </div>
      </aside>
      {/* Mobile Menu Button */}
      {isMobile && isCollapsed && (
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={() => setIsMobileMenuOpen?.(true)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 dark:bg-slate-800/50 dark:hover:bg-slate-700/50 backdrop-blur-sm transition-colors"
            aria-label="Open navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            <MenuIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      )}

      {/* Desktop Menu Button */}
      {!isMobile && (
        <div
          ref={navbarRef}
          className={cn(
            "fixed top-0 left-64 z-[99999] transition-all duration-300 ease-in-out",
            isCollapsed && "left-0"
          )}
          style={{ width: isCollapsed ? "100%" : "calc(100% - 240px)" }}
        >
          <nav className="bg-transparent w-full">
            {isCollapsed && (
              <button
                onClick={resetWidth}
                className="p-2 m-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                aria-label="Expand sidebar"
              >
                <MenuIcon className="h-6 w-6 text-muted-foreground" />
              </button>
            )}
          </nav>
        </div>
      )}
      {/* Resize handle: absolutely positioned, full height, always on top */}
      {!isMobile && !isCollapsed && (
        <div
          role="button"
          tabIndex={0}
          onMouseDown={handleMouseDown}
          onClick={resetWidth}
          className="fixed top-0 left-64 h-screen w-1 z-50 cursor-ew-resize bg-transparent hover:bg-indigo-500/50 active:bg-indigo-500/80 transition-all duration-200 group-hover/sidebar:w-1.5"
          style={{ userSelect: "none" }}
          aria-label="Resize sidebar"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              resetWidth();
            }
          }}
        />
      )}
    </>
  );
};
