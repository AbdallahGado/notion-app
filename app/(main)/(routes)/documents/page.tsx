"use client";

import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@clerk/clerk-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { PlusCircle, Folder, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { showErrorToast } from "@/components/ui/ErrorToast";
import SortableItem from "../../_components/SortableItem";
import { showKeyboardShortcuts } from "../../_components/KeyboardShortcuts";

/* -------------------------------------------------------------------------- */
/* Utils                                                                      */
/* -------------------------------------------------------------------------- */

interface TreeNode extends Doc<"documents"> {
  children: TreeNode[];
}

function collectDescendants(node: TreeNode, set: Set<string>) {
  for (const child of node.children) {
    set.add(child._id);
    collectDescendants(child, set);
  }
}

function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

/* -------------------------------------------------------------------------- */
/* Starred Sidebar                                                             */
/* -------------------------------------------------------------------------- */

const StarredSidebar = memo(function StarredSidebar({
  starredDocs,
}: {
  starredDocs: Doc<"documents">[];
}) {
  return (
    <aside className="w-64 shrink-0 bg-white/15 dark:bg-slate-900/30 backdrop-blur-2xl border-l border-white/30 dark:border-slate-700/40 overflow-y-auto">
      <div className="p-6 border-b border-white/30 dark:border-slate-700/40">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Quick Access
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Starred documents
        </p>
      </div>

      <nav className="p-4">
        {starredDocs.length === 0 ? (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            ⭐ No starred documents yet
          </p>
        ) : (
          <ul className="space-y-2">
            {starredDocs.map((doc) => (
              <li key={doc._id}>
                <Link
                  href={`/documents/${doc._id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-100/40 dark:hover:bg-indigo-900/30 transition"
                >
                  <Star className="h-4 w-4 text-yellow-400" fill="#facc15" />
                  <span className="truncate text-sm font-medium">
                    {doc.title || "Untitled"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </aside>
  );
});

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

const DocumentsPage = memo(function DocumentsPage() {
  const { user } = useUser();

  const create = useMutation(api.documents.create);
  const update = useMutation(api.documents.update);
  const remove = useMutation(api.documents.remove);
  const toggleStarred = useMutation(api.documents.toggleStarred);
  const documents = useQuery(api.documents.getSearch);

  /* ------------------------------- UI state ------------------------------- */

  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput, 300);

  const [filterBy, setFilterBy] = useState<
    "all" | "starred" | "folders" | "notes"
  >("all");

  const [sortBy, setSortBy] = useState<
    "updatedAt" | "createdAt" | "title"
  >("updatedAt");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  /* ------------------------------ DnD setup ------------------------------- */

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  /* ---------------------------- Tree building ----------------------------- */

  const treeData = useMemo(() => {
    if (!documents) return { tree: [] as TreeNode[], map: new Map() };

    const map = new Map<string, TreeNode>();
    documents.forEach((doc) =>
      map.set(doc._id, { ...doc, children: [] })
    );

    const tree: TreeNode[] = [];
    map.forEach((node) => {
      if (node.parentDocument && map.has(node.parentDocument)) {
        map.get(node.parentDocument)!.children.push(node);
      } else {
        tree.push(node);
      }
    });

    return { tree, map };
  }, [documents]);

  const filteredTree = useMemo(() => {
    function filter(nodes: TreeNode[]): TreeNode[] {
      return nodes
        .filter((n) => {
          const matchesSearch =
            (n.title || "Untitled")
              .toLowerCase()
              .includes(search.toLowerCase()) ||
            (n.content || "")
              .toLowerCase()
              .includes(search.toLowerCase());

          const matchesFilter =
            filterBy === "all" ||
            (filterBy === "starred" && n.starred) ||
            (filterBy === "folders" && n.isFolder) ||
            (filterBy === "notes" && !n.isFolder);

          return matchesSearch && matchesFilter;
        })
        .map((n) => ({ ...n, children: filter(n.children) }));
    }

    return filter(treeData.tree);
  }, [treeData.tree, search, filterBy]);

  const starredDocs = useMemo(() => {
    return (
      documents
        ?.filter((d) => d.starred)
        .sort((a, b) => (b._creationTime || 0) - (a._creationTime || 0))
        .slice(0, 10) || []
    );
  }, [documents]);

  /* ------------------------------ Actions -------------------------------- */

  const onCreate = useCallback(() => {
    const promise = create({ title: "Untitled" });
    toast.promise(promise, {
      loading: "Creating note...",
      success: "Note created",
      error: "Failed to create note",
    });
  }, [create]);

  const onCreateFolder = useCallback(() => {
    const promise = create({ title: "Untitled Folder", isFolder: true });
    toast.promise(promise, {
      loading: "Creating folder...",
      success: "Folder created",
      error: "Failed to create folder",
    });
  }, [create]);

  const handleDelete = useCallback(
    async (id: string, title: string) => {
      if (!confirm(`Delete "${title || "Untitled"}"?`)) return;
      try {
        await remove({ id: id as Id<"documents"> });
        toast.success("Deleted");
      } catch {
        showErrorToast({ message: "Delete failed" });
      }
    },
    [remove]
  );

  const handleRenameSave = useCallback(
    async (id: string) => {
      if (!editValue.trim()) return;
      await update({
        id: id as Id<"documents">,
        title: editValue.trim(),
      });
      setEditingId(null);
    },
    [editValue, update]
  );

  /* ------------------------------ Drag end ------------------------------- */

  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      document.body.classList.remove("dragging");
      if (!over || active.id === over.id) return;

      const activeNode = treeData.map.get(active.id as string);
      const overNode = treeData.map.get(over.id as string);
      if (!activeNode || !overNode) return;

      let newParent = overNode.isFolder
        ? overNode._id
        : overNode.parentDocument;

      if (newParent === activeNode._id) return;

      const descendants = new Set<string>();
      collectDescendants(activeNode, descendants);
      if (newParent && descendants.has(newParent)) return;

      update({
        id: activeNode._id as Id<"documents">,
        parentDocument: newParent as Id<"documents">,
      });
    },
    [treeData, update]
  );

  /* ------------------------------ Render -------------------------------- */

  if (!documents) {
    return <div className="p-10 text-center">Loading…</div>;
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/70 dark:bg-slate-900/70 backdrop-blur border-b p-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <h2 className="text-2xl font-bold">Your Notes</h2>
          <div className="flex gap-2">
            <Button onClick={onCreate} className="rounded-full">
              <PlusCircle className="h-4 w-4 mr-2" /> New Note
            </Button>
            <Button onClick={onCreateFolder} variant="outline">
              <Folder className="h-4 w-4 mr-2" /> Folder
            </Button>
          </div>
        </div>

        <div className="mt-4 flex gap-2 flex-wrap">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search…"
            className="flex-1 px-4 py-2 rounded-lg border"
          />
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as any)}
            className="px-3 py-2 rounded-lg border"
          >
            <option value="all">All</option>
            <option value="starred">Starred</option>
            <option value="folders">Folders</option>
            <option value="notes">Notes</option>
          </select>
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={() => document.body.classList.add("dragging")}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredTree.map((n) => n._id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="space-y-1">
                {filteredTree.map((doc) => (
                  <SortableItem
                    key={doc._id}
                    doc={doc}
                    level={0}
                    tree={treeData.tree}
                    expanded={{}}
                    setExpanded={() => {}}
                    editingId={editingId}
                    editValue={editValue}
                    setEditValue={setEditValue}
                    setEditingId={setEditingId}
                    handleRename={(id: string, title: string) => {
                      setEditingId(id);
                      setEditValue(title);
                    }}
                    handleRenameSave={handleRenameSave}
                    setContextMenu={() => {}}
                    moveDropdown={null}
                    setMoveDropdown={() => {}}
                    handleMoveTo={() => {}}
                    allFolders={[]}
                    renderTree={() => null}
                    handleDelete={handleDelete}
                    toggleStarred={({ id }) =>
                      toggleStarred({ id: id as Id<"documents"> })
                    }
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        </main>

        <StarredSidebar starredDocs={starredDocs} />
      </div>
    </div>
  );
});

export default DocumentsPage;
