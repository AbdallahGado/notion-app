// Per-file explicit any directives removed to allow focused fixes; use narrower types where needed.
"use client";

//! THE MANE PAGE

import { ChevronsLeft, MenuIcon, PlusCircle } from "lucide-react";
import { ElementRef, useRef, useState, useEffect } from "react";
import { useMediaQuery } from "usehooks-ts";
import { useMutation, useQuery } from "convex/react";
import { cn } from "@/lib/utils"; // Utility function for conditional class names
import { api } from "@/convex/_generated/api"; // Ensure the correct path to your API
import { usePathname } from "next/navigation";
import { UserItem } from "./user-item"; // Adjust import paths as necessary
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import {
  Folder,
  FileText,
  ChevronDown,
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
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "@/components/mode-toggle";

interface NavigationProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Navigation = ({
  isCollapsed,
  setIsCollapsed,
}: NavigationProps) => {
  const isMobile = useMediaQuery("(max-width: 768px)"); // Check if the viewport is mobile size
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
      sidebarRef.current.style.width = isMobile ? "100%" : "240px";
      navbarRef.current.style.setProperty(
        "width",
        isMobile ? "0" : "calc(100% - 240px)"
      );
      navbarRef.current.style.setProperty("left", isMobile ? "100%" : "240px");
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

      sidebarRef.current.style.width = isMobile ? "100%" : "240px";
      navbarRef.current.style.setProperty(
        "width",
        isMobile ? "0" : "calc(100% - 240px)"
      );
      navbarRef.current.style.setProperty("left", isMobile ? "100%" : "240px");

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
  const handleCreate = () => {
    const promise = create({ title: "Untitled" });
    toast.promise(promise, {
      loading: "Creating a new note...",
      success: "New note created",
      error: "Failed to create a new note",
    });
  };

  const handleCreateFolder = () => {
    const promise = create({ title: "Untitled Folder", isFolder: true });
    toast.promise(promise, {
      loading: "Creating folder...",
      success: "New folder created",
      error: "Failed to create folder",
    });
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
      const promise = update({
        id: docId as Id<"documents">,
        parentDocument: parentId as Id<"documents">,
      });
      toast.promise(promise, {
        loading: "Moving note...",
        success: "Note moved",
        error: "Failed to move note",
      });
      await promise;
      setMoveDropdown(null);
    } catch {
      toast.error("An unexpected error occurred.");
    }
  }

  const handleRename = (id: string, currentTitle?: string) => {
    setEditingId(id);
    setEditValue(currentTitle ?? "");
  };

  const handleRenameSave = async (id: string) => {
    if (!editValue.trim()) return;
    try {
      const promise = update({
        id: id as Id<"documents">,
        title: editValue.trim(),
      });
      toast.promise(promise, {
        loading: "Renaming note...",
        success: "Note renamed",
        error: "Failed to rename note",
      });
      await promise;
      setEditingId(null);
    } catch {
      toast.error("An unexpected error occurred.");
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
      const promise = remove({ id: id as Id<"documents"> });
      toast.promise(promise, {
        loading: "Deleting note...",
        success: "Note deleted",
        error: "Failed to delete note",
      });
      await promise;
    } catch {
      toast.error("An unexpected error occurred.");
    }
  };

  function renderTree(nodes: TreeNode[], level = 0) {
    return (
      <ul
        className={
          level === 0
            ? "pl-0"
            : "pl-4 border-l border-gray-200 dark:border-gray-700"
        }
      >
        {nodes.map((doc: TreeNode) => {
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
            <li key={doc._id} className="py-1">
              <div
                className={`flex items-center gap-2 group rounded-lg px-2 py-1 hover:bg-indigo-50 dark:hover:bg-indigo-900 transition cursor-pointer ${pathname.includes(doc._id) ? "bg-indigo-100 dark:bg-indigo-800" : ""}`}
              >
                {hasChildren ? (
                  <button
                    type="button"
                    onClick={() => toggleExpand(doc._id)}
                    aria-pressed={!!expanded[doc._id]}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                    aria-label={
                      expanded[doc._id] ? "Collapse folder" : "Expand folder"
                    }
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
                      className="truncate flex-1 text-base font-medium text-indigo-700 dark:text-indigo-200 group-hover:underline transition-transform duration-100 hover:scale-[1.03] focus:scale-[1.03]"
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
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() =>
                        setMoveDropdown(
                          moveDropdown === doc._id ? null : doc._id
                        )
                      }
                    >
                      <ChevronRight className="h-4 w-4 mr-2 text-indigo-400 rotate-90" />{" "}
                      Move to
                    </DropdownMenuItem>
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
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                {/* Move to dropdown (outside for positioning) */}
                <div className="relative">
                  {moveDropdown === doc._id && (
                    <div className="move-to-dropdown absolute right-0 z-20 mt-2 w-40 bg-white dark:bg-[#23233a] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Move to folder:
                        </div>
                        <button
                          type="button"
                          onClick={() => setMoveDropdown(null)}
                          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                          aria-label="Close move to"
                        >
                          <X className="h-4 w-4 text-gray-400" />
                        </button>
                      </div>
                      <button
                        type="button"
                        className="w-full text-left px-2 py-1 rounded hover:bg-indigo-100 dark:hover:bg-indigo-800 text-sm"
                        onClick={() => handleMoveTo(doc._id, undefined)}
                      >
                        (No parent)
                      </button>
                      {allFolders.map((folder) => (
                        <button
                          key={folder._id}
                          type="button"
                          className="w-full text-left px-2 py-1 rounded hover:bg-indigo-100 dark:hover:bg-indigo-800 text-sm"
                          onClick={() => handleMoveTo(doc._id, folder._id)}
                        >
                          {folder.title || "Untitled"}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {/* close item container above before rendering nested lists */}
              {hasChildren && expanded[doc._id] && (
                <div>{renderTree(doc.children ?? [], level + 1)}</div>
              )}
              {doc.isFolder && expanded[doc._id] && !hasChildren && (
                <div className="pl-8 py-2 text-xs text-gray-400 dark:text-gray-500">
                  No notes in this folder
                </div>
              )}
            </li>
          );
        })}
      </ul>
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
          `group/sidebar h-screen bg-white/80 dark:bg-[#23233a]/80 shadow-2xl rounded-r-2xl overflow-y-auto relative flex flex-col w-64 z-[99999] border-r border-gray-200 dark:border-gray-800 transition-all`,
          isResetting && "transition-all ease-in-out duration-300",
          isMobile && "w-0"
        )}
      >
        {/* Logo/App Name and Search */}
        <div className="flex flex-col gap-2 px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <span className="text-2xl font-extrabold text-indigo-600 tracking-tight">
            Jotion
          </span>
          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full mt-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#23233a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={collapse}
          className={cn(
            "h-6 w-6 text-muted-foreground cursor-pointer rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-900 absolute top-3 right-2 opacity-0 group-hover/sidebar:opacity-100 transition duration-300",
            isMobile && "opacity-100"
          )}
        >
          <ChevronsLeft className="h-6 w-6" />
        </button>
        <div className="px-6 pt-4 pb-2">
          {/* Remove UserItem from here, move to bottom */}
          <button
            type="button"
            onClick={handleCreate}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-full shadow transition"
          >
            <PlusCircle className="h-5 w-5" />
            New Page
          </button>
          <button
            type="button"
            onClick={handleCreateFolder}
            className="w-full mt-2 flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-2 px-4 rounded-full shadow transition"
          >
            <Folder className="h-5 w-5" />
            New Folder
          </button>
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
        <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-[#23233a]/80 sticky bottom-0 z-10 flex flex-col gap-4">
          <ModeToggle />
          <UserItem />
        </div>
      </aside>
      <div
        ref={navbarRef}
        className={cn(
          "absolute top-0 left-64 z-[99999]",
          isMobile && "left-0 w-full"
        )}
      >
        <nav className="bg-transparent w-full">
          {isCollapsed && (
            <MenuIcon
              onClick={resetWidth}
              role="button"
              className="h-6 w-6 text-muted-foreground"
            />
          )}
        </nav>
      </div>
      {/* Resize handle: absolutely positioned, full height, always on top */}
      {!isMobile && !isCollapsed && (
        <div
          role="button"
          tabIndex={0}
          onMouseDown={handleMouseDown}
          onClick={resetWidth}
          className="fixed top-0 left-64 h-screen w-3 z-50 cursor-ew-resize bg-transparent hover:bg-indigo-200/30 focus:bg-indigo-200/40 transition-opacity duration-200 outline-none"
          style={{ userSelect: "none" }}
          aria-label="Resize sidebar"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") resetWidth();
          }}
        />
      )}
    </>
  );
};
