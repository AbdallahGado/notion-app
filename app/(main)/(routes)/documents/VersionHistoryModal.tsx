"use client";
import type { Id } from "@/convex/_generated/dataModel";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, RotateCcw, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VersionHistoryModalProps {
  readonly documentId: string;
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

interface Version {
  _id: string;
  title: string;
  content?: string;
  createdAt: number;
  versionNumber?: number;
}

const VersionHistoryModal = function VersionHistoryModal({
  documentId,
  isOpen,
  onClose,
}: VersionHistoryModalProps) {
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  const versions = useQuery(api.documents.getVersions, {
    documentId: documentId as Id<"documents">,
  });
  const restoreVersion = useMutation(api.documents.restoreVersion);

  const handleRestore = async (versionId: string) => {
    if (!documentId) return;

    setIsRestoring(true);
    try {
      await restoreVersion({
        documentId: documentId as Id<"documents">,
        versionId: versionId as Id<"document_versions">,
      });
      toast.success("Version restored successfully");
      onClose();
      // Refresh the page to show the restored content
      globalThis.location.reload();
    } catch (error) {
      console.error("Failed to restore version:", error);
      toast.error("Failed to restore version");
    } finally {
      setIsRestoring(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const truncateContent = (content?: string, maxLength: number = 200) => {
    if (!content) return "No content";
    return content.length > maxLength
      ? content.substring(0, maxLength) + "..."
      : content;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Version History
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex h-[calc(80vh-80px)]">
            {/* Versions List */}
            <div className="w-1/2 border-r border-gray-200 dark:border-slate-700 overflow-y-auto">
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Previous Versions
                </h3>
                {versions?.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No previous versions found
                  </p>
                ) : (
                  <div className="space-y-3">
                    {versions?.map((version) => (
                      <motion.div
                        key={version._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                          selectedVersion?._id === version._id
                            ? "border-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-600"
                            : "border-gray-200 dark:border-slate-700 hover:border-indigo-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                        }`}
                        onClick={() => setSelectedVersion(version)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                              {version.title || "Untitled"}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              Version {version.versionNumber || "N/A"} •{" "}
                              {formatDate(version.createdAt)}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                              {truncateContent(version.content)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedVersion(version);
                              }}
                              className="text-indigo-600 border-indigo-300 hover:bg-indigo-50 dark:text-indigo-400 dark:border-indigo-600 dark:hover:bg-indigo-900/20"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Preview
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRestore(version._id);
                              }}
                              disabled={isRestoring}
                              className="text-green-600 border-green-300 hover:bg-green-50 dark:text-green-400 dark:border-green-600 dark:hover:bg-green-900/20"
                            >
                              <RotateCcw className="w-4 h-4 mr-1" />
                              Restore
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Version Preview */}
            <div className="w-1/2 p-4 overflow-y-auto">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Version Preview
              </h3>
              {selectedVersion ? (
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="version-title"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Title
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {selectedVersion.title || "Untitled"}
                      </h4>
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="version-content"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Content
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 max-h-96 overflow-y-auto">
                      {selectedVersion.content ? (
                        <div
                          className="prose prose-sm dark:prose-invert max-w-none"
                          dangerouslySetInnerHTML={{
                            __html: selectedVersion.content,
                          }}
                        />
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 italic">
                          No content in this version
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-slate-700">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Created: {formatDate(selectedVersion.createdAt)}
                    </div>
                    <Button
                      onClick={() => handleRestore(selectedVersion._id)}
                      disabled={isRestoring}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {isRestoring ? "Restoring..." : "Restore This Version"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select a version to preview</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VersionHistoryModal;
