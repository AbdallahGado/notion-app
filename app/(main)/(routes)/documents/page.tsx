"use client";
import Image from "next/image";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useQuery } from "convex/react";
import { Spinner } from "@/components/spinner";
import Link from "next/link";
import { FileText } from "lucide-react";
import { Trash2 } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import React from "react";
import { Pencil } from "lucide-react";
import { Star } from "lucide-react";
import { Folder, ChevronDown, ChevronRight } from "lucide-react";
import { Doc } from "@/convex/_generated/dataModel";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { X } from "lucide-react";

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
function DocumentsPage() {
  const { user } = useUser();
  const create = useMutation(api.documents.create);
  const remove = useMutation(api.documents.remove);
  const update = useMutation(api.documents.update);
  const documents = useQuery(api.documents.getSearch);
  const toggleStarred = useMutation(api.documents.toggleStarred);
  const [editingId, setEditingId] = React.useState<Id<"documents"> | null>(
    null
  );
  const [editValue, setEditValue] = React.useState("");
  const [search, setSearch] = React.useState("");

  const onCreate = () => {
    if (!create) {
      toast.error("Creation function is not available.");
      return;
    }
    try {
      const promise = create({
        title: "Untitled",
      });
      toast.promise(promise, {
        loading: "Creating a new note...",
        success: "New note created",
        error: "Failed to create a new note",
      });
    } catch (error) {
      toast.error("An unexpected error occurred.");
    }
  };

  const handleDelete = async (id: Id<"documents">, title: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${title || "Untitled"}"? This action cannot be undone.`
      )
    )
      return;
    try {
      const promise = remove({ id });
      toast.promise(promise, {
        loading: "Deleting note...",
        success: "Note deleted",
        error: "Failed to delete note",
      });
      await promise;
    } catch (error) {
      toast.error("An unexpected error occurred.");
    }
  };

  const handleRename = async (id: Id<"documents">, currentTitle: string) => {
    setEditingId(id);
    setEditValue(currentTitle);
  };

  const handleRenameSave = async (id: Id<"documents">) => {
    if (!editValue.trim()) return;
    try {
      const promise = update({ id, title: editValue.trim() });
      toast.promise(promise, {
        loading: "Renaming note...",
        success: "Note renamed",
        error: "Failed to rename note",
      });
      await promise;
      setEditingId(null);
    } catch (error) {
      toast.error("An unexpected error occurred.");
    }
  };

  const handleCreateFolder = () => {
    const promise = create({ title: "Untitled Folder", isFolder: true });
    toast.promise(promise, {
      loading: "Creating folder...",
      success: "New folder created",
      error: "Failed to create folder",
    });
  };

  // Move to logic
  const [moveDropdown, setMoveDropdown] = React.useState<string | null>(null);
  // Close moveDropdown on outside click
  React.useEffect(() => {
    if (!moveDropdown) return;
    function handleClick(e: MouseEvent) {
      const dropdowns = document.querySelectorAll(".move-to-dropdown");
      let inside = false;
      dropdowns.forEach((el) => {
        if (el.contains(e.target as Node)) inside = true;
      });
      if (!inside) setMoveDropdown(null);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [moveDropdown]);
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
          getAllFolders(node.children, excludeId, descendants)
        );
      }
    }
    return result;
  }
  function collectDescendants(node: TreeNode, set: Set<string>) {
    for (const child of node.children) {
      set.add(child._id);
      collectDescendants(child, set);
    }
  }
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
      toast.error("An unexpected error occurred.");
    }
  }

  // Helper: build a tree from flat docs
  type TreeNode = Doc<"documents"> & { children: TreeNode[] };
  function buildTree(
    docs: Doc<"documents">[],
    parent: string | undefined = undefined
  ): TreeNode[] {
    return docs
      .filter((doc) => doc.parentDocument === parent)
      .map((doc) => ({
        ...doc,
        children: buildTree(docs, doc._id),
      }));
  }

  // State for expanded folders
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});
  const toggleExpand = (id: string) =>
    setExpanded((e) => ({ ...e, [id]: !e[id] }));

  // Render tree recursively (vertical, indented)
  function renderTree(nodes: TreeNode[], level = 0) {
    return (
      <ul
        className={
          level === 0
            ? "pl-0"
            : "pl-6 border-l border-gray-200 dark:border-gray-700"
        }
      >
        {nodes.map((doc: TreeNode) => {
          const hasChildren = doc.children && doc.children.length > 0;
          const descendants = new Set<string>();
          collectDescendants(doc, descendants);
          const allFolders = getAllFolders(
            buildTree(filteredDocs),
            doc._id,
            descendants
          );
          return (
            <li key={doc._id} className="py-1">
              <div className="flex items-center gap-2">
                {hasChildren ? (
                  <button
                    onClick={() => toggleExpand(doc._id)}
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
                <div className="flex-1 min-w-0">
                  {editingId === doc._id ? (
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
                  )}
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
                {/* Actions dropdown */}
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
                      onClick={() => toggleStarred({ id: doc._id })}
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
              </div>
              {hasChildren && expanded[doc._id] && (
                <div>{renderTree(doc.children, level + 1)}</div>
              )}
            </li>
          );
        })}
      </ul>
    );
  }

  if (documents === undefined) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!documents.length) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#18181B] px-4">
        <div className="w-full max-w-md bg-white dark:bg-[#23233a] rounded-2xl shadow-2xl flex flex-col items-center p-8 space-y-6">
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
            Welcome to {user?.firstName}&apos;s Jotion
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-center text-base">
            Create your first note to get started! Jotion helps you organize
            your thoughts, tasks, and ideas all in one place.
          </p>
          <Button
            variant="outline"
            className="rounded-full hover:opacity-80 text-base px-6 py-3"
            onClick={onCreate}
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Create a note
          </Button>
        </div>
      </div>
    );
  }

  // Filter and sort documents by search and starred status
  const filteredDocs: Doc<"documents">[] = documents
    .filter((doc) =>
      (doc.title || "Untitled").toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => (b.starred === a.starred ? 0 : b.starred ? 1 : -1));

  return (
    <div className="h-screen flex flex-col items-center bg-gray-50 dark:bg-[#18181B] px-4 py-12">
      <div className="w-full max-w-2xl bg-white dark:bg-[#23233a] rounded-2xl shadow-2xl p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Your Notes
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="rounded-full hover:opacity-80 text-base px-6 py-3"
              onClick={onCreate}
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              New Note
            </Button>
            <Button
              variant="outline"
              className="rounded-full hover:opacity-80 text-base px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-white border-yellow-400"
              onClick={handleCreateFolder}
            >
              <Folder className="h-5 w-5 mr-2" />
              New Folder
            </Button>
          </div>
        </div>
        <input
          type="text"
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-6 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#23233a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        {/* Replace the old <ul> with the tree view */}
        {filteredDocs.length === 0 ? (
          <div className="py-8 text-center text-gray-400 dark:text-gray-500">
            No results found.
          </div>
        ) : (
          renderTree(buildTree(filteredDocs))
        )}
      </div>
    </div>
  );
}

export default DocumentsPage;
