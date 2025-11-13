import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Command, Search, Zap } from "lucide-react";
import {
  shortcutsRegistry,
  RegisteredShortcut,
} from "@/lib/keyboard-shortcuts-actions";

interface CommandPaletteProps {
  readonly isOpen?: boolean;
  readonly onClose?: () => void;
}

export default function CommandPalette({
  isOpen = false,
  onClose,
}: CommandPaletteProps) {
  const [open, setOpen] = useState(isOpen);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [commands, setCommands] = useState<RegisteredShortcut[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Subscribe to shortcuts registry changes
  useEffect(() => {
    const unsubscribe = shortcutsRegistry.subscribe((shortcuts) => {
      setCommands(shortcuts);
    });
    setCommands(shortcutsRegistry.getAll());
    return unsubscribe;
  }, []);

  // Filter commands based on search
  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.description.toLowerCase().includes(search.toLowerCase()) ||
      cmd.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleClose = useCallback(() => {
    setOpen(false);
    setSearch("");
    setSelectedIndex(0);
    onClose?.();
  }, [onClose]);

  const handleExecute = useCallback(
    async (cmd: RegisteredShortcut) => {
      await shortcutsRegistry.execute(cmd.id);
      handleClose();
    },
    [handleClose]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case "Escape":
          handleClose();
          break;
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            handleExecute(filteredCommands[selectedIndex]);
          }
          break;
        default:
          break;
      }
    },
    [filteredCommands, selectedIndex, handleExecute, handleClose]
  );

  // Global keyboard listener for Cmd+K or Ctrl+K
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
        setSearch("");
        setSelectedIndex(0);
      }
    };

    globalThis.addEventListener("keydown", handleGlobalKey);
    return () => globalThis.removeEventListener("keydown", handleGlobalKey);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (open && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-start justify-center pt-20"
          onClick={() => handleClose()}
        >
          <motion.div
            initial={{ scale: 0.95, y: -20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: -20 }}
            className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-xl shadow-2xl overflow-hidden"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search commands..."
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setSearch(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent text-lg outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <kbd className="hidden sm:inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-medium text-gray-600 dark:text-gray-300">
                Esc
              </kbd>
            </div>

            {/* Commands list */}
            <div className="max-h-96 overflow-y-auto">
              {filteredCommands.length === 0 ? (
                <div className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                  <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No commands found</p>
                </div>
              ) : (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.02,
                      },
                    },
                  }}
                >
                  {filteredCommands.map((cmd, index) => (
                    <motion.button
                      key={cmd.id}
                      variants={{
                        hidden: { opacity: 0, x: -10 },
                        visible: { opacity: 1, x: 0 },
                      }}
                      onClick={() => handleExecute(cmd)}
                      className={`w-full px-4 py-3 flex items-center justify-between text-left transition-colors ${
                        index === selectedIndex
                          ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-100"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Command className="w-4 h-4 opacity-60" />
                        <div>
                          <div className="font-medium text-sm">
                            {cmd.description}
                          </div>
                          <div className="text-xs opacity-60">{cmd.id}</div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {cmd.keys.map((key) => (
                          <kbd
                            key={key}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-medium text-gray-600 dark:text-gray-300"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Footer hint */}
            {filteredCommands.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
                <span>
                  {filteredCommands.length} command
                  {filteredCommands.length !== 1 ? "s" : ""} found
                </span>
                <div className="flex gap-2">
                  <span>↑↓ navigate</span>
                  <span>⏎ execute</span>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
