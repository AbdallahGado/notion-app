import React, { useEffect, useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  FolderPlus,
  ArrowUp,
  ArrowDown,
  Settings,
  Save,
  Type,
  Link,
  Bold,
  Italic,
  Code,
  Quote,
} from "lucide-react";

// Types
export interface KeyboardShortcutsProps {
  readonly onClose?: () => void;
  readonly defaultIsOpen?: boolean;
  readonly className?: string;
}

interface ShortcutCategory {
  name: string;
  shortcuts: Shortcut[];
}

interface Shortcut {
  label: string;
  keys: string[];
  description?: string;
  icon?: React.ReactNode;
  action?: string;
}

// Constants
const ANIMATION_DURATION = 0.2;

const SHORTCUT_CATEGORIES: ShortcutCategory[] = [
  {
    name: "General",
    shortcuts: [
      {
        label: "Save document",
        keys: ["Ctrl", "S"],
        description: "Save current document",
        icon: <Save className="w-4 h-4" />,
        action: "save",
      },
      {
        label: "Search documents",
        keys: ["Ctrl", "F"],
        description: "Search in current document",
        icon: <Search className="w-4 h-4" />,
        action: "open-search",
      },
      {
        label: "Show keyboard shortcuts",
        keys: ["Ctrl", "/"],
        description: "Open this help modal",
        icon: <Settings className="w-4 h-4" />,
        action: "toggle-shortcuts",
      },
    ],
  },
  {
    name: "Document Management",
    shortcuts: [
      {
        label: "New document",
        keys: ["Ctrl", "N"],
        description: "Create a new document",
        icon: <Plus className="w-4 h-4" />,
        action: "create-document",
      },
      {
        label: "New folder",
        keys: ["Ctrl", "Shift", "F"],
        description: "Create a new folder",
        icon: <FolderPlus className="w-4 h-4" />,
        action: "create-folder",
      },
      {
        label: "Move up",
        keys: ["Alt", "↑"],
        description: "Move document up",
        icon: <ArrowUp className="w-4 h-4" />,
      },
      {
        label: "Move down",
        keys: ["Alt", "↓"],
        description: "Move document down",
        icon: <ArrowDown className="w-4 h-4" />,
      },
    ],
  },
  {
    name: "Formatting",
    shortcuts: [
      {
        label: "Headings",
        keys: ["Ctrl", "1/2/3"],
        description: "Convert to H1/H2/H3",
        icon: <Type className="w-4 h-4" />,
        action: "format-heading",
      },
      {
        label: "Bold",
        keys: ["Ctrl", "B"],
        description: "Make text bold",
        icon: <Bold className="w-4 h-4" />,
        action: "format-bold",
      },
      {
        label: "Italic",
        keys: ["Ctrl", "I"],
        description: "Make text italic",
        icon: <Italic className="w-4 h-4" />,
      },
      {
        label: "Code block",
        keys: ["Ctrl", "`"],
        description: "Insert code block",
        icon: <Code className="w-4 h-4" />,
      },
      {
        label: "Blockquote",
        keys: ["Ctrl", "Q"],
        description: "Insert blockquote",
        icon: <Quote className="w-4 h-4" />,
      },
      {
        label: "Insert link",
        keys: ["Ctrl", "L"],
        description: "Create or edit link",
        icon: <Link className="w-4 h-4" />,
      },
    ],
  },
];

