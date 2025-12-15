/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Editor } from "@tiptap/react";
import {
  Plus,
  FileText,
  List,
  MessageCircle,
  Eye,
  Download,
  Share2,
  Sparkles,
  Table,
} from "lucide-react";

interface FloatingActionMenuProps {
  editor?: Editor | null;
  onAddContent?: () => void;
  onQuickInsert?: () => void;
  onComments?: () => void;
  onPreview?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  onInsertTable?: () => void;
}

const FloatingActionMenu: React.FC<FloatingActionMenuProps> = memo(
  ({
    onAddContent,
    onQuickInsert,
    onComments,
    onPreview,
    onDownload,
    onShare,
    onInsertTable,
  }) => {
    const [isOpen, setIsOpen] = useState(false);

    const actions = [
      {
        id: "add-content",
        label: "Add Content",
        icon: FileText,
        color: "bg-blue-500 hover:bg-blue-600",
        onClick: onAddContent,
      },
      {
        id: "insert-table",
        label: "Insert Table",
        icon: Table,
        color: "bg-teal-500 hover:bg-teal-600",
        onClick: onInsertTable,
      },
      {
        id: "quick-insert",
        label: "Quick Insert",
        icon: List,
        color: "bg-green-500 hover:bg-green-600",
        onClick: onQuickInsert,
      },
      {
        id: "comments",
        label: "Comments",
        icon: MessageCircle,
        color: "bg-purple-500 hover:bg-purple-600",
        onClick: onComments,
      },
      {
        id: "preview",
        label: "Preview",
        icon: Eye,
        color: "bg-orange-500 hover:bg-orange-600",
        onClick: onPreview,
      },
      {
        id: "share",
        label: "Share",
        icon: Share2,
        color: "bg-pink-500 hover:bg-pink-600",
        onClick: onShare,
      },
      {
        id: "download",
        label: "Download",
        icon: Download,
        color: "bg-indigo-500 hover:bg-indigo-600",
        onClick: onDownload,
      },
    ];

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
      <div className="fixed bottom-6 right-6 z-40">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-16 right-0 flex flex-col gap-3"
            >
              {actions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={action.id}
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.8 }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    }}
                    onClick={() => {
                      action.onClick?.();
                      setIsOpen(false);
                    }}
                    className={`w-12 h-12 rounded-full ${action.color} text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group relative`}
                    aria-label={action.label}
                  >
                    <Icon className="w-5 h-5" />
                    <div className="absolute right-full mr-3 px-2 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                      {action.label}
                      <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{
            duration: 0.3,
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
          onClick={toggleMenu}
          className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center relative overflow-hidden"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          <motion.div
            animate={{ scale: isOpen ? 0 : 1 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Plus className="w-6 h-6" />
          </motion.div>
          <motion.div
            animate={{ scale: isOpen ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Sparkles className="w-6 h-6" />
          </motion.div>
        </motion.button>
      </div>
    );
  }
);

FloatingActionMenu.displayName = "FloatingActionMenu";

export { FloatingActionMenu };
