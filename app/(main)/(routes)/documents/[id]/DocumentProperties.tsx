/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, memo } from "react";
import { motion } from "framer-motion";
import type { Editor } from "@tiptap/react";
import {
  Users,
  Share2,
  MoreHorizontal,
  CheckCircle,
  Loader2,
  FileText,
  Type,
  AlignLeft,
  Clock,
} from "lucide-react";

interface DocumentPropertiesProps {
  editor: Editor | null;
  isAutoSaving: boolean;
  lastSaved: Date | null;
  collaboratorCount: number;
  onShare?: () => void;
}

const DocumentProperties: React.FC<DocumentPropertiesProps> = memo(
  ({ editor, isAutoSaving, lastSaved, collaboratorCount, onShare }) => {
    const [stats, setStats] = useState({
      wordCount: 0,
      charCount: 0,
      paragraphs: 0,
      readingTime: 0,
    });

    useEffect(() => {
      if (!editor) return;

      const updateStats = () => {
        const text = editor.getText();
        const words =
          text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;
        const chars = text.length;
        const paragraphs = text
          .split(/\n\s*\n/)
          .filter((p) => p.trim().length > 0).length;
        const readingTime = Math.ceil(words / 200); // Average reading speed

        setStats({
          wordCount: words,
          charCount: chars,
          paragraphs,
          readingTime,
        });
      };

      updateStats();
      editor.on("update", updateStats);

      return () => {
        editor.off("update", updateStats);
      };
    }, [editor]);

    const formatLastSaved = (date: Date | null) => {
      if (!date) return "Never";
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return "Just now";
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      return `${days}d ago`;
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-4 shadow-lg mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={isAutoSaving ? { rotate: 360 } : {}}
              transition={{
                duration: 1,
                repeat: isAutoSaving ? Infinity : 0,
                ease: "linear",
              }}
              className="flex items-center gap-2"
            >
              {isAutoSaving ? (
                <Loader2 className="w-5 h-5 text-blue-500" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {isAutoSaving ? "Saving..." : "Saved"}
              </span>
            </motion.div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatLastSaved(lastSaved)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {collaboratorCount > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-full">
                <Users className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                  {collaboratorCount}
                </span>
              </div>
            )}

            {onShare && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onShare}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Share document"
              >
                <Share2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="More options"
            >
              <MoreHorizontal className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="group relative bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 text-center hover:shadow-lg transition-all duration-300 hover:scale-105 border border-blue-100/50 dark:border-blue-800/30"
          >
            <div className="flex items-center justify-center mb-2">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.wordCount.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">
              Words
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-indigo-400/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="group relative bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-4 text-center hover:shadow-lg transition-all duration-300 hover:scale-105 border border-emerald-100/50 dark:border-emerald-800/30"
          >
            <div className="flex items-center justify-center mb-2">
              <Type className="w-6 h-6 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.charCount.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">
              Characters
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 to-teal-400/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="group relative bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl p-4 text-center hover:shadow-lg transition-all duration-300 hover:scale-105 border border-purple-100/50 dark:border-purple-800/30"
          >
            <div className="flex items-center justify-center mb-2">
              <AlignLeft className="w-6 h-6 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.paragraphs}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">
              Paragraphs
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/5 to-violet-400/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="group relative bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-4 text-center hover:shadow-lg transition-all duration-300 hover:scale-105 border border-amber-100/50 dark:border-amber-800/30"
          >
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.readingTime}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">
              Min Read
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 to-orange-400/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.div>
        </div>
      </motion.div>
    );
  }
);

DocumentProperties.displayName = "DocumentProperties";

export { DocumentProperties };