export default function KeyboardShortcuts({
  onClose,
  defaultIsOpen = false,
  className,
}: KeyboardShortcutsProps) {
  const [showOverlay, setShowOverlay] = useState(defaultIsOpen);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [focusedShortcutIndex, setFocusedShortcutIndex] = useState(-1);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const filteredCategories = SHORTCUT_CATEGORIES.map((category) => ({
    ...category,
    shortcuts: category.shortcuts.filter(
      (shortcut) =>
        searchQuery === "" ||
        shortcut.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shortcut.description
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        shortcut.keys
          .join(" ")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
    ),
  })).filter((category) => category.shortcuts.length > 0);

  const getTotalShortcutsCount = useCallback(() => {
    return SHORTCUT_CATEGORIES.reduce(
      (total, category) => total + category.shortcuts.length,
      0
    );
  }, []);



  const handleClose = useCallback(() => {
    setShowOverlay(false);
    onClose?.();
  }, [onClose]);

  const handleGlobalShortcut = useCallback((e: KeyboardEvent): boolean => {
    if (e.key === "/" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      setShowOverlay((prev) => !prev);
      setSearchQuery("");
      return true;
    }
    return false;
  }, []);

  const handleModalKeyboard = useCallback(
    (e: KeyboardEvent): boolean => {
      if (!showOverlay) return false;

      if (e.key === "Escape") {
        handleClose();
        return true;
      }

      if (e.key === "Tab") {
        e.preventDefault();
        if (e.shiftKey) {
          setFocusedShortcutIndex((prev) =>
            prev <= 0 ? getTotalShortcutsCount() - 1 : prev - 1
          );
        } else {
          setFocusedShortcutIndex((prev) =>
            prev >= getTotalShortcutsCount() - 1 ? 0 : prev + 1
          );
        }
        return true;
      }

      if (e.target === searchInputRef.current) {
        return true;
      }

      return false;
    },
    [showOverlay, handleClose, getTotalShortcutsCount]
  );



  const handleKeyDown = useCallback(
    (e: KeyboardEvent): void => {
      if (handleGlobalShortcut(e)) return;
      if (handleModalKeyboard(e)) return;
      // handleKeyComboFeedback(e); // Disabled per user request (unwanted toast on keypress)
    },
    [handleGlobalShortcut, handleModalKeyboard]
  );

  // Global keyboard listener
  useEffect(() => {
    globalThis.addEventListener("keydown", handleKeyDown);
    return () => globalThis.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Focus trap
  useEffect(() => {
    if (showOverlay && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showOverlay]);

  // Custom event listener for external trigger
  useEffect(() => {
    const handleCustomEvent = () => setShowOverlay(true);
    globalThis.addEventListener("openKeyboardShortcuts", handleCustomEvent);
    return () =>
      globalThis.removeEventListener(
        "openKeyboardShortcuts",
        handleCustomEvent
      );
  }, []);

  return (
    <>
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: ANIMATION_DURATION }}
            className={cn("fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 overflow-y-auto", className)}
            onClick={handleClose}
          >
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="glass-panel relative w-full max-w-2xl rounded-2xl p-0 overflow-hidden shadow-2xl border border-white/20 dark:border-white/10"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              aria-modal="true"
              role="dialog"
              aria-labelledby="shortcuts-title"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-black/5 dark:border-white/5 bg-white/50 dark:bg-[#0b0c14]/50 backdrop-blur-md">
                <div className="flex items-center justify-between mb-4">
                  <h2
                    id="shortcuts-title"
                    className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-800 to-slate-900 dark:from-white dark:via-indigo-200 dark:to-white"
                  >
                    Keyboard Shortcuts
                  </h2>
                   <div className="text-[10px] font-medium px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      {getTotalShortcutsCount()} commands
                   </div>
                </div>

                {/* Search bar */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <Search className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search shortcuts..."
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSearchQuery(e.target.value)
                    }
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-100/50 dark:bg-black/20 border border-transparent focus:border-indigo-500/30 rounded-xl leading-5 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:text-sm transition-all duration-300"
                    role="searchbox"
                    aria-label="Search shortcuts"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[10px] font-medium text-slate-500 dark:text-slate-400 font-sans">
                      <span className="text-xs">Esc</span>
                    </kbd>
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="px-6 py-6 max-h-[60vh] overflow-y-auto scrollbar-hide space-y-8 bg-white/40 dark:bg-[#0b0c14]/40">
                {filteredCategories.map((category, categoryIndex) => (
                  <motion.div
                    key={category.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: categoryIndex * 0.05 }}
                  >
                    <div
                      className="flex items-center justify-between mb-3 cursor-pointer group/category"
                      onClick={() =>
                        setActiveCategory(
                          activeCategory === category.name
                            ? null
                            : category.name
                        )
                      }
                      role="button"
                      aria-expanded={activeCategory === category.name}
                      tabIndex={0}
                    >
                      <div className="flex items-center gap-2">
                         <div className="h-4 w-1 rounded-full bg-indigo-500/50 group-hover/category:bg-indigo-500 transition-colors" />
                         <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 group-hover/category:text-indigo-600 dark:group-hover/category:text-indigo-400 transition-colors">
                           {category.name}
                         </h3>
                      </div>
                      <motion.div
                        animate={{
                          rotate: activeCategory === category.name ? 180 : 0,
                        }}
                        className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-slate-400 transition-colors"
                        aria-hidden="true"
                      >
                         <ArrowDown className="w-3.5 h-3.5" />
                      </motion.div>
                    </div>

                    <AnimatePresence>
                      {(activeCategory === category.name ||
                        activeCategory === null) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-hidden"
                        >
                          {category.shortcuts.map((shortcut, shortcutIndex) => (
                            <motion.div
                              key={shortcut.label}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: shortcutIndex * 0.03 }}
                              className={`group/shortcut relative flex items-center justify-between p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                                focusedShortcutIndex ===
                                getTotalShortcutsCount() - shortcutIndex
                                  ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 shadow-md ring-1 ring-indigo-500/20"
                                  : "bg-white/60 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-700/50 hover:border-indigo-300/50 dark:hover:border-indigo-500/30 hover:shadow-lg hover:-translate-y-0.5"
                              }`}
                              tabIndex={0}
                              role="listitem"
                              onClick={() => {
                                if (shortcut.action) {
                                  globalThis.dispatchEvent(
                                    new CustomEvent("shortcut", {
                                      detail: { action: shortcut.action },
                                    })
                                  );
                                  handleClose();
                                }
                              }}
                              onKeyDown={(e: React.KeyboardEvent) => {
                                if ((e.key === "Enter" || e.key === " ") && shortcut.action) {
                                  globalThis.dispatchEvent(
                                    new CustomEvent("shortcut", {
                                      detail: { action: shortcut.action },
                                    })
                                  );
                                  handleClose();
                                }
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg transition-colors ${
                                   focusedShortcutIndex === getTotalShortcutsCount() - shortcutIndex 
                                   ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400" 
                                   : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover/shortcut:bg-indigo-50 dark:group-hover/shortcut:bg-indigo-500/10 group-hover/shortcut:text-indigo-500"
                                }`}>
                                  {React.isValidElement(shortcut.icon) && React.cloneElement(shortcut.icon as React.ReactElement, { className: "w-4 h-4" })}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover/shortcut:text-indigo-600 dark:group-hover/shortcut:text-indigo-400 transition-colors">
                                    {shortcut.label}
                                  </span>
                                  {shortcut.description && (
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1">
                                      {shortcut.description}
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <div
                                className="flex items-center gap-1"
                                role="group"
                                aria-label={`Keys for ${shortcut.label}`}
                              >
                                {shortcut.keys.map((key) => (
                                  <kbd
                                    key={key}
                                    className="min-w-[20px] h-6 px-1.5 flex items-center justify-center text-[10px] font-bold font-sans rounded bg-white dark:bg-black border border-b-2 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 shadow-sm"
                                  >
                                    {key}
                                  </kbd>
                                ))}
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}

                {filteredCategories.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                    role="status"
                  >
                    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-3">
                       <Search className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                      No shortcuts found for &quot;{searchQuery}&quot;
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Try searching for &quot;bold&quot; or &quot;heading&quot;</p>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-3 bg-slate-50 dark:bg-[#0b0c14]/80 border-t border-black/5 dark:border-white/5 flex items-center justify-center backdrop-blur-sm">
                  <p className="text-[10px] text-slate-400 flex items-center gap-1">
                    <span className="opacity-70">Pro tip: Press</span>
                    <kbd className="inline-flex items-center justify-center px-1 h-4 text-[9px] font-bold rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">Ctrl</kbd>
                    <span>+</span>
                    <kbd className="inline-flex items-center justify-center px-1 h-4 text-[9px] font-bold rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">/</kbd>
                    <span className="opacity-70">to open this anytime</span>
                  </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


    </>
  );
}

// Programmatic helper to open the shortcuts modal from anywhere in the app
export function showKeyboardShortcuts() {
  globalThis.dispatchEvent(new Event("openKeyboardShortcuts"));
}
