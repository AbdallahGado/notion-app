"use client";

import React, { useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  FileText,
  Archive,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  Printer,
} from "lucide-react";
import { toast } from "sonner";
import html2pdf from "html2pdf.js";

interface ExportOption {
  id: string;
  label: string;
  description: string;
  format: "markdown" | "html" | "pdf" | "docx" | "txt" | "json" | "print";
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  action: (content: string, title: string) => void;
}

interface ExportManagerProps {
  content: string;
  title: string;
  onExport?: (format: string) => void;
}

const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const exportOptions: ExportOption[] = [
  {
    id: "markdown",
    label: "Markdown",
    description: "Plain text with markdown formatting",
    format: "markdown",
    icon: FileText,
    action: (content, title) => {
      const md = `# ${title}\n\n${content}`;
      downloadFile(md, `${title}.md`, "text/markdown");
      toast.success("Exported as Markdown");
    },
  },
  {
    id: "html",
    label: "HTML",
    description: "Web-ready HTML format",
    format: "html",
    icon: FileText,
    action: (content, title) => {
      const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
    code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div>${content}</div>
</body>
</html>`;
      downloadFile(html, `${title}.html`, "text/html");
      toast.success("Exported as HTML");
    },
  },
  {
    id: "pdf",
    label: "PDF",
    description: "Portable document format",
    format: "pdf",
    icon: FileText,
    action: (content, title) => {
      const element = document.querySelector(".ProseMirror") as HTMLElement;
      if (element) {
        html2pdf()
          .set({
            margin: 1,
            filename: `${title || "document"}.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: {
              unit: "in",
              format: "letter",
              orientation: "portrait",
            },
          })
          .from(element)
          .save();
        toast.success("Document exported as PDF!");
      } else {
        toast.error("Failed to export PDF: Content not found");
      }
    },
  },
  {
    id: "print",
    label: "Print",
    description: "Print the document",
    format: "print",
    icon: Printer,
    action: () => {
      window.print();
      toast.success("Print dialog opened");
    },
  },
  {
    id: "txt",
    label: "Plain Text",
    description: "Unformatted text file",
    format: "txt",
    icon: FileText,
    action: (content, title) => {
      downloadFile(content, `${title}.txt`, "text/plain");
      toast.success("Exported as Plain Text");
    },
  },
  {
    id: "json",
    label: "JSON",
    description: "Structured data format",
    format: "json",
    icon: Archive,
    action: (content, title) => {
      const json = JSON.stringify(
        {
          title,
          content,
          exportedAt: new Date().toISOString(),
          metadata: {
            characterCount: content.length,
            wordCount: content.split(/\s+/).length,
          },
        },
        null,
        2
      );
      downloadFile(json, `${title}.json`, "application/json");
      toast.success("Exported as JSON");
    },
  },
];

const OptionCard = memo(function OptionCard({
  option,
  onSelect,
}: {
  option: ExportOption;
  onSelect: () => void;
}) {
  const Icon = option.icon;
  return (
    <motion.button
      onClick={onSelect}
      className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors text-left"
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/40">
        <Icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
      </div>
      <div className="flex-1">
        <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
          {option.label}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          {option.description}
        </div>
      </div>
    </motion.button>
  );
});

OptionCard.displayName = "OptionCard";

export const ExportManager = memo(function ExportManager({
  content,
  title,
  onExport,
}: ExportManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);

  const handleExport = async (option: ExportOption) => {
    setExportingFormat(option.format);
    try {
      option.action(content, title || "Document");
      onExport?.(option.format);
    } catch (error) {
      toast.error("Export failed");
      console.error(error);
    } finally {
      setExportingFormat(null);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Download className="h-4 w-4" />
        <span className="text-sm font-medium">Export</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-10"
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full right-0 mt-2 w-80 z-20 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4"
            >
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Export As
              </h3>

              <div className="space-y-2">
                {exportOptions.map((option) => (
                  <motion.div
                    key={`export-option-${option.id}-${option.label}`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <OptionCard
                      option={option}
                      onSelect={() => handleExport(option)}
                    />
                    {exportingFormat === option.format && (
                      <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "100%" }}
                        className="mt-1 text-xs text-green-600 dark:text-green-400 flex items-center gap-1"
                      >
                        <CheckCircle className="h-3 w-3" />
                        Exporting...
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Info */}
              <motion.div
                className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-800 dark:text-blue-300">
                    <p className="font-medium">Pro Tip:</p>
                    <p>
                      DOCX export coming soon. Try Markdown for best
                      compatibility.
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
});

ExportManager.displayName = "ExportManager";
