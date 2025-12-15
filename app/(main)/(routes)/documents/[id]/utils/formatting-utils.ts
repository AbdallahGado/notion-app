import { Editor } from "@tiptap/react";

export interface FormattingOption {
  id: string;
  label: string;
  description: string;
  apply: (editor: Editor) => void;
  isActive: (editor: Editor) => boolean;
}

/**
 * Advanced formatting utilities for document editors
 */

export const FormattingUtils = {
  /**
   * Format selected text to title case
   */
  toTitleCase: (editor: Editor) => {
    const { from, to } = editor.state.selection;
    if (from === to) return;

    const text = editor.state.doc.textBetween(from, to);
    const titleCased = text
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    editor.commands.setTextSelection({ from, to });
    editor.commands.insertContent(titleCased);
  },

  /**
   * Format selected text to UPPERCASE
   */
  toUpperCase: (editor: Editor) => {
    const { from, to } = editor.state.selection;
    if (from === to) return;

    const text = editor.state.doc.textBetween(from, to);
    editor.commands.setTextSelection({ from, to });
    editor.commands.insertContent(text.toUpperCase());
  },

  /**
   * Format selected text to lowercase
   */
  toLowerCase: (editor: Editor) => {
    const { from, to } = editor.state.selection;
    if (from === to) return;

    const text = editor.state.doc.textBetween(from, to);
    editor.commands.setTextSelection({ from, to });
    editor.commands.insertContent(text.toLowerCase());
  },

  /**
   * Convert paragraph to heading with specified level
   */
  convertToHeading: (editor: Editor, level: 1 | 2 | 3 | 4 | 5 | 6) => {
    editor.chain().focus().toggleHeading({ level }).run();
  },

  /**
   * Convert text lines to bullet list
   */
  convertToBulletList: (editor: Editor) => {
    editor.chain().focus().toggleBulletList().run();
  },

  /**
   * Convert text lines to numbered list
   */
  convertToNumberedList: (editor: Editor) => {
    editor.chain().focus().toggleOrderedList().run();
  },

  /**
   * Wrap selected text in quotes/blockquote
   */
  wrapInQuote: (editor: Editor) => {
    editor.chain().focus().setBlockquote().run();
  },

  /**
   * Create a code block from selected text
   */
  wrapInCodeBlock: (editor: Editor) => {
    editor.chain().focus().setCodeBlock().run();
  },

  /**
   * Calculate document statistics
   */
  getDocumentStats: (editor: Editor) => {
    const text = editor.getText();

    const wordCount = text
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0).length;
    const charCount = text.length;
    const charCountNoSpaces = text.replaceAll(" ", "").length;
    const paragraphs = text
      .split(/\n\n+/)
      .filter((p) => p.trim().length > 0).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));
    const estimatedSpeakingTime = Math.max(1, Math.ceil(wordCount / 150));

    return {
      wordCount,
      charCount,
      charCountNoSpaces,
      paragraphs,
      readingTime,
      estimatedSpeakingTime,
    };
  },

  /**
   * Find and highlight all instances of a word
   */
  findAndHighlight: (editor: Editor, query: string) => {
    // This would require a search extension or custom implementation
    const text = editor.getText();
    const regex = new RegExp(query, "gi");
    let match;
    const matches = [];

    while ((match = regex.exec(text)) !== null) {
      matches.push({
        from: match.index,
        to: match.index + match[0].length,
        text: match[0],
      });
    }

    return matches;
  },

  /**
   * Insert a horizontal rule / divider
   */
  insertDivider: (editor: Editor) => {
    editor.chain().focus().setHorizontalRule().run();
  },

  /**
   * Create a table with specified dimensions
   */
  insertTable: (editor: Editor, rows = 3, cols = 3) => {
    editor
      .chain()
      .focus()
      .insertTable({ rows, cols, withHeaderRow: true })
      .run();
  },

  /**
   * Apply a specific color to selected text
   */
  applyColor: (editor: Editor, color: string) => {
    editor.chain().focus().setColor(color).run();
  },

  /**
   * Apply background highlight color
   */
  applyHighlight: (editor: Editor, color: string) => {
    editor.chain().focus().setHighlight({ color }).run();
  },

  /**
   * Insert a footnote
   */
  insertFootnote: (editor: Editor, content: string) => {
    // This would require a footnote extension
    // Placeholder for custom implementation
    editor.chain().focus().insertContent(`[^1]: ${content}`).run();
  },

  /**
   * Remove all formatting (clean text)
   */
  clearFormatting: (editor: Editor) => {
    editor.chain().focus().clearNodes().unsetAllMarks().run();
  },

  /**
   * Duplicate current line or selection
   */
  duplicateLine: (editor: Editor) => {
    const { $anchor } = editor.state.selection;
    const line = $anchor.parent;
    const textContent = line.textContent;

    editor
      .chain()
      .focus()
      .insertContent("\n" + textContent)
      .run();
  },

  /**
   * Delete current line
   */
  deleteLine: (editor: Editor) => {
    const { from, to } = editor.state.selection;
    const $from = editor.state.doc.resolve(from);
    const $to = editor.state.doc.resolve(to);

    editor
      .chain()
      .focus()
      .deleteRange({ from: $from.start() - 1, to: $to.end() + 1 })
      .run();
  },

  /**
   * Increase indent level (indent forward)
   */
  increaseIndent: (editor: Editor) => {
    editor.chain().focus().sinkListItem("listItem").run();
  },

  /**
   * Decrease indent level (outdent)
   */
  decreaseIndent: (editor: Editor) => {
    editor.chain().focus().liftListItem("listItem").run();
  },
};

/**
 * Get all available formatting options
 */
export const getFormattingOptions = (): FormattingOption[] => [
  {
    id: "title-case",
    label: "Title Case",
    description: "Convert selected text to Title Case",
    apply: (ed) => FormattingUtils.toTitleCase(ed),
    isActive: () => false,
  },
  {
    id: "uppercase",
    label: "UPPERCASE",
    description: "Convert selected text to UPPERCASE",
    apply: (ed) => FormattingUtils.toUpperCase(ed),
    isActive: () => false,
  },
  {
    id: "lowercase",
    label: "lowercase",
    description: "Convert selected text to lowercase",
    apply: (ed) => FormattingUtils.toLowerCase(ed),
    isActive: () => false,
  },
  {
    id: "clear-formatting",
    label: "Clear Formatting",
    description: "Remove all formatting from selected text",
    apply: (ed) => FormattingUtils.clearFormatting(ed),
    isActive: () => false,
  },
];
