"use client";
import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import Image from "next/image";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useUser } from "@clerk/clerk-react";
import { toast } from "sonner";
import { showErrorToast } from "@/components/ui/ErrorToast";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import SortableItem from "../../_components/SortableItem";
import { showKeyboardShortcuts } from "../../_components/KeyboardShortcuts";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { PlusCircle, FileText, Star, Folder } from "lucide-react";

interface TreeNode extends Doc<"documents"> {
  children: TreeNode[];
}

// SortableItemProps intentionally removed from this file — the actual
// SortableItem component is defined in `app/(main)/_components/SortableItem.tsx`.

function collectDescendants(node: TreeNode | undefined, set: Set<string>) {
  if (!node) return;
  for (const child of node.children ?? []) {
    set.add(child._id);
    collectDescendants(child, set);
  }
}

function getAllFolders(
  tree: TreeNode[],
  excludeId: string,
  descendants: Set<string> = new Set<string>()
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

/**
 * The documents page.
 *
 * This page is shown when the user is at the route /documents.
 *
 * It displays an empty state with a button to create a new document.
 * When the button is clicked, it calls the creation function.
 * If the creation function is not available, an error is shown.
 * If the creation fails, an error is shown.
 * If an unexpected error occurs, an error is shown.
 */
const DocumentsPage = memo(function DocumentsPage() {
  const { user } = useUser();
  const create = useMutation(api.documents.create);
  const remove = useMutation(api.documents.remove);
  const update = useMutation(api.documents.update);
  const documents = useQuery(api.documents.getSearch);
  const toggleStarred = useMutation(api.documents.toggleStarred);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"updatedAt" | "createdAt" | "title">(
    "updatedAt"
  );
  const [filterBy, setFilterBy] = useState<
    "all" | "starred" | "folders" | "notes"
  >("all");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    doc: TreeNode;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load recent searches from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("jotion-recent-searches");
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch {
        // Ignore invalid JSON
      }
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearch = useCallback((query: string) => {
    if (!query.trim()) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s !== query);
      const updated = [query, ...filtered].slice(0, 5); // Keep only 5 recent searches
      localStorage.setItem("jotion-recent-searches", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const onCreate = useCallback(() => {
    if (!create) {
      showErrorToast({
        message: "Creation function not available",
        description:
          "Unable to create a new note at this time. Please try again later.",
      });
      return;
    }
    const promise = create({ title: "Untitled" });
    toast.promise(promise, {
      loading: "Creating note...",
      success: "New note created",
      error: "Failed to create note",
    });
  }, [create]);

  const handleDelete = (id: string, title: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${title || "Untitled"}"? This action cannot be undone.`
      )
    )
      return;
    remove({ id: id as Id<"documents"> })
      .then(() => {
        toast.success("Note deleted");
      })
      .catch((error) => {
        console.error("Unexpected error during delete:", error);
        showErrorToast({
          message: "Delete Failed",
          description:
            "An unexpected error occurred while deleting the note. Please try again.",
          onRetry: () => handleDelete(id, title),
        });
      });
  };

  const handleRename = async (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditValue(currentTitle);
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

  const handleCreateFolder = useCallback(() => {
    const promise = create({ title: "Untitled Folder", isFolder: true });
    toast.promise(promise, {
      loading: "Creating folder...",
      success: "New folder created",
      error: "Failed to create folder",
    });
  }, [create]);

  // Global shortcut event handler: maps `shortcut` CustomEvent actions
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      const action = detail?.action as string | undefined;
      if (!action) return;

      switch (action) {
        case "create-document":
          onCreate();
          break;
        case "create-folder":
          handleCreateFolder();
          break;
        case "open-search": {
          // Focus the page search input (role=combobox)
          const searchInput = document.querySelector(
            'div[role="combobox"] input'
          ) as HTMLElement | null;
          if (searchInput) {
            searchInput.focus();
            setShowAutocomplete(true);
          }
          break;
        }
        case "toggle-shortcuts":
          showKeyboardShortcuts();
          break;
        case "save":
          // No document editor here; inform the user.
          toast("No active editor to save", { id: "no-save" });
          break;
        default:
          break;
      }
    };

    globalThis.addEventListener("shortcut", handler as EventListener);
    return () =>
      globalThis.removeEventListener("shortcut", handler as EventListener);
  }, [onCreate, handleCreateFolder]);

  // Move to logic
  const [moveDropdown, setMoveDropdown] = useState<string | null>(null);
  // Close moveDropdown and contextMenu on outside click
  useEffect(() => {
    if (!moveDropdown && !contextMenu) return;
    function handleClick(e: MouseEvent) {
      const dropdowns = document.querySelectorAll(
        ".move-to-dropdown, .context-menu"
      );
      let inside = false;
      dropdowns.forEach((el) => {
        if (el.contains(e.target as Node)) inside = true;
      });
      if (!inside) {
        setMoveDropdown(null);
        setContextMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [moveDropdown, contextMenu]);
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

  // Helper: build a tree from flat docs
  const buildTree = useCallback(
    (
      docs: Doc<"documents">[],
      parent: string | undefined = undefined
    ): TreeNode[] => {
      return docs
        .filter((doc) => doc.parentDocument === parent)
        .map((doc) => ({
          ...doc,
          children: buildTree(docs, doc._id),
        }));
    },
    []
  );

  // Memoize expensive computations
  const filteredDocs: Doc<"documents">[] = useMemo(() => {
    if (!documents) return [];
    return documents
      .filter((doc) => {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          (doc.title || "Untitled").toLowerCase().includes(searchLower) ||
          (doc.content || "").toLowerCase().includes(searchLower);
        const matchesFilter =
          filterBy === "all" ||
          (filterBy === "starred" && doc.starred) ||
          (filterBy === "folders" && doc.isFolder) ||
          (filterBy === "notes" && !doc.isFolder);
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        if (sortBy === "title") {
          return (a.title || "Untitled").localeCompare(b.title || "Untitled");
        }
        if (sortBy === "createdAt") {
          return (b._creationTime || 0) - (a._creationTime || 0);
        }
        if (sortBy === "updatedAt") {
          return (b._creationTime || 0) - (a._creationTime || 0); // Using _creationTime as proxy for updatedAt
        }
        return 0;
      });
  }, [documents, search, filterBy, sortBy]);

  // Memoize starred documents for quick access sidebar
  const starredDocs = useMemo(() => {
    if (!documents) return [];
    return (
      documents
        ?.filter((doc) => doc.starred)
        .sort((a, b) => (b._creationTime || 0) - (a._creationTime || 0))
        .slice(0, 10) || []
    ); // Top 10 recent starred
  }, [documents]);

  // Memoize the tree building to avoid expensive recomputation in each SortableItem
  const tree = useMemo(
    () => buildTree(filteredDocs),
    [filteredDocs, buildTree]
  );

  // Memoize the full documents tree for drag handling
  const documentsTree = useMemo(
    () => buildTree(documents || []),
    [documents, buildTree]
  );

  // State for expanded folders
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  // toggleExpand removed here — expansion is handled in SortableItem components

  // Drag and drop handlers
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
    // Add a class to the body to show we're dragging
    document.body.classList.add("dragging");
  }, []);

  const handleDragOver = useCallback(() => {
    // Intentionally not tracking the drop target yet — reserved for future UX
  }, []);

  const handleDragCancel = useCallback(() => {
    setActiveDragId(null);
    document.body.classList.remove("dragging");
  }, []);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) return;

    const activeDocId = active.id as string;
    const overId = over.id as string;

    if (activeDocId === overId) return;

    // Find the active and over documents
    const activeDoc = documents?.find((doc) => doc._id === activeDocId);
    const overDoc = documents?.find((doc) => doc._id === overId);

    if (!activeDoc || !overDoc) return;

    // Determine new parent
    let newParentId: string | undefined = undefined;

    if (overDoc.isFolder) {
      // Dropping on a folder - make it a child
      newParentId = overId;
    } else {
      // Dropping on a document - make it a sibling
      newParentId = overDoc.parentDocument;
    }

    // Prevent moving into itself or descendants
    if (newParentId === activeDocId) return;
    const descendants = new Set<string>();
    const activeNode = buildTree(documents || []).find(
      (node) => node._id === activeDocId
    );
    if (activeNode) collectDescendants(activeNode, descendants);
    if (descendants.has(newParentId!)) return;

    // Update the document's parent
    handleMoveTo(activeDocId, newParentId);
  }

  // The list item UI is implemented in `app/(main)/_components/SortableItem.tsx`
  // We import and use that component here to avoid defining a component
  // inside the DocumentsPage (which causes lint/TS complaints).

  // Render tree recursively (vertical, indented)
  function renderTree(nodes: TreeNode[], level: number, fullTree: TreeNode[]) {
    return (
      <SortableContext
        items={nodes.map((node) => node._id)}
        strategy={verticalListSortingStrategy}
      >
        <ul
          className={
            level === 0
              ? "pl-0"
              : "pl-6 border-l border-gray-200 dark:border-gray-700"
          }
        >
          {nodes.map((doc: TreeNode) => (
            <SortableItem
              key={doc._id}
              doc={doc}
              level={level}
              tree={fullTree}
              expanded={expanded}
              setExpanded={setExpanded}
              editingId={editingId}
              editValue={editValue}
              setEditValue={setEditValue}
              setEditingId={setEditingId}
              handleRename={handleRename}
              handleRenameSave={handleRenameSave}
              toggleStarred={(args) =>
                toggleStarred({ id: args.id as Id<"documents"> })
              }
              setContextMenu={setContextMenu}
              moveDropdown={moveDropdown}
              setMoveDropdown={setMoveDropdown}
              handleMoveTo={handleMoveTo}
              allFolders={getAllFolders(tree, doc._id)}
              renderTree={renderTree}
              handleDelete={handleDelete}
            />
          ))}
        </ul>
      </SortableContext>
    );
  }

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (documents !== undefined) {
      // Add a small delay to ensure smooth transition
      const timer = setTimeout(() => setIsLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [documents]);

  if (documents === undefined || isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="h-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 px-4 py-12"
      >
        <div className="w-full max-w-2xl bg-white/10 dark:bg-slate-900/20 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20 dark:border-slate-700/30">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-32"></div>
            <div className="flex gap-2">
              <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse w-24"></div>
              <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse w-24"></div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 h-10 bg-gray-300 dark:bg-gray-600 rounded-lg animate-pulse"></div>
            <div className="flex gap-2">
              <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded-lg animate-pulse w-20"></div>
              <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded-lg animate-pulse w-24"></div>
            </div>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map(() => (
              <div
                key={`skeleton-loading-${Math.random().toString(36).substring(2, 11)}`}
                className="flex items-center gap-2 animate-pulse"
              >
                <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="flex-1 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  if (!documents.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 px-4"
      >
        <div className="w-full max-w-md bg-white/10 dark:bg-slate-900/20 backdrop-blur-xl rounded-2xl shadow-2xl flex flex-col items-center p-8 space-y-6 border border-white/20 dark:border-slate-700/30">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative"
          >
            <Image
              src="/empty.png"
              alt="emptyPng"
              className="dark:hidden"
              width={220}
              height={220}
              style={{ width: "auto", height: "auto" }}
              priority={true}
            />
            <Image
              src="/empty-dark.png"
              alt="empty-dark-Png"
              className="hidden dark:block"
              width={220}
              height={220}
              style={{ width: "auto", height: "auto" }}
              priority={true}
            />
            <motion.div
              className="absolute -top-2 -right-2 bg-indigo-500 text-white rounded-full p-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            >
              <PlusCircle className="h-4 w-4" />
            </motion.div>
          </motion.div>
          <motion.h2
            className="text-2xl font-bold text-gray-900 dark:text-white text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Welcome to {user?.firstName}&apos;s Jotion
          </motion.h2>
          <motion.p
            className="text-gray-600 dark:text-gray-300 text-center text-base"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Create your first note to get started! Jotion helps you organize
            your thoughts, tasks, and ideas all in one place.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Button
              variant="outline"
              className="rounded-full hover:opacity-80 text-base px-6 py-3"
              onClick={onCreate}
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Create a note
            </Button>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1.1, 1, 1.1],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Sidebar for Quick Access */}
      <aside className="w-64 bg-white/15 dark:bg-slate-900/30 backdrop-blur-2xl border-r border-white/30 dark:border-slate-700/40 overflow-y-auto shadow-2xl relative z-10">
        <div className="p-6 border-b border-white/30 dark:border-slate-700/40 bg-gradient-to-r from-white/20 via-white/15 to-white/10 dark:from-slate-800/30 dark:via-slate-800/20 dark:to-slate-800/10 backdrop-blur-xl">
          <motion.h3
            className="text-lg font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
          >
            Quick Access
          </motion.h3>
          <motion.p
            className="text-sm text-gray-600 dark:text-gray-300"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Starred documents
          </motion.p>
        </div>
        <nav className="p-4">
          {starredDocs.length === 0 ? (
            <motion.div
              className="text-center text-gray-500 dark:text-gray-400 py-8 text-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="inline-block mb-2"
              >
                ⭐
              </motion.div>
              <br />
              No starred documents yet. Star some for quick access!
            </motion.div>
          ) : (
            <motion.ul
              className="space-y-2"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
            >
              {starredDocs.map((doc) => (
                <motion.li
                  key={doc._id}
                  variants={{
                    hidden: { opacity: 0, x: -20, scale: 0.9 },
                    visible: { opacity: 1, x: 0, scale: 1 },
                  }}
                  transition={{ duration: 0.4, type: "spring", stiffness: 300 }}
                  whileHover={{
                    x: 8,
                    scale: 1.03,
                    boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.3)",
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href={`/documents/${doc._id}`}
                    className="flex items-center gap-3 p-4 rounded-2xl hover:bg-gradient-to-r hover:from-white/30 hover:via-white/20 hover:to-white/10 dark:hover:from-slate-800/40 dark:hover:via-slate-800/30 dark:hover:to-slate-800/20 backdrop-blur-xl text-sm transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-indigo-500/20 border border-white/20 dark:border-slate-700/30 group"
                    aria-label={`Open ${doc.title || "Untitled"}`}
                  >
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Star
                        className="h-5 w-5 text-yellow-400 flex-shrink-0 drop-shadow-sm group-hover:drop-shadow-lg"
                        fill="#facc15"
                      />
                    </motion.div>
                    <span className="truncate flex-1 font-medium text-gray-800 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                      {doc.title || "Untitled"}
                    </span>
                    <motion.div
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      initial={{ x: -10 }}
                      animate={{ x: 0 }}
                    >
                      →
                    </motion.div>
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="p-8 border-b border-white/20 dark:border-slate-700/30 bg-white/10 dark:bg-slate-900/20 backdrop-blur-xl shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <motion.h2
              className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              Your Notes
            </motion.h2>
            <div className="flex gap-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  className="rounded-full hover:opacity-80 text-base px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={onCreate}
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  New Note
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  className="rounded-full hover:opacity-80 text-base px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={handleCreateFolder}
                >
                  <Folder className="h-5 w-5 mr-2" />
                  New Folder
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  className="rounded-full hover:opacity-80 text-base px-4 py-2"
                  onClick={() => showKeyboardShortcuts()}
                  aria-label="Show keyboard shortcuts"
                >
                  Shortcuts
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 mb-6 sm:flex-row">
          <div className="relative flex-1">
            <div
              className="relative"
              role="combobox"
              aria-expanded={showAutocomplete}
              aria-haspopup="listbox"
              aria-controls="search-suggestions"
            >
              <input
                type="text"
                placeholder="Search notes..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setShowAutocomplete(e.target.value.length > 0);
                }}
                onFocus={() => setShowAutocomplete(search.length > 0)}
                onBlur={(e) => {
                  // Only hide if not clicking on a suggestion
                  const relatedTarget = e.relatedTarget as HTMLElement;
                  if (!relatedTarget?.closest("#search-suggestions")) {
                    setTimeout(() => setShowAutocomplete(false), 200);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && search.trim()) {
                    saveRecentSearch(search.trim());
                    setShowAutocomplete(false);
                  } else if (e.key === "Escape") {
                    setShowAutocomplete(false);
                  } else if (showAutocomplete && recentSearches.length > 0) {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      const firstSuggestion = document.querySelector(
                        "#search-suggestions button"
                      ) as HTMLElement;
                      firstSuggestion?.focus();
                    }
                  }
                }}
                role="searchbox"
                aria-label="Search notes"
                aria-autocomplete="list"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#23233a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-shadow duration-200 hover:shadow-md focus:shadow-lg"
              />
              {showAutocomplete && recentSearches.length > 0 && (
                <div
                  id="search-suggestions"
                  role="listbox"
                  className="absolute top-full left-0 right-0 z-10 bg-white/95 dark:bg-[#23233a]/95 backdrop-blur-lg border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl mt-2 max-h-48 overflow-y-auto"
                  aria-label="Search suggestions"
                >
                  <div className="p-1">
                    {recentSearches.map((query, index) => (
                      <button
                        key={query}
                        role="option"
                        aria-selected={search === query}
                        onClick={() => {
                          setSearch(query);
                          setShowAutocomplete(false);
                          // Trigger search immediately
                          saveRecentSearch(query);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            setSearch(query);
                            setShowAutocomplete(false);
                            saveRecentSearch(query);
                          } else if (e.key === "ArrowDown") {
                            e.preventDefault();
                            const nextButton = e.currentTarget
                              .nextElementSibling as HTMLElement;
                            nextButton?.focus();
                          } else if (e.key === "ArrowUp") {
                            e.preventDefault();
                            if (index === 0) {
                              // Focus back to search input
                              const searchInput = e.currentTarget
                                .closest('div[role="combobox"]')
                                ?.querySelector("input");
                              (searchInput as HTMLElement)?.focus();
                            } else {
                              const prevButton = e.currentTarget
                                .previousElementSibling as HTMLElement;
                              prevButton?.focus();
                            }
                          } else if (e.key === "Escape") {
                            setShowAutocomplete(false);
                            const searchInput = e.currentTarget
                              .closest('div[role="combobox"]')
                              ?.querySelector("input");
                            (searchInput as HTMLElement)?.focus();
                          }
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-md text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2 focus:outline-none focus:bg-indigo-50 dark:focus:bg-indigo-900/30 focus:text-indigo-600 dark:focus:text-indigo-300 transition-all duration-150 group"
                      >
                        <span className="p-1 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800/50">
                          {index + 1}
                        </span>
                        {query}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              <select
                value={filterBy}
                onChange={(e) =>
                  setFilterBy(
                    e.target.value as "all" | "starred" | "folders" | "notes"
                  )
                }
                className="px-2 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#23233a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 min-w-[100px]"
              >
                <option value="all">All</option>
                <option value="starred">Starred</option>
                <option value="folders">Folders</option>
                <option value="notes">Notes</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as "updatedAt" | "createdAt" | "title"
                  )
                }
                className="px-2 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#23233a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 min-w-[120px]"
              >
                <option value="updatedAt">Last Modified</option>
                <option value="createdAt">Created</option>
                <option value="title">Title</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 bg-white/5 dark:bg-slate-900/10 backdrop-blur-sm">
          {filteredDocs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="py-12 flex items-center justify-center"
            >
              <div className="w-full max-w-md bg-white/10 dark:bg-slate-900/20 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/20 dark:border-slate-700/30 text-center relative overflow-hidden">
                <div className="relative z-10">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="mb-4 relative"
                  >
                    <FileText className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500" />
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur-2xl"
                      animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 360],
                      }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                  </motion.div>
                  <motion.h3
                    className="text-lg font-semibold bg-gradient-to-r from-gray-700 to-gray-500 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent mb-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                  >
                    No matching documents found
                  </motion.h3>
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                  >
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {search
                        ? "Try adjusting your search terms or filters"
                        : filterBy !== "all"
                          ? `No ${filterBy} documents found. Try changing the filter.`
                          : "Create your first document to get started!"}
                    </p>
                    {!search && filterBy === "all" && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-4"
                      >
                        <button
                          onClick={onCreate}
                          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-full text-sm font-medium transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
                        >
                          <PlusCircle className="w-4 h-4 mr-2" />
                          Create Document
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                </div>
                {/* Animated background elements */}
                <motion.div
                  className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
                <motion.div
                  className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-tr from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl"
                  animate={{
                    scale: [1.2, 1, 1.2],
                    rotate: [360, 180, 0],
                  }}
                  transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </div>
            </motion.div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragCancel={handleDragCancel}
              onDragEnd={(event) => {
                handleDragEnd(event);
                handleDragCancel();
              }}
            >
              <div
                className={`relative transition-opacity duration-200 ${activeDragId ? "opacity-50" : ""}`}
              >
                {renderTree(tree, 0, documentsTree)}
              </div>
            </DndContext>
          )}
        </div>
      </main>
    </motion.div>
  );
});

export default DocumentsPage;
