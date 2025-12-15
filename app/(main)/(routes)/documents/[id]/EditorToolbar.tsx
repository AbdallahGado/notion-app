"use client";

import React from "react";
import { 
  Printer, 
  Download, 
  MoreHorizontal, 
  FileText, 
  Search, 
  PanelLeftClose, 
  PanelLeftOpen, 
  Type, 
  Keyboard,
  FileJson,
  FileCode,
  Settings,
  Share2
} from "lucide-react";
import { toast } from "sonner";
// import html2pdf from "html2pdf.js"; // Removed static import to fix SSR error
import { Editor } from "@tiptap/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface EditorToolbarProps {
  editor: Editor | null;
  showToolbar: boolean;
  setShowToolbar: (show: boolean) => void;
  showToc: boolean;
  setShowToc: (show: boolean) => void;
  setShowMobileToc: (show: boolean) => void;
  tocItemsLength: number;
  title: string;
  setShowTemplatesModal: (show: boolean) => void;
  setShowSearchModal: (show: boolean) => void;
}

function EditorToolbar({
  editor,
  showToolbar,
  setShowToolbar,
  showToc,
  setShowToc,
  setShowMobileToc,
  tocItemsLength,
  title,
  setShowTemplatesModal,
  setShowSearchModal,
}: EditorToolbarProps) {
  
  const handleExportHTML = () => {
    const html = editor?.getHTML();
    if (html) {
      const blob = new Blob([html], { type: "text/html" });
      const url = globalThis.URL.createObjectURL(blob);
      const a = globalThis.document.createElement("a");
      a.href = url;
      a.download = `${title || "document"}.html`;
      a.click();
      globalThis.URL.revokeObjectURL(url);
    }
  };

  const handleExportMarkdown = () => {
    const html = editor?.getHTML();
    if (html) {
      // Simple HTML to Markdown conversion
      const markdown = html
        .replaceAll(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n\n")
        .replaceAll(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n")
        .replaceAll(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n\n")
        .replaceAll(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n")
        .replaceAll(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**")
        .replaceAll(/<em[^>]*>(.*?)<\/em>/gi, "*$1*")
        .replaceAll(/<code[^>]*>(.*?)<\/code>/gi, "`$1`")
        .replaceAll(
          /<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gi,
          "```\n$1\n```\n\n"
        )
        .replaceAll(/<ul[^>]*>(.*?)<\/ul>/gi, "$1\n")
        .replaceAll(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n")
        .replaceAll(/<br[^>]*>/gi, "\n")
        .replaceAll("&nbsp;", " ")
        .replaceAll("<", "<")
        .replaceAll(">", ">")
        .replaceAll("&amp;", "&")
        .replaceAll('"', '"')
        .replaceAll("&#39;", "'")
        .replaceAll("&quot;", '"');

      const blob = new Blob([markdown], {
        type: "text/markdown",
      });
      const url = globalThis.URL.createObjectURL(blob);
      const a = globalThis.document.createElement("a");
      a.href = url;
      a.download = `${title || "document"}.md`;
      a.click();
      globalThis.URL.revokeObjectURL(url);
      toast.success("Document exported as Markdown!");
    }
  };

  const handleExportPDF = async () => {
    const element = document.querySelector(".ProseMirror") as HTMLElement;
    if (element) {
      const opt = {
        margin: 1,
        filename: `${title || "document"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      };

      try {
        const html2pdf = (await import("html2pdf.js")).default;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await html2pdf().set(opt).from(element).save();
        toast.success("Document exported as PDF!");
      } catch (error) {
        console.error("PDF generation failed", error);
        toast.error("Failed to generate PDF");
      }
    }
  };

  return (
    <div className="flex items-center gap-1.5 p-1 rounded-lg border border-black/5 dark:border-white/5 bg-white/50 dark:bg-black/20 backdrop-blur-sm shadow-sm transition-all hover:shadow-md h-10">
      
      {/* View Toggles Group */}
      <div className="flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
          onClick={() => setShowToolbar(!showToolbar)}
          title={showToolbar ? "Hide Toolbar" : "Show Toolbar"}
        >
          <Type className="w-4 h-4" />
        </Button>

        {tocItemsLength > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors hidden md:inline-flex"
            onClick={() => setShowToc(!showToc)}
            title={showToc ? "Hide Table of Contents" : "Show Table of Contents"}
          >
            {showToc ? (
              <PanelLeftClose className="w-4 h-4" />
            ) : (
              <PanelLeftOpen className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>

      <Separator orientation="vertical" className="h-4 bg-slate-200 dark:bg-slate-700 mx-1" />

      {/* Main Tools Group */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2.5 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
          onClick={() => setShowSearchModal(true)}
          title="Search (Ctrl+F)"
        >
          <Search className="w-4 h-4 mr-2 text-slate-400" />
          <span className="hidden sm:inline">Search</span>
        </Button>

        {/* Export Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2.5 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Download className="w-4 h-4 mr-2 text-slate-400" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Export Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleExportHTML}>
                <FileCode className="w-4 h-4 mr-2 text-orange-500" />
                HTML
                <DropdownMenuShortcut>HTM</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportMarkdown}>
                <FileJson className="w-4 h-4 mr-2 text-blue-500" />
                Markdown
                <DropdownMenuShortcut>MD</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF}>
                <FileText className="w-4 h-4 mr-2 text-red-500" />
                PDF
                <DropdownMenuShortcut>PDF</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1" />

      {/* Settings & More */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64" forceMount>
          <DropdownMenuLabel>Document Settings</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => setShowTemplatesModal(true)}>
              <FileText className="w-4 h-4 mr-2" />
              Templates
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.dispatchEvent(new CustomEvent("openKeyboardShortcuts"))}>
              <Keyboard className="w-4 h-4 mr-2" />
              Keyboard Shortcuts
              <DropdownMenuShortcut>⌘/</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => globalThis.print()}>
              <Printer className="w-4 h-4 mr-2" />
              Print
              <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            {/* Add more settings here later if needed */}
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator />
          
          <div className="p-2">
            <p className="text-xs text-muted-foreground">
              Last edited {new Date().toLocaleDateString()}
            </p>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Mobile TOC Button (only visible on small screens) */}
      {tocItemsLength > 0 && (
         <Button
           variant="ghost"
           size="sm"
           className="h-8 w-8 p-0 text-slate-500 md:hidden ml-1"
           onClick={() => setShowMobileToc(true)}
         >
           <PanelLeftOpen className="w-4 h-4" />
         </Button>
      )}
    </div>
  );
}

export default React.memo(EditorToolbar);

