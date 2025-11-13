import React, { useEffect, useState, useCallback, useRef } from "react";
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
const FEEDBACK_DURATION = 1500;

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
}: KeyboardShortcutsProps) {
  const [showOverlay, setShowOverlay] = useState(defaultIsOpen);
  const [lastKeyCombo, setLastKeyCombo] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
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

  const getNormalizedKeyName = useCallback((key: string): string => {
    const keyMap: { [key: string]: string } = {
      " ": "Space",
      ArrowUp: "↑",
      ArrowDown: "↓",
      ArrowLeft: "←",
      ArrowRight: "→",
      Enter: "↵",
      Escape: "Esc",
    };
    return keyMap[key] || key;
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

  const handleKeyComboFeedback = useCallback(
    (e: KeyboardEvent): void => {
      if (showOverlay) return;

      const key = getNormalizedKeyName(e.key);
      const combo: string[] = [];
      if (e.ctrlKey) combo.push("Ctrl");
      if (e.altKey) combo.push("Alt");
      if (e.shiftKey) combo.push("Shift");
      if (key !== "Control" && key !== "Alt" && key !== "Shift") {
        combo.push(key);
      }

      if (combo.length > 0) {
        setLastKeyCombo(combo);
        setShowFeedback(true);
        setTimeout(() => setShowFeedback(false), FEEDBACK_DURATION);
      }
    },
    [showOverlay, getNormalizedKeyName]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent): void => {
      if (handleGlobalShortcut(e)) return;
      if (handleModalKeyboard(e)) return;
      handleKeyComboFeedback(e);
    },
    [handleGlobalShortcut, handleModalKeyboard, handleKeyComboFeedback]
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={handleClose}
          >
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ duration: ANIMATION_DURATION }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full space-y-6 shadow-2xl relative"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              aria-modal="true"
              role="dialog"
              aria-labelledby="shortcuts-title"
            >
              <h2
                id="shortcuts-title"
                className="text-xl font-semibold text-gray-900 dark:text-white"
              >
                Keyboard shortcuts
              </h2>

              {/* Search bar */}
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search shortcuts..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchQuery(e.target.value)
                  }
                  className="w-full px-4 py-2 pr-10 bg-gray-100 dark:bg-gray-700/50 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  role="searchbox"
                  aria-label="Search shortcuts"
                />
                <Search
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  aria-hidden="true"
                />
              </div>

              {/* Categories */}
              <div className="space-y-6">
                {filteredCategories.map((category, categoryIndex) => (
                  <motion.div
                    key={category.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: categoryIndex * 0.1 }}
                  >
                    <div
                      className="flex items-center justify-between mb-3 cursor-pointer"
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
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {category.name}
                      </h3>
                      <motion.span
                        animate={{
                          rotate: activeCategory === category.name ? 180 : 0,
                        }}
                        className="text-gray-400"
                        aria-hidden="true"
                      >
                        ▼
                      </motion.span>
                    </div>

                    <AnimatePresence>
                      {(activeCategory === category.name ||
                        activeCategory === null) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="space-y-2 overflow-hidden"
                        >
                          {category.shortcuts.map((shortcut, shortcutIndex) => (
                            <motion.div
                              key={shortcut.label}
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: shortcutIndex * 0.05 }}
                              className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                                focusedShortcutIndex ===
                                getTotalShortcutsCount() - shortcutIndex
                                  ? "bg-indigo-50 dark:bg-indigo-900/30"
                                  : "hover:bg-gray-50 dark:hover:bg-gray-700/30"
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
                                }
                              }}
                              onKeyDown={(e: React.KeyboardEvent) => {
                                if ((e.key === "Enter" || e.key === " ") && shortcut.action) {
                                  globalThis.dispatchEvent(
                                    new CustomEvent("shortcut", {
                                      detail: { action: shortcut.action },
                                    })
                                  );
                                }
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <span
                                  className="text-gray-400 dark:text-gray-500"
                                  aria-hidden="true"
                                >
                                  {shortcut.icon}
                                </span>
                                <div>
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {shortcut.label}
                                  </span>
                                  {shortcut.description && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {shortcut.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div
                                className="flex gap-1"
                                role="group"
                                aria-label={`Keys for ${shortcut.label}`}
                              >
                                {shortcut.keys.map((key) => (
                                  <kbd
                                    key={key}
                                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-medium text-gray-800 dark:text-gray-200 min-w-[24px] text-center shadow-sm"
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
                    className="text-center py-8"
                    role="status"
                  >
                    <p className="text-gray-500 dark:text-gray-400">
                      No shortcuts found for &quot;{searchQuery}&quot;
                    </p>
                  </motion.div>
                )}
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Press{" "}
                <kbd className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                  Esc
                </kbd>{" "}
                to close or{" "}
                <kbd className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                  Ctrl
                </kbd>{" "}
                +
                <kbd className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                  /
                </kbd>{" "}
                to toggle
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFeedback && lastKeyCombo.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-900/90 dark:bg-gray-700/90 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm shadow-lg"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center gap-2">
              {lastKeyCombo.map((key) => (
                <kbd
                  key={key}
                  className="px-2 py-1 bg-white/10 rounded min-w-[24px] text-center text-xs font-medium shadow-inner"
                >
                  {key}
                </kbd>
              ))}
            </div>
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
