"use client";

import { useEditor, EditorContent, Editor as TiptapEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import { Link as TipTapLink } from "@tiptap/extension-link";
import { CustomImageExtension } from "./CustomImageExtension";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Highlight from "@tiptap/extension-highlight";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { createLowlight } from "lowlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";

import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import java from "highlight.js/lib/languages/java";
import cpp from "highlight.js/lib/languages/cpp";
import c from "highlight.js/lib/languages/c";
import xml from "highlight.js/lib/languages/xml"; 
import css from "highlight.js/lib/languages/css";
import json from "highlight.js/lib/languages/json";
import markdown from "highlight.js/lib/languages/markdown";
import sql from "highlight.js/lib/languages/sql";
import bash from "highlight.js/lib/languages/bash";

// import { MathInline, MathBlock } from "@/app/(main)/(routes)/documents/[id]/MathExtension";
import { SlashCommandExtension, suggestion } from "@/app/(main)/(routes)/documents/[id]/slash-command";
import { Decoration, DecorationSet } from "prosemirror-view";
import type { CommentType } from "@/app/(main)/(routes)/documents/comment-types";
import { EditorBubbleMenu } from "@/app/(main)/_components/toolbar/EditorBubbleMenu";
import BubbleMenuExtension from "@tiptap/extension-bubble-menu";
import { useMediaQuery } from "usehooks-ts";
import { useState, useEffect } from "react";

// Setup lowlight
const lowlight = createLowlight({
  javascript,
  typescript,
  python,
  java,
  cpp,
  c,
  xml,
  css,
  json,
  markdown,
  sql,
  bash,
});

interface EditorProps {
  initialContent?: string;
  editable?: boolean;
  onChange?: (content: string) => void;
  documentComments?: CommentType[];
  searchResults?: { from: number; to: number }[];
  currentSearchIndex?: number;
  setEditor?: (editor: TiptapEditor) => void;
}

export const Editor = ({ 
  initialContent, 
  editable = true, 
  onChange,
  documentComments = [],
  searchResults = [],
  currentSearchIndex = 0,
  setEditor
}: EditorProps) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const editor = useEditor({
    editable,
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      SlashCommandExtension.configure({
        suggestion,
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: "javascript",
      }),
      BulletList,
      OrderedList,
      Underline,
      TipTapLink,
      CustomImageExtension,
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
      BubbleMenuExtension.configure({
        pluginKey: 'bubbleMenu',
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    onCreate: ({ editor }) => {
      setEditor?.(editor);
    },
    editorProps: {
      decorations: (state) => {
        const decos: Decoration[] = [];

        // Comment decorations
        if (documentComments && documentComments.length > 0) {
          for (const { from, to, resolved } of documentComments) {
            decos.push(
              Decoration.inline(from, to, {
                style: resolved
                   ? "background: #e5e7eb; opacity: 0.5; border-radius: 2px;"
                   : "background: #fef08a; border-radius: 2px;",
              })
            );
          }
        }

        // Search result decorations
        if (searchResults && searchResults.length > 0) {
          for (let index = 0; index < searchResults.length; index++) {
            const { from, to } = searchResults[index];
            const isCurrent = index === currentSearchIndex;
            decos.push(
              Decoration.inline(from, to, {
                style: isCurrent
                   ? "background: linear-gradient(90deg, #3b82f6, #6366f1); color: white; border-radius: 4px; padding: 3px 6px; box-shadow: 0 0 12px rgba(59, 130, 246, 0.6), 0 2px 8px rgba(59, 130, 246, 0.3); transform: scale(1.08); font-weight: 600; border: 2px solid rgba(255, 255, 255, 0.3); animation: pulse-highlight 1.5s ease-in-out infinite;"
                   : "background: linear-gradient(90deg, #dbeafe, #bfdbfe); border-radius: 3px; padding: 2px 4px; border: 1px solid rgba(59, 130, 246, 0.2); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);",
              })
            );
          }
        }

        return DecorationSet.create(state.doc, decos);
      },
    },
  });

  return (
    <div className="w-full max-w-none relative group/editor">
        <style jsx global>{`
          .ProseMirror ::selection {
            background-color: rgba(99, 102, 241, 0.15);
            color: inherit;
          }
          .ProseMirror .is-editor-empty:first-child::before {
            color: #4b5563;
            content: attr(data-placeholder);
            float: left;
            height: 0;
            pointer-events: none;
          }
          .ProseMirror .ProseMirror-focused {
            outline: none;
          }
          .ProseMirror .ProseMirror-selectednode {
            outline: 1px solid rgba(99, 102, 241, 0.4);
            background: rgba(99, 102, 241, 0.05);
          }
        `}</style>

        {mounted && (
          <>
            {!isMobile && editor && <EditorBubbleMenu editor={editor} />}
          </>
        )}
        
        <div className="min-h-[500px] w-full transition-all duration-300 antialiased selection:bg-indigo-500/20">
          <EditorContent editor={editor} />
        </div>
    </div>
  );
};
