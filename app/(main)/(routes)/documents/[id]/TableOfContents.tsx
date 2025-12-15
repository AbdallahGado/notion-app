import React from "react";
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
  readonly activeTocItem: string | null;
  readonly expandedSections: Set<string>;
  readonly showMobileToc: boolean;
  readonly navigateToHeading: (pos: number) => void;
  readonly toggleSectionExpansion: (headingId: string) => void;
  readonly toggleAllExpansion: () => void;
  readonly setShowToc: (show: boolean) => void;
  readonly setShowMobileToc: (show: boolean) => void;
}

function TableOfContents({
  tocItems,
  showToc,
  activeTocItem,
  expandedSections,
  showMobileToc,
  navigateToHeading,
  toggleSectionExpansion,
  toggleAllExpansion,
  setShowToc,
  setShowMobileToc,
}: TableOfContentsProps) {
  return (
    <>
      {/* Sidebar TOC - Desktop */}
      {showToc && tocItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-72 glass-panel border-y-0 border-l-0 border-r rounded-r-2xl h-screen sticky top-0 z-10 hidden md:flex flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 pb-2">
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
            <ul className="space-y-1">
              {tocItems.map((item, index) => {
                const isActive = activeTocItem === item.id;
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
                    style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
                    className="relative group"
                  >
                    <div className="flex items-center gap-1">
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
                        className={`flex-1 text-left text-sm py-1.5 px-3 rounded-lg transition-all duration-200 truncate ${
                          isActive
                            ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 font-medium shadow-sm"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                        } ${!hasChildren ? "ml-4" : ""}`}
                      >
                         {item.text || <span className="opacity-50 italic">Untitled</span>}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
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
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 md:hidden"
              onClick={() => setShowMobileToc(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-2 right-2 bottom-2 w-80 bg-white/95 dark:bg-[#1F1F1F]/95 backdrop-blur-xl border border-white/20 shadow-2xl z-[100] md:hidden flex flex-col overflow-hidden rounded-2xl"
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
                           className={`w-full text-left text-sm p-3 rounded-xl transition-colors ${
                              activeTocItem === item.id 
                                ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                           }`}
                         >
                           {item.text || "Untitled"}
                         </button>
                      </li>
                   ))}
                 </ul>
               </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default React.memo(TableOfContents);

