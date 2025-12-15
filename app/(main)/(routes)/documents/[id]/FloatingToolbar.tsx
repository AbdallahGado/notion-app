/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// Local minimal editor-like type to avoid widespread `any` usage. Use `unknown` for loose shapes.
import type { EditorLike } from "@/types/editor";
import React, { useCallback, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Smile,
  Printer,
} from "lucide-react";
import { HexColorPicker } from "react-colorful";
import EmojiPicker from "emoji-picker-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

const HIGHLIGHT_COLORS = [
  "#fef08a", // yellow
  "#fca5a5", // red
  "#6ee7b7", // green
  "#93c5fd", // blue
  "#f9a8d4", // pink
  "#fcd34d", // gold
  "#a5b4fc", // indigo
  "#e879f9", // magenta
  "#ffffff", // white
  "#000000", // black
  "#fb923c", // orange
  "#a855f7", // purple
  "#6b7280", // gray
  "#10b981", // emerald
  "#f59e0b", // amber
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
  if (editor && typeof editor.chain === "function") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chain = editor.chain() as any;
    if (chain) {
      try {
        fn(chain);
      } catch {
        // swallow UI action errors
      }
    }
  }
}

// Small presentational button to reduce repeated JSX and inline handlers
function FormatButton({
  onMouseDown,
  pressed,
  label,
  children,
  disabled,
  hoverClass = "hover:bg-indigo-100 dark:hover:bg-indigo-900",
  pressedClass = "bg-indigo-200 dark:bg-indigo-800",
}: Readonly<{
  onMouseDown: (e: React.MouseEvent) => void;
  pressed?: boolean;
  label: string;
  children: React.ReactNode;
  disabled?: boolean;
  hoverClass?: string;
  pressedClass?: string;
}>) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={pressed}
      className={`p-2 rounded ${hoverClass} ${pressed ? pressedClass : ""}`}
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
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  React.useEffect(() => {
    if (show) {
      // focus the input when the editor link UI is shown
      inputRef.current?.focus();
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-10 z-50 bg-white dark:bg-[#23233a] border border-gray-200 dark:border-gray-700 rounded shadow-lg p-2 flex flex-col gap-2 min-w-[180px]">
      <input
        ref={inputRef}
        className="border rounded px-2 py-1 w-full text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        type="url"
        placeholder="https://example.com"
        value={linkInput}
        onChange={(e) => setLinkInput(e.target.value)}
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
            if (linkInput.trim().length === 0) {
              withChain(editor, (c) => c.focus().unsetLink().run());
            } else {
              withChain(editor, (c) =>
                c.focus().setLink({ href: linkInput.trim() }).run()
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
  show,
  commentText,
  setCommentText,
  setShow,
  onCreateComment,
}: Readonly<{
  selectionRange: SelectionRange;
  show: boolean;
  commentText: string;
  setCommentText: (s: string) => void;
  setShow: (v: boolean) => void;
  onCreateComment: (from: number, to: number, text: string) => void;
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
              onCreateComment(
                selectionRange.from,
                selectionRange.to,
                commentText.trim()
              );
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

// Emoji picker component
function EmojiPickerComponent({
  show,
  setShow,
  editor,
}: Readonly<{
  show: boolean;
  setShow: (v: boolean) => void;
  editor: EditorLike;
}>) {
  if (!show) return null;
  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-10 z-50">
      <EmojiPicker
        onEmojiClick={(emojiData) => {
          withChain(editor, (c) => c.insertContent(emojiData.emoji).run());
          setShow(false);
        }}
        width={300}
        height={400}
      />
    </div>
  );
}

// FormatButton is defined at the top level to avoid nested component definition (lint rule)

export default React.memo(function FloatingToolbar({
  editor,
  comments,
  onCreateComment,
}: Readonly<{
  editor: EditorLike | null;
  comments: Comment[];
  onCreateComment: (from: number, to: number, text: string) => void;
}>) {
  const [show, setShow] = useState(false);
  const [coords, setCoords] = useState({
    top: 0,
    left: 0,
    placement: "top",
  });
  const [showHighlight, setShowHighlight] = useState(false);
  const [showTextColor, setShowTextColor] = useState(false);
  const [customHighlightColor, setCustomHighlightColor] = useState("#fef08a");
  const [customTextColor, setCustomTextColor] = useState("#ef4444");
  const [showLinkEdit, setShowLinkEdit] = useState(false);
  const [linkInput, setLinkInput] = useState("");
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const [selectionRange, setSelectionRange] = useState<SelectionRange>(null);

  // Formatting buttons are rendered in place to keep complexity manageable

  // Narrow editor locally where we use TipTap APIs
  const tipTapEditor = editor as EditorLike;
  const isDisabled = !editor;

  // Run effect when editor instance or its focus/selection state changes.
  // We include specific selection fields to avoid re-running on unrelated state.
  useEffect(() => {
    if (!editor) return;
    const update = () => {
      const selection = globalThis.getSelection();
      if (!selection || selection.isCollapsed || !tipTapEditor.isFocused) {
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
      const spaceBelow = globalThis.innerHeight - rect.bottom;
      let placement = "top";
      // Strongly prefer top placement. Only switch to bottom if there's really no room above
      // and there IS room below.
      // Fixed positioning uses viewport coordinates directly (getBoundingClientRect returns these)
      // So we do NOT add scrollY/scrollX.
      let top = rect.top - toolbarHeight - margin;
      
      if (spaceAbove < toolbarHeight + margin && spaceBelow > toolbarHeight + margin) {
        placement = "bottom";
        top = rect.bottom + margin;
      }
      setCoords({
        top,
        left: rect.left + rect.width / 2,
        placement,
      });
      setShow(true);
      // Save selection range for comment
      const sel = tipTapEditor.state?.selection;
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
    globalThis.addEventListener("scroll", update, true);
    globalThis.addEventListener("resize", update);
    return () => {
      editor.off?.("selectionUpdate", update);
      editor.off?.("blur", onBlur);
      globalThis.removeEventListener("scroll", update, true);
      globalThis.removeEventListener("resize", update);
    };
  }, [
    editor,
    // include focus and selection coordinates to respond to selection changes
    tipTapEditor?.isFocused,
    tipTapEditor?.state?.selection?.from,
    tipTapEditor?.state?.selection?.to,
    tipTapEditor?.state?.selection,
  ]);

  // Link editing logic (local narrow casts only inside component)
  const isLinkActive = !!editor && tipTapEditor.isActive("link");
  function getAttr(name: string) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return tipTapEditor.getAttributes(name) as any;
    } catch {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return {} as any;
    }
  }

  const currentLink = editor ? (getAttr("link").href ?? "") : "";

  // Handlers to reduce cognitive complexity
  const handleBold = useCallback(
    () => withChain(tipTapEditor, (c) => c.focus().toggleBold().run()),
    [tipTapEditor]
  );
  const handleItalic = useCallback(
    () => withChain(tipTapEditor, (c) => c.focus().toggleItalic().run()),
    [tipTapEditor]
  );
  const handleUnderline = useCallback(
    () => withChain(tipTapEditor, (c) => c.focus().toggleUnderline().run()),
    [tipTapEditor]
  );
  const handleStrike = useCallback(
    () => withChain(tipTapEditor, (c) => c.focus().toggleStrike().run()),
    [tipTapEditor]
  );
  const handleCode = useCallback(
    () => withChain(tipTapEditor, (c) => c.focus().toggleCode().run()),
    [tipTapEditor]
  );
  const handleLink = useCallback(() => {
    if (isLinkActive) {
      setLinkInput(currentLink);
      setShowLinkEdit((v) => !v);
    } else {
      const url = globalThis.prompt("Enter URL", "");
      if (url === null) return;
      if (url === "") {
        withChain(tipTapEditor, (c) => c.focus().unsetLink().run());
      } else {
        withChain(tipTapEditor, (c) => c.focus().setLink({ href: url }).run());
      }
    }
  }, [isLinkActive, currentLink, setLinkInput, setShowLinkEdit, tipTapEditor]);
  const handleHighlight = useCallback(() => {
    setShowHighlight((v) => !v);
    setShowTextColor(false);
    setShowLinkEdit(false);
  }, [setShowHighlight, setShowTextColor, setShowLinkEdit]);
  const handleTextColor = useCallback(() => {
    setShowTextColor((v) => !v);
    setShowHighlight(false);
    setShowLinkEdit(false);
    setShowEmojiPicker(false);
  }, [setShowTextColor, setShowHighlight, setShowLinkEdit, setShowEmojiPicker]);
  const handleEmoji = useCallback(() => {
    setShowEmojiPicker((v) => !v);
    setShowHighlight(false);
    setShowTextColor(false);
    setShowLinkEdit(false);
  }, [setShowEmojiPicker, setShowHighlight, setShowTextColor, setShowLinkEdit]);
  const handleComment = useCallback(() => {
    const existing = (comments || []).find(
      (c) =>
        !c.resolved &&
        c.from === selectionRange!.from &&
        c.to === selectionRange!.to
    );
    if (existing) {
      // Show reply/resolve UI (handled in main page popup)
    }
    setShowCommentInput((v) => !v);
    setShowHighlight(false);
    setShowTextColor(false);
    setShowLinkEdit(false);
  }, [
    comments,
    selectionRange,
    setShowCommentInput,
    setShowHighlight,
    setShowTextColor,
    setShowLinkEdit,
  ]);

  if (!show || !editor) return null;

  return (
    <TooltipProvider>
      <AnimatePresence>
        <motion.div
          ref={toolbarRef}
          initial={{
            opacity: 0,
            scale: 0.8,
            y: coords.placement === "top" ? 10 : -10,
          }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{
            opacity: 0,
            scale: 0.8,
            y: coords.placement === "top" ? 10 : -10,
          }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          style={{
            position: "fixed",
            top: coords.top,
            left: coords.left,
            transform: "translate(-50%, 0)",
            zIndex: 99999, // Ensure it's on top of everything including fixed headers
          }}
          className="bg-white/95 dark:bg-[#23233a]/95 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-2xl flex gap-1 px-3 py-2 glass-card"
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
                d={
                  coords.placement === "top" ? "M1 8L9 1L17 8" : "M1 0L9 7L17 0"
                }
                stroke="#e5e7eb"
                strokeWidth="1"
                className="dark:stroke-gray-700"
              />
            </svg>
          </div>
          {/* Formatting actions */}
          <Tooltip>
            <TooltipTrigger asChild>
              <FormatButton
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleBold();
                }}
                pressed={tipTapEditor.isActive("bold")}
                label="Bold"
              >
                <Bold className="w-4 h-4" />
              </FormatButton>
            </TooltipTrigger>
            <TooltipContent>
              <p>Bold (Ctrl+B)</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <FormatButton
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleItalic();
                }}
                pressed={tipTapEditor.isActive("italic")}
                label="Italic"
              >
                <Italic className="w-4 h-4" />
              </FormatButton>
            </TooltipTrigger>
            <TooltipContent>
              <p>Italic (Ctrl+I)</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <FormatButton
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleUnderline();
                }}
                pressed={tipTapEditor.isActive("underline")}
                label="Underline"
                disabled={isDisabled}
              >
                <UnderlineIcon className="w-4 h-4" />
              </FormatButton>
            </TooltipTrigger>
            <TooltipContent>
              <p>Underline (Ctrl+U)</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <FormatButton
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleStrike();
                }}
                pressed={tipTapEditor.isActive("strike")}
                label="Strikethrough"
                disabled={isDisabled}
              >
                <Strikethrough className="w-4 h-4" />
              </FormatButton>
            </TooltipTrigger>
            <TooltipContent>
              <p>Strikethrough</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <FormatButton
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleCode();
                }}
                pressed={tipTapEditor.isActive("code")}
                label="Inline Code"
                disabled={isDisabled}
              >
                <Code className="w-4 h-4" />
              </FormatButton>
            </TooltipTrigger>
            <TooltipContent>
              <p>Inline Code</p>
            </TooltipContent>
          </Tooltip>
          {/* Link editing */}
          <div className="relative">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  disabled={isDisabled}
                  aria-pressed={isLinkActive}
                  className={`p-2 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900 ${isLinkActive ? "bg-indigo-200 dark:bg-indigo-800" : ""}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleLink();
                  }}
                  aria-label="Link"
                >
                  <LinkIcon className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add Link (Ctrl+K)</p>
              </TooltipContent>
            </Tooltip>
            <LinkEditor
              editor={tipTapEditor}
              show={showLinkEdit}
              linkInput={linkInput}
              setLinkInput={setLinkInput}
              setShow={setShowLinkEdit}
            />
          </div>
          {/* Highlight color picker */}
          <div className="relative">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  disabled={isDisabled}
                  aria-pressed={tipTapEditor?.isActive?.("highlight")}
                  className={`p-2 rounded hover:bg-yellow-100 dark:hover:bg-yellow-900 ${tipTapEditor.isActive("highlight") ? "bg-yellow-200 dark:bg-yellow-800" : ""}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleHighlight();
                  }}
                  aria-label="Highlight"
                >
                  <PenLine className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Highlight Text (Select text first)</p>
              </TooltipContent>
            </Tooltip>
            <HighlightPicker
              editor={tipTapEditor}
              show={showHighlight}
              customColor={customHighlightColor}
              setCustomColor={setCustomHighlightColor}
              setShow={setShowHighlight}
            />
          </div>
          {/* Text color picker */}
          <div className="relative">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  disabled={isDisabled}
                  aria-pressed={
                    tipTapEditor?.isActive?.("textStyle") &&
                    !!getAttr("textStyle")?.color
                  }
                  className={`p-2 rounded hover:bg-pink-100 dark:hover:bg-pink-900 ${tipTapEditor.isActive("textStyle") && getAttr("textStyle")?.color ? "bg-pink-200 dark:bg-pink-800" : ""}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleTextColor();
                  }}
                  aria-label="Text Color"
                >
                  <PaletteIcon className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Text Color</p>
              </TooltipContent>
            </Tooltip>
            <TextColorPicker
              editor={tipTapEditor}
              show={showTextColor}
              customColor={customTextColor}
              setCustomColor={setCustomTextColor}
              setShow={setShowTextColor}
            />
          </div>
          {/* Emoji picker */}
          <div className="relative">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  disabled={isDisabled}
                  className={`p-2 rounded hover:bg-purple-100 dark:hover:bg-purple-900`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleEmoji();
                  }}
                  aria-label="Insert Emoji"
                >
                  <Smile className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Insert Emoji</p>
              </TooltipContent>
            </Tooltip>
            <EmojiPickerComponent
              show={showEmojiPicker}
              setShow={setShowEmojiPicker}
              editor={tipTapEditor}
            />
          </div>
          {/* Print button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                disabled={isDisabled}
                className={`p-2 rounded hover:bg-orange-100 dark:hover:bg-orange-900`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  globalThis.print();
                }}
                aria-label="Print Document"
              >
                <Printer className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Print Document</p>
            </TooltipContent>
          </Tooltip>
          {/* Comment action */}
          {selectionRange && selectionRange.from !== selectionRange.to && (
            <div className="relative">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    disabled={isDisabled}
                    className={`p-2 rounded hover:bg-green-100 dark:hover:bg-green-900`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleComment();
                    }}
                    aria-label="Add Comment"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add Comment</p>
                </TooltipContent>
              </Tooltip>
              <CommentInput
                selectionRange={selectionRange}
                show={showCommentInput}
                commentText={commentText}
                setCommentText={setCommentText}
                setShow={setShowCommentInput}
                onCreateComment={onCreateComment}
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </TooltipProvider>
  );
});
