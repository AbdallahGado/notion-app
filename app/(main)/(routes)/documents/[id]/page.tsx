/* eslint-disable @typescript-eslint/no-explicit-any */
// File scoped explicit-any directive temporarily allowed for TipTap integration; plan to replace with precise types.
"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Spinner } from "@/components/spinner";
import { toast } from "sonner";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
// removed unused icon import
import Underline from "@tiptap/extension-underline";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Highlight from "@tiptap/extension-highlight";
import Color from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import Toolbar from "../../../_components/Toolbar";
import { Decoration, DecorationSet } from "prosemirror-view";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { useUser } from "@clerk/clerk-react";
// Avatar used in CommentPopup; no direct import needed here
import CommentPopup from "../CommentPopup";
import type { CommentType, ReplyType } from "../comment-types";

// Slash command menu helpers removed (not used)

// Official TipTap Slash Command Extension with ReactRenderer
// Remove the entire block:
// const SlashCommand = Extension.create({ ... });

type DocumentPageProps = Readonly<{
  params?: { id?: string };
  isSidebarCollapsed?: boolean;
  sidebarWidth?: number;
}>;

// Comment and Reply types are imported from ../comment-types

export default function DocumentPage(props: any) {
  // Accept "any" from Next so the runtime props can include Next-specific fields.
  // Cast to our narrower DocumentPageProps for internal usage.
  const { params, isSidebarCollapsed, sidebarWidth } =
    props as DocumentPageProps;
  const { user } = useUser();
  // Update: comment type now supports replies and resolved state
  const [comments, setComments] = useState<CommentType[]>([]);
  // For comment popup
  const [selectedComment, setSelectedComment] = useState<CommentType | null>(
    null
  );
  const [popupPos, setPopupPos] = useState({ x: 0, y: 0 });

  // Move useEditor to the very top
  const editor = useEditor({
    extensions: [
      StarterKit,
      BulletList,
      OrderedList,
      Underline,
      Link,
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Subscript,
      Superscript,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder: "Start writing or type / for commands...",
      }),
      TaskList,
      TaskItem,
    ],
    content: "<p>Hello World</p>",
    editorProps: {
      decorations: (state) => {
        if (!comments || comments.length === 0) return null;
        const decos = comments.map(({ from, to, resolved }) =>
          Decoration.inline(from, to, {
            style: resolved
              ? "background: #e5e7eb; opacity: 0.5; border-radius: 2px;"
              : "background: #fef08a; border-radius: 2px;",
          })
        );
        return DecorationSet.create(state.doc, decos);
      },
    },
  });
  const { id } = params || {};
  // Coerce/validate the incoming id once and use that variable for Convex calls.
  // We still cast at the API boundary when necessary, but this centralizes the coercion
  // and ensures runtime safety (no accidental calls with undefined id).
  function coerceDocumentId(v: unknown): string | undefined {
    return typeof v === "string" && v.length > 0 ? v : undefined;
  }

  const documentId = coerceDocumentId(id);
  // useQuery must be called unconditionally (rules of hooks). We provide the coerced id
  // (or undefined) so the Convex client receives a predictable value. Keep a single cast
  // at the API boundary to satisfy the generated types.
  const document = useQuery(api.documents.getById, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    documentId: documentId as any,
  });
  const update = useMutation(api.documents.update);

  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function updateRect() {
      if (containerRef.current) {
        // no-op: layout listener retained for future toolbar calculations
      }
    }
    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [isSidebarCollapsed, sidebarWidth]);

  // Update title and editor content when document changes
  useEffect(() => {
    if (
      editor &&
      !editor.isDestroyed &&
      typeof editor.commands?.setContent === "function" &&
      document &&
      typeof document.content === "string" &&
      editor.getHTML() !== document.content
    ) {
      try {
        editor.commands.setContent(document.content);
        // Immediately update the word/letter count after setting content
        const text = editor.getText();
        const words =
          text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;
        const chars = text.replace(/\s/g, "").length;
        setCounts({ words, chars });
      } catch {
        // Optionally log or handle error
      }
    }
    if (document && typeof document.content === "string") {
      setTitle(document.title || "Untitled Document");
      // setEditorContent(document.content); // This line was removed
    }
  }, [document, editor]);

  // Save title to backend
  const saveTitle = useCallback(
    async (value: string) => {
      setSaving(true);
      try {
        if (!documentId) throw new Error("Missing document id");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await update({ id: documentId as any, title: value });
        toast.success("Saved");
      } catch {
        toast.error("Failed to save");
      } finally {
        setSaving(false);
      }
    },
    [documentId, update]
  );

  // Word and character count
  const [counts, setCounts] = useState({ words: 0, chars: 0 });
  useEffect(() => {
    if (!editor) return;
    const updateCounts = () => {
      const text = editor.getText();
      const words =
        text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;
      const chars = text.replace(/\s/g, "").length;
      setCounts({ words, chars });
    };
    updateCounts();
    editor.on("update", updateCounts);
    return () => {
      editor.off("update", updateCounts);
    };
  }, [editor]);

  // Reply handlers extracted to reduce nesting and cognitive complexity
  const handleAddReply = (replyText: string) => {
    if (!selectedComment) return;
    updateRepliesForSelected((prevReplies) => [
      ...(prevReplies || []),
      {
        text: replyText,
        id: Date.now().toString(),
        resolved: false,
        replies: [],
        userId: user?.id,
        userName: user?.fullName ?? null,
        userAvatar: user?.imageUrl ?? null,
      },
    ]);
  };

  const handleEditReply = (replyIndex: number, newText: string) => {
    if (!selectedComment) return;
    updateRepliesForSelected((prevReplies) =>
      (prevReplies || []).map((r, i) =>
        i === replyIndex ? { ...r, text: newText } : r
      )
    );
  };

  const handleDeleteReply = (replyIndex: number) => {
    if (!selectedComment) return;
    updateRepliesForSelected((prevReplies) =>
      (prevReplies || []).filter((_, i) => i !== replyIndex)
    );
  };

  function updateRepliesForSelected(
    transform: (r: ReplyType[] | undefined) => ReplyType[]
  ) {
    setComments((prev) =>
      prev.map((c) =>
        c === selectedComment ? { ...c, replies: transform(c.replies) } : c
      )
    );
  }

  // Editor click handler moved out of JSX to reduce nesting depth
  const handleEditorClick = useCallback(
    (evt: React.MouseEvent) => {
      if (!editor?.view) {
        return;
      }
      const clientX = evt.clientX;
      const clientY = evt.clientY;
      const pos = editor.view.posAtCoords({ left: clientX, top: clientY });
      if (!pos) return;
      const found = comments.find(
        (c) => !c.resolved && pos.pos >= c.from && pos.pos <= c.to
      );
      if (found) {
        setSelectedComment(found);
        setPopupPos({ x: clientX, y: clientY });
      } else {
        setSelectedComment(null);
      }
    },
    [editor, comments]
  );

  if (document === undefined) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }
  if (!document) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-400">
        Document not found.
      </div>
    );
  }

  return (
    <div ref={containerRef} className="max-w-3xl mx-auto p-8 relative">
      <Toolbar
        editor={editor}
        disabled={saving}
        isSidebarCollapsed={isSidebarCollapsed}
        sidebarWidth={sidebarWidth}
      />
      <input
        className="w-full text-3xl font-bold mb-6 bg-transparent border-b border-gray-200 dark:border-gray-700 focus:outline-none focus:border-indigo-500 px-2 py-1 text-center"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={(e) => saveTitle(e.target.value)}
        placeholder="Document Title"
        disabled={saving || document === undefined}
        aria-label="Document Title"
      />
      {editor ? (
        <div className="w-full min-w-0 relative">
          {/* <FloatingToolbar
            editor={editor}
            comments={comments}
            setComments={setComments}
          /> */}
          <EditorContent editor={editor} onClick={handleEditorClick} />
        </div>
      ) : (
        <div className="h-40 flex items-center justify-center">
          <Spinner />
        </div>
      )}
      {/* Comment popup */}
      {selectedComment && (
        <CommentPopup
          comment={selectedComment}
          style={{
            position: "fixed",
            left: popupPos.x + 10,
            top: popupPos.y + 10,
            zIndex: 1000,
          }}
          onClose={() => setSelectedComment(null)}
          onToggleResolve={(id: string) => {
            setComments((prev) =>
              prev.map((c) =>
                c.id === id ? { ...c, resolved: !c.resolved } : c
              )
            );
            setSelectedComment(null);
          }}
          onDeleteComment={(id: string) => {
            setComments((prev) => prev.filter((c) => c.id !== id));
            setSelectedComment(null);
          }}
          onAddReply={(text: string) => handleAddReply(text)}
          onEditReply={(index: number, text: string) =>
            handleEditReply(index, text)
          }
          onDeleteReply={(index: number) => handleDeleteReply(index)}
        />
      )}
      {/* Word and character count */}
      <div className="fixed bottom-6 right-8 bg-white/90 dark:bg-[#23233a]/90 rounded-lg shadow px-4 py-2 text-xs text-gray-600 dark:text-gray-300 z-40 border border-gray-200 dark:border-gray-700 select-none pointer-events-none">
        {counts.words} words • {counts.chars} letters
      </div>
      {saving && <div className="mt-2 text-sm text-gray-400">Saving...</div>}
      {/* Remove Toolbar from the bottom */}
    </div>
  );
}

// Reply UI is now handled by CommentPopup.tsx
