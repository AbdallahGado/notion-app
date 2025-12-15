/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  RotateCcw,
  Trash2,
  MoreHorizontal,
  Calendar,
  User,
} from "lucide-react";

interface Version {
  id: string;
  timestamp: Date;
  title: string;
  author: string;
  changesSummary: string;
  contentLength: number;
}

interface DocumentHistoryProps {
  isOpen?: boolean;
  onClose?: () => void;
  documentId?: string;
  versions?: Version[];
  onRestore?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const DocumentHistory: React.FC<DocumentHistoryProps> = memo(
  ({ versions = [], onRestore, onDelete }) => {
    const formatTime = (date: Date) => {
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return "Just now";
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      if (days < 7) return `${days}d ago`;

      return date.toLocaleDateString();
    };

    const formatContentLength = (length: number) => {
      if (length < 1000) return `${length} chars`;
      return `${Math.round(length / 1000)}k chars`;
    };

    const sortedVersions = [...versions].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );

    const latestVersion = sortedVersions[0];
    const otherVersions = sortedVersions.slice(1);

    return (
      <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Version History
          </h3>
        </div>

        <div className="space-y-3">
          {/* Latest Version */}
          {latestVersion && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">✓</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">
                      Latest Version
                    </span>
                    <span className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-800/50 px-2 py-0.5 rounded-full">
                      Current
                    </span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                    {latestVersion.title}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-green-600 dark:text-green-400">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {latestVersion.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatTime(latestVersion.timestamp)}
                    </div>
                    <div className="flex items-center gap-1">
                      <span>
                        {formatContentLength(latestVersion.contentLength)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Other Versions */}
          <AnimatePresence>
            {otherVersions.map((version, index) => (
              <motion.div
                key={version.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.1 }}
                className="group relative"
              >
                {/* Timeline line */}
                <div className="absolute left-4 top-8 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />

                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                  <div className="flex-shrink-0 relative">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {otherVersions.length - index}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      {version.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {version.changesSummary}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {version.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatTime(version.timestamp)}
                      </div>
                      <div className="flex items-center gap-1">
                        <span>
                          {formatContentLength(version.contentLength)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-1">
                      {onRestore && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onRestore(version.id)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                          title="Restore this version"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </motion.button>
                      )}
                      {onDelete && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onDelete(version.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="Delete this version"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        title="More options"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {versions.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No version history yet</p>
              <p className="text-xs mt-1">
                Changes will appear here as you edit
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }
);

DocumentHistory.displayName = "DocumentHistory";

export { DocumentHistory };
