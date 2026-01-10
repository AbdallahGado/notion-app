import React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, X } from "lucide-react";

interface TocItem {
  readonly id: string;
  readonly text: string;
  readonly level: number;
  readonly pos: number;
}

interface TableOfContentsProps {
  readonly tocItems: TocItem[];
  readonly showToc: boolean;
  readonly expandedSections: Set<string>;
  readonly showMobileToc: boolean;
  readonly navigateToHeading: (pos: number) => void;
  readonly toggleSectionExpansion: (headingId: string) => void;
  readonly toggleAllExpansion: () => void;
  readonly setShowToc: (show: boolean) => void;
  readonly setShowMobileToc: (show: boolean) => void;
  readonly className?: string;
}

function TableOfContents({
  tocItems,
  showToc,
  expandedSections,
  showMobileToc,
  navigateToHeading,
  toggleSectionExpansion,
  toggleAllExpansion,
  setShowToc,
  setShowMobileToc,
  className,
}: TableOfContentsProps) {
  return (
    <>
      {/* Sidebar TOC - Desktop */}
      {showToc && (
        <motion.div
          initial={{ opacity: 0, x: -30, filter: "blur(10px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className={cn(
            "w-64 border-r rounded-r-3xl h-screen sticky top-0 z-10 hidden xl:flex flex-col overflow-hidden bg-white/30 dark:bg-[#0b0c14]/30 backdrop-blur-2xl shadow-[20px_0_50px_rgba(0,0,0,0.02)] border-black/[0.03] dark:border-white/[0.03]",
            className
          )}
        >
          <div className="flex items-center justify-between p-5 pb-2">
            <h3 className="text-sm font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              Contents
            </h3>
            <div className="flex items-center gap-1">
              <button
                onClick={toggleAllExpansion}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                title={expandedSections.size === tocItems.length ? "Collapse all" : "Expand all"}
              >
                {expandedSections.size === tocItems.length ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => setShowToc(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title="Close sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 pt-2 custom-scrollbar">
            {tocItems.length > 0 ? (
              <ul className="space-y-1">
                {tocItems.map((item, index) => {
                  const hasChildren = tocItems.some(
                    (nextItem, nextIndex) =>
                      nextIndex > index && nextItem.level > item.level
                  );
                  const isExpanded = expandedSections.has(item.id);

                  if (index > 0) {
                    const prevItem = tocItems[index - 1];
                    if (prevItem.level < item.level && !expandedSections.has(prevItem.id)) {
                      return null;
                    }
                  }

                  return (
                    <li
                      key={item.id}
                      style={{ paddingLeft: `${(item.level - 1) * 16}px` }}
                      className="relative group"
                    >
                      <div className="flex items-center gap-1.5">
                        {hasChildren && (
                          <button
                            onClick={() => toggleSectionExpansion(item.id)}
                            className="p-0.5 mt-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                          >
                            <ChevronDown
                              className={`w-3 h-3 transition-transform duration-200 ${
                                isExpanded ? "" : "-rotate-90"
                              }`}
                            />
                          </button>
                        )}
                        
                        <button
                          onClick={() => navigateToHeading(item.pos)}
                          className={`flex-1 text-left text-[13px] py-1.5 px-3 rounded-lg transition-all duration-200 truncate text-zinc-500 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200 ${!hasChildren ? "ml-[18px]" : ""}`}
                        >
                           {item.text || <span className="opacity-40 italic">Untitled</span>}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="text-xs text-slate-400 p-4 italic text-center">
                No headings found
              </div>
            )}
          </nav>
        </motion.div>
      )}

      {/* Mobile Drawer */}
      <AnimatePresence>
        {showMobileToc && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={cn("fixed inset-0 bg-black/40 backdrop-blur-sm z-50 xl:hidden", className)}
              onClick={() => setShowMobileToc(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={cn("fixed top-2 right-2 bottom-2 w-80 bg-white/95 dark:bg-[#1F1F1F]/95 backdrop-blur-xl border border-white/20 shadow-2xl z-[100] xl:hidden flex flex-col overflow-hidden rounded-2xl", className)}
            >
               <div className="flex items-center justify-between p-4 border-b border-white/10">
                 <h3 className="font-semibold text-slate-700 dark:text-slate-200">Table of Contents</h3>
                 <button 
                   onClick={() => setShowMobileToc(false)}
                   className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                 >
                   <X className="w-5 h-5 text-slate-500" />
                 </button>
               </div>
               
               <nav className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                 {tocItems.length > 0 ? (
                   <ul className="space-y-2">
                     {tocItems.map((item) => (
                        <li 
                          key={item.id} 
                          style={{ paddingLeft: `${(item.level - 1) * 16}px` }}
                        >
                           <button
                             onClick={() => {
                               navigateToHeading(item.pos);
                               setShowMobileToc(false);
                             }}
                             className="w-full text-left text-sm p-3 rounded-xl transition-colors text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                           >
                             {item.text || "Untitled"}
                           </button>
                        </li>
                     ))}
                   </ul>
                 ) : (
                   <div className="text-sm text-slate-400 p-8 italic text-center">
                     No headings found in this document. Add some headings to see them here!
                   </div>
                 )}
               </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default React.memo(TableOfContents);
