import { Editor } from "@tiptap/react";

type Level = 1 | 2 | 3 | 4 | 5 | 6;

function handleSaveShortcut(
  e: KeyboardEvent,
  saveContent: (content: string) => Promise<void>,
  editor: Editor
) {
  if (e.ctrlKey && e.key === "s") {
    e.preventDefault();
    saveContent(editor.getHTML());
  }
}

function handleHeadingShortcut(key: string, editor: Editor): boolean {
  if (key >= "1" && key <= "6") {
    const parsed = Number.parseInt(key, 10);
    const level = Math.min(
      Math.max(Number.isNaN(parsed) ? 1 : parsed, 1),
      6
    ) as Level;
    editor.chain().focus().toggleHeading({ level }).run();
    return true;
  }
  return false;
}

function handleLinkShortcut(editor: Editor) {
  const url = globalThis.prompt("Enter the URL");
  if (url) {
    editor.chain().focus().setLink({ href: url }).run();
  }
}

function handleFormattingShortcuts(e: KeyboardEvent, editor: Editor) {
  const key = e.key;

  if (handleHeadingShortcut(key, editor)) {
    e.preventDefault();
    return;
  }

  switch (key.toLowerCase()) {
    case "b":
      e.preventDefault();
      editor.chain().focus().toggleBold().run();
      break;
    case "i":
      e.preventDefault();
      editor.chain().focus().toggleItalic().run();
      break;
    case "`":
      e.preventDefault();
      editor.chain().focus().toggleCodeBlock().run();
      break;
    case "q":
      e.preventDefault();
      editor.chain().focus().toggleBlockquote().run();
      break;
    case "k":
    case "l":
      e.preventDefault();
      handleLinkShortcut(editor);
      break;
    default:
      break;
  }
}

function handleCodeBlockNavigation(e: KeyboardEvent, editor: Editor) {
  if (e.key === "Tab" && editor.isActive("codeBlock")) {
    e.preventDefault();
    editor.chain().focus().insertContent("\t").run();
  }
}

export function handleEditorShortcuts(
  e: KeyboardEvent,
  editor: Editor | null,
  saveContent: (content: string) => Promise<void>
) {
  if (!editor) return;

  handleSaveShortcut(e, saveContent, editor);

  if (e.ctrlKey || e.metaKey) {
    handleFormattingShortcuts(e, editor);
  }

  handleCodeBlockNavigation(e, editor);
}
