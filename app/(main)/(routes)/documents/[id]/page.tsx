"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Spinner } from "@/components/spinner";
import { toast } from "sonner";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Suggestion from "@tiptap/suggestion";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Code,
  Quote,
  Undo,
  Redo,
  Minus,
  Type,
  Slash,
  PenLine,
} from "lucide-react";
import { Extension } from "@tiptap/core";
import { ReactRenderer } from "@tiptap/react";
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";
import Underline from "@tiptap/extension-underline";

const Toolbar = ({
  editor,
  disabled = false,
}: {
  editor: any;
  disabled?: boolean;
}) => {
  if (!editor) return null;
  const btn = (
    onClick: () => void,
    active: boolean,
    Icon: any,
    label: string,
    shortcut?: string,
    disabledBtn?: boolean
  ) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900 transition focus:outline-none focus:ring-2 focus:ring-indigo-400 ${active ? "bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200" : "text-gray-500"}`}
      title={shortcut ? `${label} (${shortcut})` : label}
      tabIndex={0}
      aria-label={label}
      disabled={disabled || disabledBtn}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
  return (
    <div className="flex gap-1 mb-4 border-b pb-2 bg-white/80 dark:bg-[#23233a]/80 rounded-t-lg sticky top-0 z-10">
      {btn(
        () => editor.chain().focus().toggleBold().run(),
        editor?.isActive("bold"),
        Bold,
        "Bold",
        "Ctrl+B"
      )}
      {btn(
        () => editor.chain().focus().toggleItalic().run(),
        editor?.isActive("italic"),
        Italic,
        "Italic",
        "Ctrl+I"
      )}
      {btn(
        () => editor.chain().focus().toggleMark("underline").run(),
        editor?.isActive("underline"),
        Type,
        "Underline",
        "Ctrl+U"
      )}
      {btn(
        () => editor.chain().focus().toggleStrike().run(),
        editor?.isActive("strike"),
        Slash,
        "Strikethrough",
        "Ctrl+Shift+S"
      )}
      {btn(
        () => editor.chain().focus().toggleCode().run(),
        editor?.isActive("code"),
        Code,
        "Inline Code",
        "Ctrl+E"
      )}
      {btn(
        () => editor.chain().focus().toggleHighlight().run(),
        editor?.isActive("highlight"),
        PenLine,
        "Highlight",
        "Ctrl+Shift+H"
      )}
      {btn(
        () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
        editor?.isActive("heading", { level: 1 }),
        Heading1,
        "Heading 1",
        "Ctrl+Alt+1"
      )}
      {btn(
        () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        editor?.isActive("heading", { level: 2 }),
        Heading2,
        "Heading 2",
        "Ctrl+Alt+2"
      )}
      {btn(
        () => editor.chain().focus().toggleBulletList().run(),
        editor?.isActive("bulletList"),
        List,
        "Bullet List",
        "Ctrl+Shift+8"
      )}
      {btn(
        () => editor.chain().focus().toggleOrderedList().run(),
        editor?.isActive("orderedList"),
        ListOrdered,
        "Ordered List",
        "Ctrl+Shift+7"
      )}
      {btn(
        () => editor.chain().focus().toggleCodeBlock().run(),
        editor?.isActive("codeBlock"),
        Code,
        "Code Block",
        "Ctrl+E"
      )}
      {btn(
        () => editor.chain().focus().toggleBlockquote().run(),
        editor?.isActive("blockquote"),
        Quote,
        "Blockquote"
      )}
      {btn(
        () => editor.chain().focus().setHorizontalRule().run(),
        false,
        Minus,
        "Horizontal Rule"
      )}
      <span className="mx-2 border-l border-gray-300 dark:border-gray-700" />
      {btn(
        () => editor.chain().focus().undo().run(),
        false,
        Undo,
        "Undo",
        "Ctrl+Z",
        !editor?.can().undo()
      )}
      {btn(
        () => editor.chain().focus().redo().run(),
        false,
        Redo,
        "Redo",
        "Ctrl+Y",
        !editor?.can().redo()
      )}
    </div>
  );
};

// Slash command menu React component
const SlashMenu = ({ items, command, selectedIndex }) => (
  <div
    className="slash-menu bg-white dark:bg-[#23233a] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 z-50"
    style={{
      minWidth: 180,
      fontSize: "0.95rem",
      maxHeight: 240,
      overflowY: "auto",
    }}
  >
    {items.map((item, idx) => (
      <div
        key={item.label}
        className={`px-3 py-2 cursor-pointer rounded ${idx === selectedIndex ? "bg-indigo-50 dark:bg-indigo-800" : "hover:bg-indigo-100 dark:hover:bg-indigo-900"}`}
        onClick={() => command(item)}
      >
        {item.label}
      </div>
    ))}
  </div>
);

// Official TipTap Slash Command Extension with ReactRenderer
const SlashCommand = Extension.create({
  name: "slash-command",
  addOptions() {
    return {
      suggestion: {
        char: "/",
        startOfLine: true,
        items: () => [
          {
            label: "Heading 1",
            command: ({ editor, range }) =>
              editor
                .chain()
                .focus()
                .deleteRange(range)
                .toggleHeading({ level: 1 })
                .run(),
          },
          {
            label: "Heading 2",
            command: ({ editor, range }) =>
              editor
                .chain()
                .focus()
                .deleteRange(range)
                .toggleHeading({ level: 2 })
                .run(),
          },
          {
            label: "Bullet List",
            command: ({ editor, range }) =>
              editor
                .chain()
                .focus()
                .deleteRange(range)
                .toggleBulletList()
                .run(),
          },
          {
            label: "Ordered List",
            command: ({ editor, range }) =>
              editor
                .chain()
                .focus()
                .deleteRange(range)
                .toggleOrderedList()
                .run(),
          },
          {
            label: "Code Block",
            command: ({ editor, range }) =>
              editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
          },
          {
            label: "Blockquote",
            command: ({ editor, range }) =>
              editor
                .chain()
                .focus()
                .deleteRange(range)
                .toggleBlockquote()
                .run(),
          },
          {
            label: "Horizontal Rule",
            command: ({ editor, range }) =>
              editor
                .chain()
                .focus()
                .deleteRange(range)
                .setHorizontalRule()
                .run(),
          },
        ],
        render: () => {
          let reactRenderer = null;
          let popup = null;
          return {
            onStart: (props) => {
              reactRenderer = new ReactRenderer(SlashMenu, {
                props: {
                  items: props.items,
                  command: props.command,
                  selectedIndex: props.selected,
                },
                editor: props.editor,
              });
              popup = tippy("body", {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: reactRenderer.element,
                showOnCreate: true,
                interactive: true,
                trigger: "manual",
                placement: "bottom-start",
              })[0];
            },
            onUpdate(props) {
              reactRenderer.updateProps({
                items: props.items,
                command: props.command,
                selectedIndex: props.selected,
              });
              popup.setProps({
                getReferenceClientRect: props.clientRect,
              });
            },
            onKeyDown(props) {
              if (props.event.key === "ArrowDown") {
                props.command("next");
                return true;
              }
              if (props.event.key === "ArrowUp") {
                props.command("previous");
                return true;
              }
              if (props.event.key === "Enter") {
                props.command("select");
                return true;
              }
              if (props.event.key === "Escape") {
                props.command("exit");
                return true;
              }
              return false;
            },
            onExit() {
              if (popup) popup.destroy();
              if (reactRenderer) reactRenderer.destroy();
            },
          };
        },
      },
    };
  },
  addProseMirrorPlugins() {
    return [
      Suggestion({
        ...this.options.suggestion,
        editor: this.editor,
      }),
    ];
  },
});

const DocumentPage = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const document = useQuery(api.documents.getById, { documentId: id });
  const update = useMutation(api.documents.update);

  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  // TipTap editor instance (hook must be at top level)
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        underline: true,
      }),
      Placeholder.configure({
        placeholder: "Start writing your document...",
      }),
      SlashCommand,
      Underline,
    ],
    content: document?.content ?? "",
    onCreate: ({ editor }) => {
      // Editor is ready. You can set a flag here if needed.
    },
    onUpdate: ({ editor }) => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
      setSaving(true);
      saveTimeout.current = setTimeout(() => {
        update({ id, content: editor.getHTML() })
          .catch(() => toast.error("Failed to save"))
          .finally(() => setSaving(false));
      }, 1000); // 1 second debounce
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[300px] w-full bg-white dark:bg-[#23233a] rounded-lg shadow p-4 text-lg focus:outline-none border border-gray-200 dark:border-gray-700",
        spellCheck: "true",
      },
    },
  });

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
      } catch (e) {
        // Optionally log or handle error
      }
    }
    if (document && typeof document.content === "string") {
      setTitle(document.title || "Untitled Document");
      setEditorContent(document.content);
    }
  }, [document, editor]);

  // Save title to backend
  const saveTitle = useCallback(
    async (value: string) => {
      setSaving(true);
      try {
        await update({ id, title: value });
        toast.success("Saved");
      } catch (e) {
        toast.error("Failed to save");
      } finally {
        setSaving(false);
      }
    },
    [id, update]
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
    <div className="max-w-3xl mx-auto p-8 relative">
      <input
        className="w-full text-3xl font-bold mb-6 bg-transparent border-b border-gray-200 dark:border-gray-700 focus:outline-none focus:border-indigo-500 px-2 py-1"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={(e) => saveTitle(e.target.value)}
        placeholder="Document Title"
        disabled={saving || document === undefined}
        aria-label="Document Title"
      />
      {editor ? (
        <>
          <Toolbar
            editor={editor}
            disabled={saving || document === undefined}
          />
          <EditorContent editor={editor} />
        </>
      ) : (
        <div className="h-40 flex items-center justify-center">
          <Spinner />
        </div>
      )}
      {/* Word and character count */}
      <div className="fixed bottom-6 right-8 bg-white/90 dark:bg-[#23233a]/90 rounded-lg shadow px-4 py-2 text-xs text-gray-600 dark:text-gray-300 z-40 border border-gray-200 dark:border-gray-700 select-none pointer-events-none">
        {counts.words} words • {counts.chars} letters
      </div>
      {saving && <div className="mt-2 text-sm text-gray-400">Saving...</div>}
    </div>
  );
};

export default DocumentPage;
