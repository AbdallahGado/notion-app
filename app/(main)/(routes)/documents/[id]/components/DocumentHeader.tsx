"use client";

import React from "react";
import { 
  Menu, PanelLeftClose, PanelLeftOpen, FileText, Search, Download, FileCode, FileJson, 
  MoreHorizontal, Keyboard, Printer, Settings, Layout, Scale, Type, MoveHorizontal, MoveVertical 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
  DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuPortal
} from "@/components/ui/dropdown-menu";
import { Toolbar as PageToolbar } from "@/components/Toolbar";
import { cn } from "@/lib/utils";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Check } from "lucide-react";

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
  onFormatChange: (format: string | undefined) => void;
  format?: string;
  onBorderToggle: () => void;
  hasBorder?: boolean;
  font: string;
  margin: string;
  onFontChange: (font: string) => void;
  onMarginChange: (margin: string) => void;
  lineHeight: string;
  onLineHeightChange: (height: string) => void;
  className?: string;
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
  onFormatChange,
  onBorderToggle,
  format,
  hasBorder,
  font = "default",
  margin = "standard",
  onFontChange,
  onMarginChange,
  lineHeight = "normal",
  onLineHeightChange,
  className,
}: DocumentHeaderProps) => {

  return (
    <div className={cn("z-50 w-full bg-white/60 dark:bg-[#0b0c14]/60 backdrop-blur-xl border-b border-black/5 dark:border-white/5 transition-all duration-500 h-14 md:h-16 flex items-center shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04),0_10px_20px_-2px_rgba(0,0,0,0.02)]", className)}>
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

            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 w-8 p-0 transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center",
                showToc ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 shadow-inner" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              )}
              onClick={onToggleToc}
              title={showToc ? "Hide TOC" : "Show TOC"}
            >
              {showToc ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
            </Button>
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
              
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Layout className="w-4 h-4 mr-2 text-zinc-500" />    
                  <span>Page Setup</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="w-64 p-2 glass-panel animate-in slide-in-from-left-1 zoom-in-95 duration-200">
                   
                   {/* Format Section */}
                   <div className="px-2 py-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Format</div>
                   <div className="grid grid-cols-2 gap-1 mb-2">
                     {["A4", "A5", "Letter", "Full"].map((formatOption) => {
                       const value = formatOption === "Full" ? undefined : formatOption;
                       const label = formatOption === "Full" ? "Full Width" : formatOption;
                       const isActive = formatOption === "Full" ? !format : format === value;
                       
                       return (
                        <DropdownMenuItem 
                          key={formatOption}
                          onSelect={(e) => {
                            e.preventDefault();
                            onFormatChange(value);
                          }}
                           className={cn(
                             "relative flex flex-col items-center justify-center p-2 rounded-md cursor-pointer transition-all border border-transparent",
                             isActive 
                              ? "bg-indigo-50 dark:bg-indigo-500/20 border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300" 
                              : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                           )}
                        >
                         <div className={cn(
                           "w-6 h-8 border-2 mb-1.5 rounded-[2px] bg-white dark:bg-zinc-900 transition-all",
                           isActive ? "border-indigo-500 dark:border-indigo-400" : "border-zinc-300 dark:border-zinc-700 group-hover:border-zinc-400",
                           formatOption === "Full" && "w-10",
                           formatOption === "A5" && "h-6 w-5"
                         )} />
                         <span className="text-[10px] font-medium">{label}</span>
                         {isActive && <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />}
                        </DropdownMenuItem>
                       );
                     })}
                   </div>

                    <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-800 my-2" />

                    {/* Typography Section */}
                    <div className="px-2 py-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Typography</div>
                    <div className="flex flex-col gap-1">
                    {["Default", "Serif", "Mono"].map((f) => (
                      <DropdownMenuItem 
                        key={f}
                        onSelect={(e) => {
                          e.preventDefault();
                          onFontChange(f.toLowerCase());
                        }}
                        className={cn(
                          "rounded-md justify-between cursor-pointer py-2 px-3 focus:bg-zinc-100 dark:focus:bg-zinc-800",
                          font === f.toLowerCase() ? "bg-zinc-100 dark:bg-zinc-800/50" : ""
                        )}
                      >
                        <div className="flex items-center">
                          <span className={cn(
                            "w-6 flex justify-center text-zinc-500 dark:text-zinc-400 mr-2",
                            f === "Serif" && "font-serif",
                            f === "Mono" && "font-mono",
                          )}>Aa</span>
                          <span className={cn(
                            "text-sm",
                            f === "Serif" && "font-serif",
                            f === "Mono" && "font-mono",
                            "text-zinc-700 dark:text-zinc-200"
                          )}>{f}</span>
                        </div>
                        {font === f.toLowerCase() && <Check className="w-4 h-4 text-indigo-500" />}
                      </DropdownMenuItem>
                    ))}
                    </div>

                    <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-800 my-2" />

                    {/* Spacing & Margins Grid */}
                    <div className="grid grid-cols-2 gap-4 px-1">
                      <div>
                        <div className="px-2 py-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Margins</div>
                        <div className="flex flex-col gap-1">
                          {["Standard", "Wide", "Narrow"].map((m) => {
                            const icons = { Standard: "||", Wide: "| |", Narrow: "|||" };
                            return (
                              <DropdownMenuItem 
                                key={m}
                                onSelect={(e) => {
                                  e.preventDefault();
                                  onMarginChange(m.toLowerCase());
                                }}
                                className={cn(
                                  "rounded-md justify-between cursor-pointer py-1.5 px-2 text-xs",
                                  margin === m.toLowerCase() ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10" : "text-zinc-600 dark:text-zinc-400"
                                )}
                              >
                                <span>{m}</span>
                                {margin === m.toLowerCase() && <Check className="w-3 h-3" />}
                              </DropdownMenuItem>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <div className="px-2 py-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Spacing</div>
                        <div className="flex flex-col gap-1">
                          {[{l:"Tight",v:"tight"}, {l:"Normal",v:"normal"}, {l:"Loose",v:"loose"}].map(({l,v}) => (
                            <DropdownMenuItem 
                              key={v}
                              onSelect={(e) => {
                                e.preventDefault();
                                onLineHeightChange(v);
                              }}
                              className={cn(
                                "rounded-md justify-between cursor-pointer py-1.5 px-2 text-xs",
                                lineHeight === v ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10" : "text-zinc-600 dark:text-zinc-400"
                              )}
                            >
                              <span>{l}</span>
                              {lineHeight === v && <Check className="w-3 h-3" />}
                            </DropdownMenuItem>
                          ))}
                        </div>
                      </div>
                    </div>

                    <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-800 my-2" />
                    
                     <DropdownMenuItem 
                        onSelect={(e) => {
                          e.preventDefault();
                          onBorderToggle();
                        }}
                        className="rounded-md justify-between cursor-pointer py-2 px-3 focus:bg-zinc-100 dark:focus:bg-zinc-800"
                      >
                      <div className="flex items-center text-zinc-700 dark:text-zinc-300">
                        <Scale className="w-4 h-4 mr-2 text-zinc-500 dark:text-zinc-400" />
                        Show Page Border
                      </div>
                       <div className={cn(
                         "w-8 h-4 rounded-full transition-colors relative",
                         hasBorder ? "bg-indigo-500" : "bg-zinc-300 dark:bg-zinc-600"
                       )}>
                         <div className={cn(
                           "absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all shadow-sm",
                           hasBorder ? "left-4.5" : "left-0.5"
                         )} style={{ left: hasBorder ? "1.1rem" : "0.1rem" }} />
                       </div>
                      </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

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
