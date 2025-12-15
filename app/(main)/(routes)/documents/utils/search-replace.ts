import { Editor } from "@tiptap/react";
import { toast } from "sonner";

interface SearchFilters {
  caseSensitive: boolean;
  wholeWord: boolean;
  regex: boolean;
  matchDiacritics: boolean;
  preserveCase: boolean;
}

interface SearchMatch {
  from: number;
  to: number;
}

function escapeRegex(text: string) {
  return text.replaceAll(/[.*+?^${}()|[\\]\\]/g, (m) => `\\${m}`);
}

function buildSearchFlags(searchFilters: SearchFilters): string {
  let flags = searchFilters.caseSensitive ? "g" : "gi";
  if (searchFilters.matchDiacritics) {
    flags += "u";
  }
  return flags;
}

function performRegexSearch(
  text: string,
  searchText: string,
  flags: string
): SearchMatch[] {
  const results: SearchMatch[] = [];
  try {
    const regex = new RegExp(searchText, flags);
    let match;
    while ((match = regex.exec(text)) !== null) {
      results.push({
        from: match.index,
        to: match.index + match[0].length,
      });
    }
  } catch (err) {
    console.error(err);
    toast.error("Invalid regex pattern");
  }
  return results;
}

function performWholeWordSearch(
  text: string,
  query: string,
  flags: string
): SearchMatch[] {
  const results: SearchMatch[] = [];
  const escaped = escapeRegex(query);
  const wordRegex = new RegExp(String.raw`\b${escaped}\b`, flags);
  let match;
  while ((match = wordRegex.exec(text)) !== null) {
    results.push({
      from: match.index,
      to: match.index + match[0].length,
    });
  }
  return results;
}

function performSimpleSearch(text: string, query: string): SearchMatch[] {
  const results: SearchMatch[] = [];
  let index = text.indexOf(query);
  while (index !== -1) {
    results.push({ from: index, to: index + query.length });
    index = text.indexOf(query, index + 1);
  }
  return results;
}

export function performSearch(
  editor: Editor | null,
  searchQuery: string,
  searchFilters: SearchFilters
): SearchMatch[] {
  if (!editor || !searchQuery.trim()) {
    return [];
  }

  try {
    const text = editor.getText();
    const searchText = searchQuery;
    const flags = buildSearchFlags(searchFilters);

    if (searchFilters.regex) {
      return performRegexSearch(text, searchText, flags);
    }

    const processedText = searchFilters.caseSensitive
      ? text
      : text.toLowerCase();
    const processedQuery = searchFilters.caseSensitive
      ? searchText
      : searchText.toLowerCase();

    if (searchFilters.wholeWord) {
      return performWholeWordSearch(processedText, processedQuery, flags);
    }

    return performSimpleSearch(processedText, processedQuery);
  } catch (error) {
    console.error("Search error:", error);
    toast.error("Search failed");
    return [];
  }
}

export function performReplace(
  editor: Editor | null,
  searchQuery: string,
  replaceQuery: string,
  searchFilters: SearchFilters
): number {
  if (!editor || !searchQuery.trim() || !replaceQuery.trim()) {
    toast.error("Please enter both search and replace text");
    return 0;
  }

  try {
    const text = editor.getText();
    const results = performSearch(editor, searchQuery, searchFilters);

    if (results.length === 0) {
      toast.info("No matches found to replace");
      return 0;
    }

    // Replace all occurrences
    let newText = text;
    let offset = 0;
    for (const result of results) {
      const before = newText.slice(0, result.from + offset);
      const after = newText.slice(result.to + offset);
      newText = before + replaceQuery + after;
      offset += replaceQuery.length - (result.to - result.from);
    }

    // Set the new content
    editor.commands.setContent(newText);

    return results.length;
  } catch (error) {
    console.error("Replace error:", error);
    toast.error("Replace failed");
    return 0;
  }
}
