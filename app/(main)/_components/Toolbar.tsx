"use client";
import React from "react";
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
} from "lucide-react";
import Underline from "@tiptap/extension-underline";
import Strike from "@tiptap/extension-strike";
import Highlight from "@tiptap/extension-highlight";

const Toolbar = ({
  editor,
  disabled = false,
}: {
  editor: unknown;
  disabled?: boolean;
}) => {
  if (!editor) return null;
  const btn = (
    onClick: () => void,
    active: boolean,
    Icon: any,
    label: string,
    shortcut?: string
  ) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900 transition ${active ? "bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200" : "text-gray-500"}`}
      title={shortcut ? `${label} (${shortcut})` : label}
      tabIndex={0}
      aria-label={label}
      disabled={disabled}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
  return (
    <div className="flex gap-1 mb-4 border-b pb-2 bg-white/80 dark:bg-[#23233a]/80 rounded-t-lg sticky top-0 z-10">
      {btn(
        () => {
          (editor as any).chain().focus().toggleBold().run();
          console.log("Bold active:", (editor as any).isActive("bold"));
        },
        (editor as any)?.isActive("bold"),
        Bold,
        "Bold",
        "Ctrl+B"
      )}
      {btn(
        () => {
          (editor as any).chain().focus().toggleItalic().run();
          console.log("Italic active:", (editor as any).isActive("italic"));
        },
        (editor as any)?.isActive("italic"),
        Italic,
        "Italic",
        "Ctrl+I"
      )}
      {btn(
        () => {
          (editor as any).chain().focus().toggleUnderline().run();
          console.log(
            "Underline active:",
            (editor as any).isActive("underline")
          );
        },
        (editor as any)?.isActive("underline"),
        Underline,
        "Underline",
        "Ctrl+U"
      )}
      {btn(
        () => {
          (editor as any).chain().focus().toggleStrike().run();
          console.log("Strike active:", (editor as any).isActive("strike"));
        },
        (editor as any)?.isActive("strike"),
        Strike,
        "Strikethrough",
        "Ctrl+Shift+S"
      )}
      {btn(
        () => {
          (editor as any).chain().focus().toggleCode().run();
          console.log("Code active:", (editor as any).isActive("code"));
        },
        (editor as any)?.isActive("code"),
        Code,
        "Inline Code",
        "Ctrl+E"
      )}
      {btn(
        () => {
          (editor as any).chain().focus().toggleHighlight().run();
          console.log(
            "Highlight active:",
            (editor as any).isActive("highlight")
          );
        },
        (editor as any)?.isActive("highlight"),
        Highlight,
        "Highlight",
        "Ctrl+Shift+H"
      )}
      {btn(
        () => {
          (editor as any).chain().focus().toggleHeading({ level: 1 }).run();
          console.log(
            "Heading 1 active:",
            (editor as any).isActive("heading", { level: 1 })
          );
        },
        (editor as any)?.isActive("heading", { level: 1 }),
        Heading1,
        "Heading 1",
        "Ctrl+Alt+1"
      )}
      {btn(
        () => {
          (editor as any).chain().focus().toggleHeading({ level: 2 }).run();
          console.log(
            "Heading 2 active:",
            (editor as any).isActive("heading", { level: 2 })
          );
        },
        (editor as any)?.isActive("heading", { level: 2 }),
        Heading2,
        "Heading 2",
        "Ctrl+Alt+2"
      )}
      {btn(
        () => {
          (editor as any).chain().focus().toggleBulletList().run();
          console.log(
            "Bullet List active:",
            (editor as any).isActive("bulletList")
          );
        },
        (editor as any)?.isActive("bulletList"),
        List,
        "Bullet List",
        "Ctrl+Shift+8"
      )}
      {btn(
        () => {
          (editor as any).chain().focus().toggleOrderedList().run();
          console.log(
            "Ordered List active:",
            (editor as any).isActive("orderedList")
          );
        },
        (editor as any)?.isActive("orderedList"),
        ListOrdered,
        "Ordered List",
        "Ctrl+Shift+7"
      )}
      {btn(
        () => {
          (editor as any).chain().focus().toggleCodeBlock().run();
          console.log(
            "Code Block active:",
            (editor as any).isActive("codeBlock")
          );
        },
        (editor as any)?.isActive("codeBlock"),
        Code,
        "Code Block",
        "Ctrl+E"
      )}
      {btn(
        () => {
          (editor as any).chain().focus().toggleBlockquote().run();
          console.log(
            "Blockquote active:",
            (editor as any).isActive("blockquote")
          );
        },
        (editor as any)?.isActive("blockquote"),
        Quote,
        "Blockquote"
      )}
      {btn(
        () => (editor as any).chain().focus().setHorizontalRule().run(),
        false,
        Minus,
        "Horizontal Rule"
      )}
      <span className="mx-2 border-l border-gray-300 dark:border-gray-700" />
      {btn(
        () => (editor as any).chain().focus().undo().run(),
        false,
        Undo,
        "Undo",
        "Ctrl+Z"
      )}
      {btn(
        () => (editor as any).chain().focus().redo().run(),
        false,
        Redo,
        "Redo",
        "Ctrl+Y"
      )}
    </div>
  );
};

export default Toolbar;
