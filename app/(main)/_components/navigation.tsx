"use client";

import {
  ChevronsLeft,
  PlusCircle,
  Search as SearchIcon,
  Folder,
} from "lucide-react";
import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { cn } from "@/lib/utils";
import { api } from "@/convex/_generated/api";
import { usePathname } from "next/navigation";
import { UserItem } from "./user-item";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { TreeItem } from "./navigation/TreeItem";

export const Navigation = ({ className }: { className?: string }) => {
  const isResizingRef = useRef(false);
  const pathname = usePathname();
  const create = useMutation(api.documents.create);
  const documents = useQuery(api.documents.getSearch);
  const update = useMutation(api.documents.update);
  const remove = useMutation(api.documents.remove);
  const toggleStarred = useMutation(api.documents.toggleStarred);
  
  const { isCollapsed, isMobile, collapse, sidebarRef } = useSidebar();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isMobile) setIsMobileMenuOpen(false);
  }, [pathname, isMobile]);

  useEffect(() => {
    const handleOpen = () => setIsMobileMenuOpen(true);
    document.addEventListener("open-mobile-sidebar", handleOpen);
    return () => document.removeEventListener("open-mobile-sidebar", handleOpen);
  }, []);

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.preventDefault();
    event.stopPropagation();
    isResizingRef.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isResizingRef.current) return;
    requestAnimationFrame(() => {
        let newWidth = event.clientX;
        if (newWidth < 240) newWidth = 240;
        if (newWidth > 480) newWidth = 480;
        if (sidebarRef.current) sidebarRef.current.style.width = `${newWidth}px`;
    });
  }, [sidebarRef]);

  const handleMouseUp = () => {
    isResizingRef.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const handleCreate = async () => {
    const promise = create({ title: "Untitled" });
    toast.promise(promise, { loading: "Creating...", success: "New note created.", error: "Failed." });
  };

  const handleCreateFolder = async () => {
     const promise = create({ title: "Untitled Folder", isFolder: true });
     toast.promise(promise, { loading: "Creating folder...", success: "Folder created.", error: "Failed." });
  };

  // Tree Logic
  type TreeNode = {
    _id: string; title?: string; parentDocument?: string; isFolder?: boolean; starred?: boolean; children?: TreeNode[];
  };

  const buildTreeItems = useCallback((docs: TreeNode[], parent: string | undefined = undefined): TreeNode[] => {
    return docs
      .filter((doc) => doc.parentDocument === parent)
      .map((doc) => ({ ...doc, children: buildTreeItems(docs, doc._id) }));
  }, []);

  const treeData = useMemo(() => {
    const allDocs = (documents ?? []) as TreeNode[];
    const filtered = search 
        ? allDocs.filter(d => (d.title || "Untitled").toLowerCase().includes(search.toLowerCase()))
        : allDocs;
    return buildTreeItems(filtered);
  }, [documents, search, buildTreeItems]);

  const treeProps = {
    expanded,
    onToggleExpand: (id: string) => setExpanded(e => ({ ...e, [id]: !e[id] })),
    pathname,
    editingId,
    editValue,
    onRename: (id: string, value: string) => {
        update({ id: id as Id<"documents">, title: value });
        setEditingId(null);
    },
    onSetEditing: (id: string | null, val?: string) => {
        setEditingId(id);
        if (val !== undefined) setEditValue(val);
    },
    onSetEditValue: setEditValue,
    onToggleStarred: (id: string) => toggleStarred({ id: id as Id<"documents"> }),
    onDelete: (id: string) => {
        if (confirm("Delete this document?")) remove({ id: id as Id<"documents"> });
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full overflow-hidden">
        <div className="flex items-center justify-between p-3 pl-4">
            <UserItem />
            {!isMobile && (
                <div onClick={collapse} role="button" className="h-6 w-6 text-slate-400 rounded-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition opacity-0 group-hover/sidebar:opacity-100">
                    <ChevronsLeft className="h-6 w-6" />
                </div>
            )}
        </div>
        <div className="px-3 py-2 space-y-2">
            <div className="relative group/search">
                 <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within/search:text-indigo-500" />
                 <input 
                    value={search} onChange={(e) => setSearch(e.target.value)} 
                    placeholder="Search..."
                    className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-lg text-sm shadow-sm transition-all outline-none focus:ring-2 focus:ring-indigo-500/20"
                 />
            </div>
            <div className="flex gap-1">
                 <button onClick={handleCreate} className="flex-1 flex items-center justify-center gap-2 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-xs font-medium transition-colors shadow-sm">
                     <PlusCircle className="h-3.5 w-3.5" /> Note
                 </button>
                  <button onClick={handleCreateFolder} className="flex-1 flex items-center justify-center gap-2 py-1.5 bg-white hover:bg-slate-50 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-medium transition-colors shadow-sm">
                     <Folder className="h-3.5 w-3.5" /> Folder
                 </button>
            </div>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-4 mt-2">
            {treeData.map(doc => <TreeItem key={doc._id} doc={doc} {...treeProps} />)}
            {treeData.length === 0 && <div className="text-center py-8 text-xs text-slate-400">No results.</div>}
        </div>
        <div className="p-4 mt-auto border-t border-slate-200 dark:border-white/5">
            <div className="flex items-center justify-center gap-1.5 text-[9px] font-medium tracking-[0.2em] uppercase text-slate-400 dark:text-slate-500/50 select-none pointer-events-none">
                <div className="w-1 h-1 rounded-full bg-indigo-500" />
                Built by AG
            </div>
        </div>
    </div>
  );

  if (isMobile) {
      return (
          <>
            <div className={cn("fixed inset-0 z-[50] bg-black/50 backdrop-blur-sm transition-opacity duration-300", isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none")} onClick={() => setIsMobileMenuOpen(false)} />
            <aside className={cn("fixed top-0 left-0 h-full w-[80%] max-w-[300px] z-[51] bg-white dark:bg-[#1a1d29] border-r border-slate-200 dark:border-slate-700 transition-transform duration-300 ease-in-out shadow-2xl flex flex-col", isMobileMenuOpen ? "translate-x-0" : "-translate-x-full")}>
                 <SidebarContent />
            </aside>
          </>
      );
  }

  return (
    <aside ref={sidebarRef as React.RefObject<HTMLDivElement>} className={cn("group/sidebar h-full bg-slate-50 dark:bg-[#111] relative flex w-60 flex-col z-[40] border-r border-slate-200 dark:border-white/5", isCollapsed && "w-0 border-none", className)}>
        <div className={cn("h-full", isCollapsed && "hidden")}>
            <SidebarContent />
            <div onMouseDown={handleMouseDown} className="opacity-0 group-hover/sidebar:opacity-100 transition cursor-ew-resize absolute h-full w-1 bg-slate-300 dark:bg-slate-700 right-0 top-0" />
        </div>
    </aside>
  );
};


