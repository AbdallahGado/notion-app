"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { Node as ProseMirrorNode } from "prosemirror-model";
import { performSearch as doSearch } from "../utils/search-replace";
import { Editor } from "@tiptap/react";

interface UseDocumentEditorProps {
  documentId: string | undefined;
  initialContent: string | undefined;
  onSave: (content: string) => Promise<void>;
}

export type SearchFilters = {
  caseSensitive: boolean;
  wholeWord: boolean;
  regex: boolean;
  matchDiacritics: boolean;
  preserveCase: boolean;
};

export const useDocumentEditor = ({
  documentId,
  initialContent,
  onSave,
}: UseDocumentEditorProps) => {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [counts, setCounts] = useState({ words: 0, chars: 0 });
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // Search/Replace State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ from: number; to: number }[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [searchFilters, setSearchFilters] = useState({
    caseSensitive: false,
    wholeWord: false,
    regex: false,
    matchDiacritics: false,
    preserveCase: false,
  });
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [replaceQuery, setReplaceQuery] = useState("");

  // Table of Contents State
  const [tocItems, setTocItems] = useState<{ id: string; text: string; level: number; pos: number }[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Load recent searches on mount
  useEffect(() => {
    if (documentId) {
      const saved = localStorage.getItem(`recent-searches-${documentId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setRecentSearches(parsed);
        } catch (e) { console.error("Failed to parse searches", e); }
      }
    }
  }, [documentId]);

  // Content sync
  useEffect(() => {
    if (editor && !editor.isDestroyed && initialContent !== undefined && editor.getHTML() !== initialContent) {
      try {
        editor.commands.setContent(initialContent);
        // Instant update counts
        const text = editor.getText();
        setCounts({
          words: text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length,
          chars: text.replaceAll(/\s/g, "").length
        });
      } catch (e) { console.error("Failed to set content", e); }
    }
  }, [initialContent, editor]);

  // Update counts on editor update
  useEffect(() => {
    if (!editor) return;
    const updateCounts = () => {
      const text = editor.getText();
      setCounts({
        words: text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length,
        chars: text.replaceAll(/\s/g, "").length
      });
    };
    editor.on("update", updateCounts);
    return () => { editor.off("update", updateCounts); };
  }, [editor]);

  // Auto-save logic
  useEffect(() => {
    if (!editor) return;
    const handleUpdate = () => {
      if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
      const timeout = setTimeout(() => {
        onSave(editor.getHTML());
      }, 2000);
      setAutoSaveTimeout(timeout);
    };
    editor.on("update", handleUpdate);
    return () => {
      editor.off("update", handleUpdate);
      if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
    };
  }, [editor, onSave, autoSaveTimeout]);

  // TOC Generation
  const tocItemsMemo = useMemo(() => {
    if (!editor) return [];
    const items: { id: string; text: string; level: number; pos: number }[] = [];
    editor.state.doc.descendants((node: ProseMirrorNode, pos: number) => {
      if (node.type.name === "heading") {
        items.push({ id: `heading-${pos}`, text: node.textContent, level: node.attrs.level, pos });
      }
    });
    return items;
  }, [editor]);

  useEffect(() => {
    setTocItems(tocItemsMemo);
    setExpandedSections(new Set(tocItemsMemo.map(i => i.id)));
  }, [tocItemsMemo]);

  const toggleSectionExpansion = useCallback((headingId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(headingId)) next.delete(headingId);
      else next.add(headingId);
      return next;
    });
  }, []);

  const toggleAllExpansion = useCallback(() => {
    setExpandedSections(prev => 
      prev.size === tocItems.length ? new Set() : new Set(tocItems.map(i => i.id))
    );
  }, [tocItems]);

  const navigateToHeading = useCallback((pos: number) => {
    if (!editor) return;
    editor.commands.setTextSelection(pos);
    const element = editor.view.domAtPos(pos).node;
    if (element && element.nodeType === Node.ELEMENT_NODE) {
      (element as Element).scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [editor]);

  // Search/Replace Logic
  const performSearch = useCallback((query?: string, filters?: SearchFilters) => {
    const q = query ?? searchQuery;
    const f = filters ?? searchFilters;
    if (!editor || !q.trim()) {
      setSearchResults([]);
      setCurrentSearchIndex(0);
      return;
    }
    const results = doSearch(editor, q, f);
    setSearchResults(results);
    setCurrentSearchIndex(0);
    if (results.length > 0) {
      editor.commands.setTextSelection(results[0].from);
      editor.commands.scrollIntoView();
    }
  }, [editor, searchQuery, searchFilters]);

  const performReplace = useCallback((sQuery: string, rQuery: string, filters: SearchFilters) => {
    if (!editor || !sQuery.trim() || !rQuery.trim()) return;
    const results = doSearch(editor, sQuery, filters);
    if (results.length === 0) return;
    let newText = editor.getText();
    for (let i = results.length - 1; i >= 0; i--) {
      const { from, to } = results[i];
      newText = newText.slice(0, from) + rQuery + newText.slice(to);
    }
    editor.commands.setContent(newText);
  }, [editor]);

  const nextSearchResult = useCallback(() => {
    if (searchResults.length === 0) return;
    const n = (currentSearchIndex + 1) % searchResults.length;
    setCurrentSearchIndex(n);
    if (editor) {
      editor.commands.setTextSelection(searchResults[n].from);
      editor.commands.scrollIntoView();
    }
  }, [searchResults, currentSearchIndex, editor]);

  const prevSearchResult = useCallback(() => {
    if (searchResults.length === 0) return;
    const p = currentSearchIndex === 0 ? searchResults.length - 1 : currentSearchIndex - 1;
    setCurrentSearchIndex(p);
    if (editor) {
      editor.commands.setTextSelection(searchResults[p].from);
      editor.commands.scrollIntoView();
    }
  }, [searchResults, currentSearchIndex, editor]);

  return {
    editor, setEditor, counts, searchQuery, setSearchQuery, searchResults, currentSearchIndex,
    searchFilters, setSearchFilters, recentSearches, replaceQuery, setReplaceQuery,
    performSearch, performReplace, nextSearchResult, prevSearchResult,
    tocItems, expandedSections, toggleSectionExpansion, toggleAllExpansion, navigateToHeading
  };
};
