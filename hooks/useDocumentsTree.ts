import { useCallback, useMemo, useState } from "react";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

export interface TreeNode extends Doc<"documents"> {
  children: TreeNode[];
}

/* ---------------- Helpers ---------------- */

function buildTree(
  docs: Doc<"documents">[],
  parent?: string
): TreeNode[] {
  return docs
    .filter(d => d.parentDocument === parent)
    .map(d => ({
      ...d,
      children: buildTree(docs, d._id),
    }));
}

function collectDescendants(node: TreeNode, set: Set<string>) {
  for (const child of node.children) {
    set.add(child._id);
    collectDescendants(child, set);
  }
}

/* ---------------- Hook ---------------- */

export function useDocumentsTree(
  documents: Doc<"documents">[] | undefined,
  update: (args: {
    id: Id<"documents">;
    parentDocument?: Id<"documents">;
    title?: string;
    starred?: boolean;
  }) => Promise<void>,
  remove: (args: { id: Id<"documents"> }) => Promise<void>
) {
  const [optimisticDocs, setOptimisticDocs] =
    useState<Doc<"documents">[]>();

  const sourceDocs = optimisticDocs ?? documents ?? [];

  const tree = useMemo(
    () => buildTree(sourceDocs),
    [sourceDocs]
  );

  /* ---------------- Optimistic helpers ---------------- */

  const patchDoc = useCallback(
    (id: string, patch: Partial<Doc<"documents">>) => {
      setOptimisticDocs(prev =>
        (prev ?? documents ?? []).map(d =>
          d._id === id ? { ...d, ...patch } : d
        )
      );
    },
    [documents]
  );

  const moveDocument = useCallback(
    async (activeId: string, overId: string) => {
      const active = sourceDocs.find(d => d._id === activeId);
      const over = sourceDocs.find(d => d._id === overId);
      if (!active || !over) return;

      const newParent = over.isFolder
        ? over._id
        : over.parentDocument;

      if (newParent === active._id) return;

      const rootNode = tree.find(n => n._id === active._id);
      if (rootNode) {
        const descendants = new Set<string>();
        collectDescendants(rootNode, descendants);
        if (descendants.has(newParent!)) return;
      }

      patchDoc(active._id, { parentDocument: newParent });

      try {
        await update({
          id: active._id,
          parentDocument: newParent as Id<"documents">,
        });
      } catch {
        setOptimisticDocs(undefined);
        toast.error("Move failed");
      }
    },
    [sourceDocs, tree, patchDoc, update]
  );

  const renameDocument = useCallback(
    async (id: string, title: string) => {
      patchDoc(id, { title });
      try {
        await update({ id: id as Id<"documents">, title });
      } catch {
        setOptimisticDocs(undefined);
        toast.error("Rename failed");
      }
    },
    [patchDoc, update]
  );

  const toggleStar = useCallback(
    async (id: string, starred: boolean) => {
      patchDoc(id, { starred });
      try {
        await update({ id: id as Id<"documents">, starred });
      } catch {
        setOptimisticDocs(undefined);
        toast.error("Update failed");
      }
    },
    [patchDoc, update]
  );

  const deleteDocument = useCallback(
    async (id: string) => {
      setOptimisticDocs(prev =>
        (prev ?? documents ?? []).filter(d => d._id !== id)
      );
      try {
        await remove({ id: id as Id<"documents"> });
      } catch {
        setOptimisticDocs(undefined);
        toast.error("Delete failed");
      }
    },
    [documents, remove]
  );

  return {
    tree,
    moveDocument,
    renameDocument,
    toggleStar,
    deleteDocument,
  };
}
