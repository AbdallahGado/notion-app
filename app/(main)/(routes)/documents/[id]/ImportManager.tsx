"use client";

import React, { useState, useRef, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileUp, AlertCircle, Loader, X, File } from "lucide-react";
import { toast } from "sonner";

interface ImportOption {
  id: string;
  accept: string;
  label: string;
  description: string;
}

interface ImportManagerProps {
  onImport?: (content: string, format: string) => void;
  maxFileSize?: number; // in bytes
}

const importOptions: ImportOption[] = [
  {
    id: "markdown",
    accept: ".md,.markdown,text/markdown",
    label: "Markdown",
    description: "Import .md files",
  },
  {
    id: "text",
    accept: ".txt,text/plain",
    label: "Plain Text",
    description: "Import .txt files",
  },
  {
    id: "html",
    accept: ".html,.htm,text/html",
    label: "HTML",
    description: "Import .html files",
  },
  {
    id: "json",
    accept: ".json,application/json",
    label: "JSON",
    description: "Import .json files",
  },
];

const parseFileContent = (
  content: string,
  fileName: string
): { text: string; format: string } => {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";

  switch (ext) {
    case "json":
      try {
        const parsed = JSON.parse(content);
        return {
          text: parsed.content || JSON.stringify(parsed, null, 2),
          format: "json",
        };
      } catch {
        throw new Error("Invalid JSON file");
      }

    case "html":
    case "htm": {
      // Simple HTML to text conversion (strip tags)
      const parser = new DOMParser();
      try {
        const doc = parser.parseFromString(content, "text/html");
        return {
          text: doc.body.textContent || content,
          format: "html",
        };
      } catch {
        return { text: content, format: "html" };
      }
    }

    case "md":
    case "markdown":
      return { text: content, format: "markdown" };

    case "txt":
    default:
      return { text: content, format: "text" };
  }
};

export const ImportManager = memo(function ImportManager({
  onImport,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
}: ImportManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (file.size > maxFileSize) {
      toast.error(`File size exceeds ${maxFileSize / 1024 / 1024}MB limit`);
      return;
    }

    setIsLoading(true);
    try {
      const content = await file.text();
      const { text, format } = parseFileContent(content, file.name);

      onImport?.(text, format);
      toast.success(`Imported ${file.name}`);
      setIsOpen(false);
      setSelectedOption(null);
    } catch (error) {
      toast.error(
        `Failed to import: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        <span className="text-sm font-medium">Import</span>
      </motion.button>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={(e) =>
          e.target.files?.[0] && handleFileSelect(e.target.files[0])
        }
        className="hidden"
        accept={importOptions.map((opt) => opt.accept).join(",")}
      />

      {/* Import Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isLoading && setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/20"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-md w-full mx-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Import Document
                </h2>
                <motion.button
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                  whileHover={{ rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </motion.button>
              </div>

              {/* Drag & Drop Zone */}
              <motion.div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onDragOver={(e: React.DragEvent) => e.preventDefault()}
                animate={isDragging ? { scale: 0.98 } : { scale: 1 }}
                className={`mb-4 p-6 rounded-lg border-2 border-dashed transition-colors cursor-pointer ${
                  isDragging
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10"
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center justify-center text-center">
                  <motion.div
                    animate={{ y: isDragging ? -5 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FileUp
                      className={`h-8 w-8 mx-auto mb-2 ${
                        isDragging
                          ? "text-emerald-600"
                          : "text-gray-400 dark:text-gray-500"
                      }`}
                    />
                  </motion.div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {isDragging ? "Drop file here" : "Drag file or click"}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Max {(maxFileSize / 1024 / 1024).toFixed(0)}MB
                  </p>
                </div>
              </motion.div>

              {/* Format Options */}
              <div className="space-y-2 mb-4">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Supported Formats
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {importOptions.map((option) => (
                    <motion.button
                      key={`import-option-${option.id}-${option.label}`}
                      onClick={() => {
                        setSelectedOption(option.id);
                        fileInputRef.current?.click();
                      }}
                      disabled={isLoading}
                      className={`p-2 rounded-lg border text-sm transition-colors ${
                        selectedOption === option.id
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-emerald-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <File className="h-4 w-4 mx-auto mb-1 text-emerald-600 dark:text-emerald-400" />
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {option.label}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Info Message */}
              <motion.div
                className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-800 dark:text-blue-300">
                    Imported content will replace current document. Consider
                    saving first.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
});

ImportManager.displayName = "ImportManager";
