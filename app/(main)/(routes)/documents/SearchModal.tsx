"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, History, X } from "lucide-react";
import { toast } from "sonner";
import styles from "./SearchModal.module.css";

interface SearchModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSearch: (query: string, filters: SearchFilters) => void;
  readonly onReplace: (
    searchQuery: string,
    replaceQuery: string,
    filters: SearchFilters
  ) => void;
  readonly recentSearches?: string[];
  readonly onAddToRecent?: (query: string) => void;
}

export interface SearchFilters {
  caseSensitive: boolean;
  wholeWord: boolean;
  regex: boolean;
  matchDiacritics: boolean;
  preserveCase: boolean;
}

const defaultFilters: SearchFilters = {
  caseSensitive: false,
  wholeWord: false,
  regex: false,
  matchDiacritics: false,
  preserveCase: false,
};

export default function SearchModal({
  isOpen,
  onClose,
  onSearch,
  onReplace,
  recentSearches = [],
  onAddToRecent,
}: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [replaceQuery, setReplaceQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [showRecent, setShowRecent] = useState(false);
  const [activeTab, setActiveTab] = useState<"search" | "replace">("search");

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setReplaceQuery("");
      setFilters(defaultFilters);
      setShowFilters(false);
      setShowRecent(false);
      setActiveTab("search");
    }
  }, [isOpen]);

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search term");
      return;
    }
    onSearch(searchQuery, filters);
    if (onAddToRecent && !recentSearches.includes(searchQuery.trim())) {
      onAddToRecent(searchQuery.trim());
    }
  }, [searchQuery, filters, onSearch, onAddToRecent, recentSearches]);

  const handleReplace = useCallback(() => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search term");
      return;
    }
    onReplace(searchQuery, replaceQuery, filters);
  }, [searchQuery, replaceQuery, filters, onReplace]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        if (e.ctrlKey || e.metaKey) {
          handleReplace();
        } else {
          handleSearch();
        }
      } else if (e.key === "Escape") {
        onClose();
      }
    },
    [handleSearch, handleReplace, onClose]
  );

  const updateFilter = useCallback(
    (key: keyof SearchFilters, value: boolean) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${styles.modalBackdrop}`}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          transition={{
            type: "spring",
            damping: 30,
            stiffness: 400,
            mass: 0.8,
          }}
          className={`bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-200/50 dark:border-slate-700/50 backdrop-blur-xl bg-opacity-95 dark:bg-opacity-95 ${styles.modalContent}`}
          onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Advanced Search & Replace
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab("search")}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${styles.tab} ${
                activeTab === "search"
                  ? `text-indigo-600 dark:text-indigo-400 ${styles.tabActive}`
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Search
            </button>
            <button
              onClick={() => setActiveTab("replace")}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${styles.tab} ${
                activeTab === "replace"
                  ? `text-indigo-600 dark:text-indigo-400 ${styles.tabActive}`
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Replace
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className={`w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm hover:shadow transition-shadow ${styles.searchInput}`}
                autoFocus
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-1 rounded transition-colors ${styles.filterButton} ${
                    showFilters
                      ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30"
                      : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  }`}
                  title="Toggle filters"
                >
                  <Filter className="w-4 h-4" />
                </button>
                {recentSearches.length > 0 && (
                  <button
                    onClick={() => setShowRecent(!showRecent)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    title="Recent searches"
                  >
                    <History className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Replace Input (only for replace tab) */}
            <AnimatePresence>
              {activeTab === "replace" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <input
                    type="text"
                    placeholder="Replace with..."
                    value={replaceQuery}
                    onChange={(e) => setReplaceQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full px-3 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Filters Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 space-y-3"
                >
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    Search Options
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(filters).map(([key, value]) => (
                      <label
                        key={key}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) =>
                            updateFilter(
                              key as keyof SearchFilters,
                              e.target.checked
                            )
                          }
                          className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                          {key.replaceAll(/([A-Z])/g, " $1").toLowerCase()}
                        </span>
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Recent Searches */}
            <AnimatePresence>
              {showRecent && recentSearches.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 max-h-48 overflow-y-auto"
                >
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Recent Searches
                  </h3>
                  <div className="space-y-1">
                    {recentSearches.map((search, index) => (
                      <button
                        key={`${search}-${index}`}
                        onClick={() => {
                          setSearchQuery(search);
                          setShowRecent(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition-colors ${styles.recentSearchItem}`}
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Press Enter to search, Ctrl+Enter to replace
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              {activeTab === "search" ? (
                <button
                  onClick={handleSearch}
                  className={`px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-md hover:shadow-lg ${styles.searchButton}`}
                >
                  Search
                </button>
              ) : (
                <button
                  onClick={handleReplace}
                  className={`px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-md hover:shadow-lg ${styles.searchButton}`}
                >
                  Replace All
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
