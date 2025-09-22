/* eslint-disable @typescript-eslint/no-explicit-any */
// Local minimal editor-like type to avoid widespread `any` usage. Use `unknown` for loose shapes.
import type { EditorLike } from "@/types/editor";
import React, { useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Link as LinkIcon,
  PenLine,
  Palette as PaletteIcon,
  Strikethrough,
  Code,
  MessageCircle,
} from "lucide-react";
import { HexColorPicker } from "react-colorful";

const HIGHLIGHT_COLORS = [
  "#fef08a", // yellow
  "#fca5a5", // red
  "#6ee7b7", // green
  "#93c5fd", // blue
  "#f9a8d4", // pink
  "#fcd34d", // gold
  "#a5b4fc", // indigo
];

type Comment = {
  from: number;
  to: number;
  text: string;
  id: number | string;
  resolved?: boolean;
  replies?: unknown[];
};

type SelectionRange = { from: number; to: number } | null;

// using EditorLike from types/editor

// Small helper to centralize the single `any` boundary for TipTap's chain API.
// Use withChain(editor, chain => chain.focus().toggleBold().run())
function withChain(
  editor: EditorLike | null | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: (chain: any) => void
) {
  if (!editor || typeof editor.chain !== "function") return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chain = editor.chain() as any;
  if (!chain) return;
  try {
    fn(chain);
  } catch {
    // swallow UI action errors
  }
}

// Small presentational button to reduce repeated JSX and inline handlers
function FormatButton({
  onMouseDown,
  pressed,
  label,
  children,
  disabled,
}: Readonly<{
  onMouseDown: (e: React.MouseEvent) => void;
  pressed?: boolean;
  label: string;
  children: React.ReactNode;
  disabled?: boolean;
}>) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={pressed}
      className={`p-2 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900 ${pressed ? "bg-indigo-200 dark:bg-indigo-800" : ""}`}
      onMouseDown={onMouseDown}
      aria-label={label}
    >
      {children}
    </button>
  );
}

