/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Editor } from "@tiptap/react";
import {
  Search,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Image,
  Link,
  Table,
  Type,
  Zap,
} from "lucide-react";

interface Command {
  id: string;
  title: string;
  description: string;
  category: "format" | "insert" | "ai" | "recent";
  icon: React.ComponentType<any>;
  action: () => void;
  shortcut?: string;
}

interface SmartCommandPaletteProps {
  editor: Editor | null;
  isOpen: boolean;
  onClose: () => void;
}

const SmartCommandPalette: React.FC<SmartCommandPaletteProps> = memo(
  ({ editor, isOpen, onClose }) => {
    const [query, setQuery] = useState("");
    const [selectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const commands: Command[] = [
      // Format commands
      {
        id: "bold",
        title: "Bold",
        description: "Make text bold",
        category: "format",
        icon: Bold,
        action: () => editor?.chain().focus().toggleBold().run(),
        shortcut: "Ctrl+B",
      },
      {
        id: "italic",
        title: "Italic",
        description: "Make text italic",
        category: "format",
        icon: Italic,
        action: () => editor?.chain().focus().toggleItalic().run(),
        shortcut: "Ctrl+I",
      },
      {
        id: "underline",
        title: "Underline",
        description: "Underline text",
        category: "format",
        icon: Underline,
        action: () => editor?.chain().focus().toggleUnderline().run(),
      },
      {
        id: "heading1",
        title: "Heading 1",
        description: "Large heading",
        category: "format",
        icon: Heading1,
        action: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
        shortcut: "Ctrl+Alt+1",
      },
      {
        id: "heading2",
        title: "Heading 2",
        description: "Medium heading",
        category: "format",
        icon: Heading2,
        action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
        shortcut: "Ctrl+Alt+2",
      },
      {
        id: "heading3",
        title: "Heading 3",
        description: "Small heading",
        category: "format",
        icon: Heading3,
        action: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(),
        shortcut: "Ctrl+Alt+3",
      },

      // Insert commands
      {
        id: "bullet-list",
        title: "Bullet List",
        description: "Create a bullet list",
        category: "insert",
        icon: List,
        action: () => editor?.chain().focus().toggleBulletList().run(),
        shortcut: "Ctrl+Shift+8",
      },
      {
        id: "ordered-list",
        title: "Numbered List",
        description: "Create a numbered list",
        category: "insert",
        icon: ListOrdered,
        action: () => editor?.chain().focus().toggleOrderedList().run(),
        shortcut: "Ctrl+Shift+7",
      },
      {
        id: "blockquote",
        title: "Quote",
        description: "Insert a blockquote",
        category: "insert",
        icon: Quote,
        action: () => editor?.chain().focus().toggleBlockquote().run(),
        shortcut: "Ctrl+Shift+B",
      },
      {
        id: "code-block",
        title: "Code Block",
        description: "Insert a code block",
        category: "insert",
        icon: Code,
        action: () => editor?.chain().focus().toggleCodeBlock().run(),
        shortcut: "Ctrl+Alt+C",
      },
      {
        id: "table",
        title: "Table",
        description: "Insert a table",
        category: "insert",
        icon: Table,
        action: () =>
          editor
            ?.chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run(),
      },
      {
        id: "image",
        title: "Image",
        description: "Insert an image",
        category: "insert",
        icon: Image,
        action: () => {
          const url = prompt("Enter image URL:");
          if (url) {
            editor?.chain().focus().setImage({ src: url }).run();
          }
        },
      },
      {
        id: "link",
        title: "Link",
        description: "Insert a link",
        category: "insert",
        icon: Link,
        action: () => {
          const url = prompt("Enter URL:");
          if (url) {
            editor
              ?.chain()
              .focus()
              .extendMarkRange("link")
              .setLink({ href: url })
              .run();
          }
        },
        shortcut: "Ctrl+K",
      },

      // AI commands (placeholders)
      {
        id: "ai-summarize",
        title: "Summarize",
        description: "AI-powered text summarization",
        category: "ai",
        icon: Zap,
        action: () => {
          // TODO: Implement AI summarization
          console.log("AI Summarize");
        },
      },
      {
        id: "ai-rewrite",
        title: "Rewrite",
        description: "AI-powered text rewriting",
        category: "ai",
        icon: Type,
        action: () => {
          // TODO: Implement AI rewriting
          console.log("AI Rewrite");
        },
      },
    ];

    const filteredCommands = commands.filter(
      (command) =>
        command.title.toLowerCase().includes(query.toLowerCase()) ||
        command.description.toLowerCase().includes(query.toLowerCase())
    );

    // Removed grouping as groupedCommands and getCategoryColor were unused
    // Removed getCategoryColor function

    if (!isOpen) return null;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20"
          onClick={onClose}
        >
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl mx-4 max-h-[70vh] overflow-hidden"
            onClick={(e: React.MouseEvent<HTMLDivElement>) =>
              e.stopPropagation()
            }
          >
            {/* Search Input */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search commands..."
                  value={query}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setQuery(e.target.value)
                  }
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Commands List */}
            <div className="max-h-96 overflow-y-auto">
              {filteredCommands.map((command, index) => {
                const isSelected = index === selectedIndex;
                const Icon = command.icon;

                return (
                  <motion.div
                    key={command.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`px-3 py-2 mx-1 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-blue-50 dark:bg-blue-900/30"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    }`}
                    onClick={() => {
                      command.action();
                      onClose();
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/40">
                          <Icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 dark:text-white truncate">
                            {command.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {command.description}
                          </div>
                        </div>
                      </div>
                      {command.shortcut && (
                        <div className="text-xs text-gray-400 dark:text-gray-500 font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          {command.shortcut}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {filteredCommands.length === 0 && (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No commands found</p>
                  <p className="text-sm mt-1">Try a different search term</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-gray-50 dark:bg-zinc-800 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-4">
                  <span>↑↓ Navigate</span>
                  <span>↵ Select</span>
                  <span>Esc Close</span>
                </div>
                <span>{filteredCommands.length} commands</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }
);

SmartCommandPalette.displayName = "SmartCommandPalette";

export { SmartCommandPalette };
