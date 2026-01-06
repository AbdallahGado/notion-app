"use client";

export const dynamic = 'force-dynamic';

import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
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
import { PlusCircle, Folder, Star, Search as SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { showErrorToast } from "@/components/ui/ErrorToast";
import SortableItem from "../../_components/SortableItem";

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
    <aside className="w-64 shrink-0 bg-gray-50/50 dark:bg-[#1F1F1F] backdrop-blur-2xl border-l border-white/30 dark:border-white/5 overflow-y-auto">
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

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [moveDropdown, setMoveDropdown] = useState<string | null>(null);
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

  const handleMoveTo = useCallback(
    async (docId: string, parentId: string | undefined) => {
       try {
         await update({
           id: docId as Id<"documents">,
           parentDocument: parentId as Id<"documents"> | undefined,
         });
         toast.success("Moved");
         setMoveDropdown(null);
       } catch {
         showErrorToast({ message: "Move failed" });
       }
    },
    [update]
  );

  /* ------------------------------ Tree Renderer -------------------------- */

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Memoize all folders for the dropdown
  const allFolders = useMemo(() => {
     return Array.from(treeData.map.values()).filter(doc => doc.isFolder);
  }, [treeData.map]);

  const renderTree = useCallback((nodes: TreeNode[], level: number, tree: TreeNode[]) => {
      const nodeIds = nodes.map(n => n._id);
      return (
          <SortableContext items={nodeIds} strategy={verticalListSortingStrategy}>
              <ul className="space-y-1">
                  {nodes.map(node => (
                      <SortableItem
                          key={node._id}
                          doc={node}
                          level={level}
                          tree={tree}
                          expanded={expanded}
                          setExpanded={setExpanded}
                          editingId={editingId}
                          editValue={editValue}
                          setEditValue={setEditValue}
                          setEditingId={setEditingId}
                          handleRename={(id: string, title: string) => {
                              setEditingId(id);
                              setEditValue(title);
                          }}
                          handleRenameSave={handleRenameSave}
                          toggleStarred={({ id }: { id: string }) =>
                              toggleStarred({ id: id as Id<"documents"> })
                          }
                          setContextMenu={() => {}}
                          moveDropdown={moveDropdown}
                          setMoveDropdown={setMoveDropdown}
                          handleMoveTo={handleMoveTo}
                          allFolders={allFolders}
                          renderTree={renderTree}
                          handleDelete={handleDelete}
                      />
                  ))}
              </ul>
          </SortableContext>
      );
  }, [expanded, editingId, editValue, moveDropdown, handleRenameSave, toggleStarred, handleMoveTo, handleDelete, treeData.tree, allFolders]);


  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      document.body.classList.remove("dragging");
      if (!over || active.id === over.id) return;

      const activeNode = treeData.map.get(active.id as string);
      const overNode = treeData.map.get(over.id as string);
      if (!activeNode || !overNode) return;

      const newParent = overNode.isFolder
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
    <div className="h-full flex flex-col bg-slate-50 dark:bg-[#111] transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5 p-6">
        <div className="max-w-4xl mx-auto w-full">
            <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
            <div>
                <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Documents</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Manage and organize your knowledge.</p>
            </div>
            <div className="flex gap-2">
                <Button onClick={onCreate} className="rounded-xl shadow-lg shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700 text-white border-0">
                <PlusCircle className="h-4 w-4 mr-2" /> New Note
                </Button>
                <Button onClick={onCreateFolder} variant="outline" className="rounded-xl border-slate-200 dark:border-slate-800">
                <Folder className="h-4 w-4 mr-2" /> Folder
                </Button>
            </div>
            </div>

            <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 group/search">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within/search:text-indigo-500 transition-colors" />
                <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search documents..."
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all shadow-sm"
                />
            </div>
            <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as "all" | "starred" | "folders" | "notes")}
                className="px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
            >
                <option value="all">All Items</option>
                <option value="starred">Starred</option>
                <option value="folders">Folders</option>
                <option value="notes">Notes</option>
            </select>
            </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto w-full p-8 pb-32">
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
                    {filteredTree.length === 0 ? (
                        <div className="py-20 text-center">
                             <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mx-auto flex items-center justify-center mb-4">
                                <SearchIcon className="w-8 h-8 text-slate-400" />
                             </div>
                             <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No documents found</h3>
                             <p className="text-slate-500 dark:text-slate-400">Try creating a new note or adjusting your filters.</p>
                        </div>
                    ) : (
                        filteredTree.map((doc) => (
                        <SortableItem
                            key={doc._id}
                            doc={doc}
                            level={0}
                            tree={treeData.tree}
                            expanded={expanded}
                            setExpanded={setExpanded}
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
                            moveDropdown={moveDropdown}
                            setMoveDropdown={setMoveDropdown}
                            handleMoveTo={handleMoveTo}
                            allFolders={allFolders}
                            renderTree={renderTree}
                            handleDelete={handleDelete}
                            toggleStarred={({ id }: { id: string }) =>
                            toggleStarred({ id: id as Id<"documents"> })
                            }
                        />
                        ))
                    )}
                </ul>
                </SortableContext>
            </DndContext>
            </div>
        </main>

        <StarredSidebar starredDocs={starredDocs} />
      </div>
    </div>
  );
});

export default DocumentsPage;
