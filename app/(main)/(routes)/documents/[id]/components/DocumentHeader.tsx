"use client";

import React from "react";
import { 
  Menu, PanelLeftClose, PanelLeftOpen, FileText, Search, Download, FileCode, FileJson, 
  MoreHorizontal, Keyboard, Printer 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Toolbar as PageToolbar } from "@/components/Toolbar";
import { cn } from "@/lib/utils";
import { Doc } from "@/convex/_generated/dataModel";

interface DocumentHeaderProps {
  doc: Doc<"documents">;
  isLargeScreen: boolean;
  isCollapsed: boolean;
  onResetWidth: () => void;
  showToc: boolean;
  onToggleToc: () => void;
  onOpenMobileSidebar: () => void;
  onShowSearch: () => void;
  onShowTemplates: () => void;
  onExportHTML: () => void;
  onExportMarkdown: () => void;
  onExportPDF: () => void;
  tocItemsCount: number;
}

export const DocumentHeader = ({
  doc,
  isLargeScreen,
  isCollapsed,
  onResetWidth,
  showToc,
  onToggleToc,
  onOpenMobileSidebar,
  onShowSearch,
  onShowTemplates,
  onExportHTML,
  onExportMarkdown,
  onExportPDF,
  tocItemsCount,
}: DocumentHeaderProps) => {
  return (
    <div className="z-50 w-full bg-white/60 dark:bg-[#0b0c14]/60 backdrop-blur-xl border-b border-black/5 dark:border-white/5 transition-all duration-500 h-14 md:h-16 flex items-center shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04),0_10px_20px_-2px_rgba(0,0,0,0.02)]">
      <div className="w-full px-4 md:px-6 flex items-center justify-between gap-4">
        
        {/* Left Section */}
        <div className="flex items-center gap-3 min-w-0 max-w-[80%] sm:max-w-[45%]">
          <div className="flex items-center gap-1">
            {isLargeScreen && isCollapsed && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-all active:scale-95 mr-2"
                onClick={onResetWidth}
              >
                <Menu className="w-5 h-5" />
              </Button>
            )}

            {!isLargeScreen && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-all active:scale-95"
                onClick={onOpenMobileSidebar}
              >
                <Menu className="w-5 h-5" />
              </Button>
            )}

            {tocItemsCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 w-8 p-0 transition-all duration-300 hover:scale-110 active:scale-95 hidden md:inline-flex",
                  showToc ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 shadow-inner" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                )}
                onClick={onToggleToc}
                title={showToc ? "Hide TOC" : "Show TOC"}
              >
                {showToc ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3 min-w-0 group/breadcrumb">
            <div className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover/breadcrumb:text-indigo-500 group-hover/breadcrumb:bg-indigo-500/10 transition-all duration-300 flex items-center border border-transparent group-hover/breadcrumb:border-indigo-500/20 shadow-sm">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center flex-1 min-w-0 transition-transform duration-300 group-hover/breadcrumb:translate-x-0.5">
              <PageToolbar initialData={doc} isHeader />
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1 p-1 rounded-xl border border-black/5 dark:border-white/5 bg-white/40 dark:bg-[#0b0c14]/40 backdrop-blur-md shadow-sm transition-all duration-300 hover:shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:bg-white/60 dark:hover:bg-[#0b0c14]/60 group/actions-hub">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 hover:scale-105 active:scale-95 group/search"
            onClick={onShowSearch}
            title="Search (Ctrl+F)"
          >
            <Search className="w-3.5 h-3.5 sm:mr-1.5 text-slate-400 group-hover/search:text-indigo-500 transition-colors" />
            <span className="hidden xl:inline text-xs">Search</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 hover:scale-105 active:scale-95 group/export"
              >
                <Download className="w-3.5 h-3.5 sm:mr-1.5 text-slate-400 group-hover/export:text-indigo-500 transition-colors" />
                <span className="hidden xl:inline text-xs">Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 p-1 glass-panel">
              <DropdownMenuItem onClick={onExportHTML} className="rounded-lg">
                <FileCode className="w-4 h-4 mr-2 text-orange-500" /> HTML
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExportMarkdown} className="rounded-lg">
                <FileJson className="w-4 h-4 mr-2 text-blue-500" /> Markdown
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExportPDF} className="rounded-lg">
                <FileText className="w-4 h-4 mr-2 text-red-500" /> PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="h-4 bg-black/10 dark:bg-white/10 hidden sm:block mx-0.5" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-all duration-300 hover:scale-110 active:scale-95"
              >
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-1 glass-panel">
              <DropdownMenuItem onClick={onShowTemplates} className="rounded-lg">
                <FileText className="w-4 h-4 mr-2" /> Templates
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.dispatchEvent(new CustomEvent("openKeyboardShortcuts"))} className="rounded-lg">
                <Keyboard className="w-4 h-4 mr-2" /> Shortcuts
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-black/5 dark:bg-white/5" />
              <DropdownMenuItem onClick={() => globalThis.print()} className="rounded-lg">
                <Printer className="w-4 h-4 mr-2" /> Print
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
