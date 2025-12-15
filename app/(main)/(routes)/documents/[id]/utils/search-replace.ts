import { Editor } from "@tiptap/react";

interface SearchFilters {
  caseSensitive: boolean;
  wholeWord: boolean;
  regex: boolean;
  matchDiacritics: boolean;
  preserveCase: boolean;
}

function escapeRegex(text: string) {
  // Replace metacharacters by prefixing them with a backslash using a callback
  // to avoid needing escaped replacement strings or nested template literals.
  // Use replaceAll with a regex and replacer to satisfy lint rule preference
  return text.replaceAll(/[.*+?^${}()|[\\]\\]/g, (m) => `\\${m}`);
}

function findRegexMatches(
  text: string,
  pattern: string,
  flags: string
): Array<{ from: number; to: number }> {
  const results: { from: number; to: number }[] = [];
  try {
    const regex = new RegExp(pattern, flags);
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      results.push({ from: match.index, to: match.index + match[0].length });
    }
  } catch (err) {
    console.error("Invalid regex pattern:", err);
  }
  return results;
}

export function performSearch(
  editor: Editor,
  searchQuery: string,
  filters: SearchFilters
): Array<{ from: number; to: number }> {
  if (!editor || !searchQuery.trim()) return [];

  const text = editor.getText();
  const searchText = searchQuery;
  const flags = filters.caseSensitive ? "g" : "gi";

  if (filters.regex) {
    return findRegexMatches(text, searchText, flags);
  }

  if (filters.wholeWord) {
    // Use String.raw for the surrounding word-boundary markers, escapeRegex returns
    // a plain string so this does not create nested template literals.
    const pattern = String.raw`\b${escapeRegex(searchText)}\b`;
    return findRegexMatches(text, pattern, flags);
  }

  const pattern = escapeRegex(searchText);
  return findRegexMatches(text, pattern, flags);
}