// Small helper: Link editor popup
function LinkEditor({
  editor,
  show,
  linkInput,
  setLinkInput,
  setShow,
}: Readonly<{
  editor: EditorLike;
  show: boolean;
  linkInput: string;
  setLinkInput: (s: string) => void;
  setShow: (v: boolean) => void;
}>) {
  if (!show) return null;
  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-10 z-50 bg-white dark:bg-[#23233a] border border-gray-200 dark:border-gray-700 rounded shadow-lg p-2 flex flex-col gap-2 min-w-[180px]">
      <input
        className="border rounded px-2 py-1 w-full text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        type="url"
        placeholder="https://example.com"
        value={linkInput}
        onChange={(e) => setLinkInput(e.target.value)}
        autoFocus
      />
      <div className="flex gap-2 justify-end">
        <button
          className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 text-xs"
          onMouseDown={(e) => {
            e.preventDefault();
            setShow(false);
          }}
          type="button"
        >
          Cancel
        </button>
        <button
          className="px-2 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 text-xs"
          onMouseDown={(e) => {
            e.preventDefault();
            if (!linkInput) {
              withChain(editor, (c) => c.focus().unsetLink().run());
            } else {
              withChain(editor, (c) =>
                c.focus().setLink({ href: linkInput }).run()
              );
            }
            setShow(false);
          }}
          type="button"
        >
          Save
        </button>
        <button
          className="px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600 text-xs"
          onMouseDown={(e) => {
            e.preventDefault();
            withChain(editor, (c) => c.focus().unsetLink().run());
            setShow(false);
          }}
          type="button"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

// Highlight picker
function HighlightPicker({
  editor,
  show,
  customColor,
  setCustomColor,
  setShow,
}: Readonly<{
  editor: EditorLike;
  show: boolean;
  customColor: string;
  setCustomColor: (s: string) => void;
  setShow: (v: boolean) => void;
}>) {
  if (!show) return null;
  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-10 z-50 bg-white dark:bg-[#23233a] border border-gray-200 dark:border-gray-700 rounded shadow-lg p-2 flex flex-col gap-2 min-w-[120px]">
      <div className="flex gap-1 flex-wrap mb-1">
        {HIGHLIGHT_COLORS.map((color) => (
          <button
            key={color}
            className="w-6 h-6 rounded-full border-2 border-white shadow"
            style={{ backgroundColor: color }}
            onMouseDown={(e) => {
              e.preventDefault();
              withChain(editor, (c) => c.focus().setHighlight({ color }).run());
              setShow(false);
            }}
            aria-label={`Highlight ${color}`}
          />
        ))}
        <button
          className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center text-xs text-gray-500 bg-gray-50 dark:bg-gray-800"
          onMouseDown={(e) => {
            e.preventDefault();
            withChain(editor, (c) => c.focus().unsetHighlight().run());
            setShow(false);
          }}
          aria-label="Remove highlight"
        >
          ×
        </button>
      </div>
      <HexColorPicker
        color={customColor}
        onChange={setCustomColor}
        style={{ width: 100, height: 60 }}
      />
      <button
        className="mt-1 px-2 py-1 rounded bg-yellow-400 text-white hover:bg-yellow-500 text-xs"
        onMouseDown={(e) => {
          e.preventDefault();
          withChain(editor, (c) =>
            c.focus().setHighlight({ color: customColor }).run()
          );
          setShow(false);
        }}
        aria-label="Apply custom highlight"
      >
        Apply
      </button>
    </div>
  );
}

// Text color picker
function TextColorPicker({
  editor,
  show,
  customColor,
  setCustomColor,
  setShow,
}: Readonly<{
  editor: EditorLike;
  show: boolean;
  customColor: string;
  setCustomColor: (s: string) => void;
  setShow: (v: boolean) => void;
}>) {
  if (!show) return null;
  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-10 z-50 bg-white dark:bg-[#23233a] border border-gray-200 dark:border-gray-700 rounded shadow-lg p-2 flex flex-col gap-2 min-w-[120px]">
      <HexColorPicker
        color={customColor}
        onChange={setCustomColor}
        style={{ width: 100, height: 60 }}
      />
      <button
        className="mt-1 px-2 py-1 rounded bg-pink-500 text-white hover:bg-pink-600 text-xs"
        onMouseDown={(e) => {
          e.preventDefault();
          withChain(editor, (c) => c.focus().setColor(customColor).run());
          setShow(false);
        }}
        aria-label="Apply text color"
      >
        Apply
      </button>
      <button
        className="mt-1 px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 text-xs"
        onMouseDown={(e) => {
          e.preventDefault();
          withChain(editor, (c) => c.focus().unsetColor().run());
          setShow(false);
        }}
        aria-label="Remove text color"
      >
        Remove Color
      </button>
    </div>
  );
}

// Comment input popup
function CommentInput({
  selectionRange,
  comments,
  setComments,
  show,
  commentText,
  setCommentText,
  setShow,
}: Readonly<{
  selectionRange: SelectionRange;
  comments: Comment[];
  setComments: (c: Comment[]) => void;
  show: boolean;
  commentText: string;
  setCommentText: (s: string) => void;
  setShow: (v: boolean) => void;
}>) {
  if (!show || !selectionRange) return null;
  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-10 z-50 bg-white dark:bg-[#23233a] border border-gray-200 dark:border-gray-700 rounded shadow-lg p-2 flex flex-col gap-2 min-w-[180px]">
      <textarea
        className="border rounded px-2 py-1 w-full text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        placeholder="Add a comment..."
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        rows={2}
        autoFocus
      />
      <div className="flex gap-2 justify-end">
        <button
          className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 text-xs"
          onMouseDown={(e) => {
            e.preventDefault();
            setShow(false);
            setCommentText("");
          }}
          type="button"
        >
          Cancel
        </button>
        <button
          className="px-2 py-1 rounded bg-green-600 text-white hover:bg-green-700 text-xs"
          onMouseDown={(e) => {
            e.preventDefault();
            if (commentText.trim() && selectionRange) {
              setComments([
                ...(comments || []),
                {
                  from: selectionRange.from,
                  to: selectionRange.to,
                  text: commentText.trim(),
                  id: Date.now(),
                  resolved: false,
                  replies: [],
                },
              ]);
            }
            setShow(false);
            setCommentText("");
          }}
          type="button"
        >
          Add
        </button>
      </div>
    </div>
  );
}

// FormatButton is defined inside the component to keep hooks and scope stable

export default function FloatingToolbar({
  editor,
  comments,
  setComments,
}: Readonly<{
  editor: EditorLike | null;
  comments: Comment[];
  setComments: (c: Comment[]) => void;
}>) {
  const [show, setShow] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, placement: "top" });
  const [showHighlight, setShowHighlight] = useState(false);
  const [showTextColor, setShowTextColor] = useState(false);
  const [customHighlightColor, setCustomHighlightColor] = useState("#fef08a");
  const [customTextColor, setCustomTextColor] = useState("#ef4444");
  const [showLinkEdit, setShowLinkEdit] = useState(false);
  const [linkInput, setLinkInput] = useState("");
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState("");
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const [selectionRange, setSelectionRange] = useState<SelectionRange>(null);

  // Formatting buttons are rendered in place to keep complexity manageable

  // Narrow editor locally where we use TipTap APIs
  const ed = editor as EditorLike;
  const isDisabled = !editor;

  // Run effect when editor instance or its focus/selection state changes.
  // We include specific selection fields to avoid re-running on unrelated state.
  useEffect(() => {
    if (!editor) return;
    const update = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !ed.isFocused) {
        setShow(false);
        setShowLinkEdit(false);
        setShowCommentInput(false);
        return;
      }
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      if (!rect || (rect.top === 0 && rect.left === 0)) {
        setShow(false);
        setShowLinkEdit(false);
        setShowCommentInput(false);
        return;
      }
      // Smart positioning: above if enough space, else below
      const toolbarHeight = 48;
      const margin = 8;
      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;
      let placement = "top";
      let top = rect.top + window.scrollY - toolbarHeight - margin;
      if (
        spaceAbove < toolbarHeight + margin &&
        spaceBelow > toolbarHeight + margin
      ) {
        placement = "bottom";
        top = rect.bottom + window.scrollY + margin;
      }
      setCoords({
        top,
        left: rect.left + window.scrollX + rect.width / 2,
        placement,
      });
      setShow(true);
      // Save selection range for comment
      const sel = ed.state?.selection;
      if (sel && typeof sel.from === "number" && typeof sel.to === "number") {
        setSelectionRange({ from: sel.from, to: sel.to });
      } else {
        setSelectionRange(null);
      }
    };
    const onBlur = () => {
      setShow(false);
      setShowLinkEdit(false);
      setShowCommentInput(false);
    };

    editor.on?.("selectionUpdate", update);
    editor.on?.("blur", onBlur);
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      editor.off?.("selectionUpdate", update);
      editor.off?.("blur", onBlur);
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [
    editor,
    // include focus and selection coordinates to respond to selection changes
    ed?.isFocused,
    ed?.state?.selection?.from,
    ed?.state?.selection?.to,
    ed?.state?.selection,
  ]);

  // Link editing logic (local narrow casts only inside component)
  const isLinkActive = !!editor && ed.isActive("link");
  function getAttr(name: string) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return ed.getAttributes(name) as any;
    } catch {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return {} as any;
    }
  }

  const currentLink = editor ? (getAttr("link").href ?? "") : "";

  // FormatButton moved to top-level to avoid nested component definition (lint rule)

  if (!show || !editor) return null;

  return (
    <div
      ref={toolbarRef}
      style={{
        position: "absolute",
        top: coords.top,
        left: coords.left,
        transform: "translate(-50%, 0)",
        zIndex: 1000,
      }}
      className="bg-white dark:bg-[#23233a] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg flex gap-1 px-2 py-1 animate-fade-in"
    >
      {/* Arrow indicator */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 ${coords.placement === "top" ? "bottom-0" : "top-0"} z-10 pointer-events-none`}
        style={{
          marginBottom: coords.placement === "top" ? -8 : undefined,
          marginTop: coords.placement === "bottom" ? -8 : undefined,
        }}
      >
        <svg
          width="18"
          height="8"
          viewBox="0 0 18 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d={
              coords.placement === "top"
                ? "M1 8L9 0L17 8H1Z"
                : "M1 0L9 8L17 0H1Z"
            }
            fill="currentColor"
            className="text-white dark:text-[#23233a]"
          />
          <path
            d={coords.placement === "top" ? "M1 8L9 1L17 8" : "M1 0L9 7L17 0"}
            stroke="#e5e7eb"
            strokeWidth="1"
            className="dark:stroke-gray-700"
          />
        </svg>
      </div>
      {/* Formatting actions */}
      <FormatButton
        onMouseDown={(e) => {
          e.preventDefault();
          withChain(ed, (c) => c.focus().toggleBold().run());
        }}
        pressed={ed.isActive("bold")}
        label="Bold"
      >
        <Bold className="w-4 h-4" />
      </FormatButton>
      <FormatButton
        onMouseDown={(e) => {
          e.preventDefault();
          withChain(ed, (c) => c.focus().toggleItalic().run());
        }}
        pressed={ed.isActive("italic")}
        label="Italic"
      >
        <Italic className="w-4 h-4" />
      </FormatButton>
      <button
        type="button"
        disabled={isDisabled}
        aria-pressed={ed?.isActive?.("underline")}
        className={`p-2 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900 ${ed.isActive("underline") ? "bg-indigo-200 dark:bg-indigo-800" : ""}`}
        onMouseDown={(e) => {
          e.preventDefault();
          withChain(ed, (c) => c.focus().toggleUnderline().run());
        }}
        aria-label="Underline"
      >
        <UnderlineIcon className="w-4 h-4" />
      </button>
      <button
        type="button"
        disabled={isDisabled}
        aria-pressed={ed?.isActive?.("strike")}
        className={`p-2 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900 ${ed.isActive("strike") ? "bg-indigo-200 dark:bg-indigo-800" : ""}`}
        onMouseDown={(e) => {
          e.preventDefault();
          withChain(ed, (c) => c.focus().toggleStrike().run());
        }}
        aria-label="Strikethrough"
      >
        <Strikethrough className="w-4 h-4" />
      </button>
      <button
        type="button"
        disabled={isDisabled}
        aria-pressed={ed?.isActive?.("code")}
        className={`p-2 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900 ${ed.isActive("code") ? "bg-indigo-200 dark:bg-indigo-800" : ""}`}
        onMouseDown={(e) => {
          e.preventDefault();
          withChain(ed, (c) => c.focus().toggleCode().run());
        }}
        aria-label="Inline Code"
      >
        <Code className="w-4 h-4" />
      </button>
      {/* Link editing */}
      <div className="relative">
        <button
          type="button"
          disabled={isDisabled}
          aria-pressed={isLinkActive}
          className={`p-2 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900 ${isLinkActive ? "bg-indigo-200 dark:bg-indigo-800" : ""}`}
          onMouseDown={(e) => {
            e.preventDefault();
            if (isLinkActive) {
              setLinkInput(currentLink);
              setShowLinkEdit((v) => !v);
            } else {
              const url = window.prompt("Enter URL", "");
              if (url === null) return;
              if (url === "") {
                withChain(ed, (c) => c.focus().unsetLink().run());
              } else {
                withChain(ed, (c) => c.focus().setLink({ href: url }).run());
              }
            }
          }}
          aria-label="Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        <LinkEditor
          editor={ed}
          show={showLinkEdit}
          linkInput={linkInput}
          setLinkInput={setLinkInput}
          setShow={setShowLinkEdit}
        />
      </div>
      {/* Highlight color picker */}
      <div className="relative">
        <button
          type="button"
          disabled={isDisabled}
          aria-pressed={ed?.isActive?.("highlight")}
          className={`p-2 rounded hover:bg-yellow-100 dark:hover:bg-yellow-900 ${ed.isActive("highlight") ? "bg-yellow-200 dark:bg-yellow-800" : ""}`}
          onMouseDown={(e) => {
            e.preventDefault();
            setShowHighlight((v) => !v);
            setShowTextColor(false);
            setShowLinkEdit(false);
          }}
          aria-label="Highlight"
        >
          <PenLine className="w-4 h-4" />
        </button>
        <HighlightPicker
          editor={ed}
          show={showHighlight}
          customColor={customHighlightColor}
          setCustomColor={setCustomHighlightColor}
          setShow={setShowHighlight}
        />
      </div>
      {/* Text color picker */}
      <div className="relative">
        <button
          type="button"
          disabled={isDisabled}
          aria-pressed={
            ed?.isActive?.("textStyle") && !!getAttr("textStyle")?.color
          }
          className={`p-2 rounded hover:bg-pink-100 dark:hover:bg-pink-900 ${ed.isActive("textStyle") && getAttr("textStyle")?.color ? "bg-pink-200 dark:bg-pink-800" : ""}`}
          onMouseDown={(e) => {
            e.preventDefault();
            setShowTextColor((v) => !v);
            setShowHighlight(false);
            setShowLinkEdit(false);
          }}
          aria-label="Text Color"
        >
          <PaletteIcon className="w-4 h-4" />
        </button>
        <TextColorPicker
          editor={ed}
          show={showTextColor}
          customColor={customTextColor}
          setCustomColor={setCustomTextColor}
          setShow={setShowTextColor}
        />
      </div>
      {/* Comment action */}
      {selectionRange && selectionRange.from !== selectionRange.to && (
        <div className="relative">
          <button
            type="button"
            disabled={isDisabled}
            className={`p-2 rounded hover:bg-green-100 dark:hover:bg-green-900`}
            onMouseDown={(e) => {
              e.preventDefault();
              // Check if a comment already exists for this range
              const existing = (comments || []).find(
                (c) =>
                  !c.resolved &&
                  c.from === selectionRange.from &&
                  c.to === selectionRange.to
              );
              if (existing) {
                // Show reply/resolve UI (handled in main page popup)
                // Optionally, could show a mini-popup here
                return;
              }
              setShowCommentInput((v) => !v);
              setShowHighlight(false);
              setShowTextColor(false);
              setShowLinkEdit(false);
            }}
            aria-label="Add Comment"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
          <CommentInput
            selectionRange={selectionRange}
            comments={comments}
            setComments={setComments}
            show={showCommentInput}
            commentText={commentText}
            setCommentText={setCommentText}
            setShow={setShowCommentInput}
          />
        </div>
      )}
    </div>
  );
}
