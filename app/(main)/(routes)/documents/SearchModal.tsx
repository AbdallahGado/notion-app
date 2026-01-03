"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, History, X, ChevronRight, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";


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

  const [activeTab, setActiveTab] = useState<"search" | "replace">("search");

  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setReplaceQuery("");
      setFilters(defaultFilters);
      setShowFilters(false);

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
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99999] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 30, stiffness: 400 }}
          className="bg-white/70 dark:bg-[#0b0c14]/70 backdrop-blur-xl rounded-3xl shadow-[0_30px_90px_rgba(0,0,0,0.3),0_0_20px_rgba(99,102,241,0.05)] max-w-2xl w-full max-h-[90vh] overflow-hidden border border-black/5 dark:border-white/5 group/modal relative"
          onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
        >
          {/* Subtle Glow Effect */}
          <div className="absolute -inset-[1px] bg-gradient-to-br from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 rounded-3xl opacity-0 group-hover/modal:opacity-100 transition-opacity duration-700 pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-black/5 dark:border-white/5 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-none">
                  Advanced Search
                </h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">
                  Find and transform content within your document
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all duration-300 hover:rotate-90 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex px-8 py-2 border-b border-black/5 dark:border-white/5 relative z-10 gap-8">
            <button
              onClick={() => setActiveTab("search")}
              className={cn(
                "relative py-3 text-sm font-bold transition-all duration-300",
                activeTab === "search" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              )}
            >
              Search
              {activeTab === "search" && (
                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("replace")}
              className={cn(
                "relative py-3 text-sm font-bold transition-all duration-300",
                activeTab === "replace" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              )}
            >
              Replace
              {activeTab === "replace" && (
                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
              )}
            </button>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6 relative z-10 max-h-[500px] overflow-y-auto scrollbar-hide">
            {/* Search Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                Search Query
              </label>
              <div className="group/input relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-indigo-500 transition-colors">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="What are you looking for?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-12 pr-12 py-4 h-14 bg-black/5 dark:bg-white/5 border border-transparent focus:border-indigo-500/30 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                  autoFocus
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                   <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn(
                      "p-2 rounded-lg transition-all duration-300",
                      showFilters ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "text-slate-400 hover:bg-black/5 dark:hover:bg-white/5"
                    )}
                    title="Toggle filters"
                  >
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Replace Input */}
            <AnimatePresence>
              {activeTab === "replace" && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="space-y-2"
                >
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                    Replace With
                  </label>
                  <div className="group/input relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-emerald-500 transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      placeholder="New text value..."
                      value={replaceQuery}
                      onChange={(e) => setReplaceQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="w-full pl-12 py-4 h-14 bg-black/5 dark:bg-white/5 border border-transparent focus:border-emerald-500/30 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Filters Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-black/5 dark:bg-white/5 rounded-2xl p-6 border border-black/5 dark:border-white/10"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(filters).map(([key, value]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => updateFilter(key as keyof SearchFilters, !value)}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-xl border transition-all duration-300 active:scale-95 group/filter",
                          value 
                            ? "bg-indigo-500 dark:bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-500/20" 
                            : "bg-white dark:bg-[#0b0c14] border-black/5 dark:border-white/10 text-slate-500 hover:border-indigo-500/30 hover:text-indigo-500"
                        )}
                      >
                         <span className="text-xs font-bold uppercase tracking-tight">
                          {key.replaceAll(/([A-Z])/g, " $1")}
                        </span>
                        <div className={cn(
                          "w-5 h-5 rounded-md flex items-center justify-center transition-all",
                          value ? "bg-white/20" : "bg-black/5 dark:bg-white/5"
                        )}>
                          {value && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                  <History className="w-3 h-3" />
                  Recent Searches
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.slice(0, 5).map((search, index) => (
                    <button
                      key={`${search}-${index}`}
                      onClick={() => setSearchQuery(search)}
                      className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-300 bg-black/5 dark:bg-white/5 border border-transparent hover:border-indigo-500/30 hover:text-indigo-500 rounded-full transition-all duration-300"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-8 py-6 bg-slate-50/50 dark:bg-white/5 border-t border-black/5 dark:border-white/5 relative z-10">
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {activeTab === "replace" ? "Ctrl+Enter to Replace All" : "Enter to Search"}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all"
              >
                Cancel
              </button>
              {activeTab === "search" ? (
                <button
                  onClick={handleSearch}
                  className="px-8 py-2.5 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-[0_8px_20px_rgba(99,102,241,0.3)] hover:scale-105 active:scale-95"
                >
                  Search
                </button>
              ) : (
                <button
                  onClick={handleReplace}
                  className="px-8 py-2.5 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-[0_8px_20px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95"
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
