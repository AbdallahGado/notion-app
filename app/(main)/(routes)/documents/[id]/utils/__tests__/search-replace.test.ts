import { performSearch } from "../search-replace";

// Minimal fake editor that only provides getText()
// Tests use a minimal fake editor structure — allow explicit any here for brevity
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import type { Editor } from "@tiptap/react";
function makeEditor(text: string) {
  return {
    getText: () => text,
  } as unknown as Editor;
}

describe("performSearch", () => {
  test("finds plain substring (case-insensitive by default)", () => {
    const editor = makeEditor("Hello world hello");
    const results = performSearch(editor, "hello", {
      caseSensitive: false,
      wholeWord: false,
      regex: false,
      matchDiacritics: false,
      preserveCase: false,
    });
    expect(results.length).toBe(2);
    expect(results[0].from).toBeGreaterThanOrEqual(0);
  });

  test("respects case sensitivity", () => {
    const editor = makeEditor("Hello world hello");
    const results = performSearch(editor, "Hello", {
      caseSensitive: true,
      wholeWord: false,
      regex: false,
      matchDiacritics: false,
      preserveCase: false,
    });
    expect(results.length).toBe(1);
  });

  test("whole word matches only full words", () => {
    const text = "there he is here hethere he";
    const editor = makeEditor(text);
    const results = performSearch(editor, "he", {
      caseSensitive: false,
      wholeWord: true,
      regex: false,
      matchDiacritics: false,
      preserveCase: false,
    });
    // Expect exactly the two standalone 'he' occurrences and verify substrings
    expect(results.length).toBe(2);
    for (const r of results) {
      expect(text.slice(r.from, r.to)).toBe("he");
    }
  });

  test("regex mode works", () => {
    const editor = makeEditor("abc 123 abc 456");
    const results = performSearch(editor, String.raw`\d+`, {
      caseSensitive: false,
      wholeWord: false,
      regex: true,
      matchDiacritics: false,
      preserveCase: false,
    });
    expect(results.length).toBe(2);
  });
});
