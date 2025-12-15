import { Editor } from '@tiptap/react';

export function handleEditorShortcuts(e: KeyboardEvent, editor: Editor | null, saveContent: (content: string) => void) {
  if (e.ctrlKey) {
    switch (e.key) {
      case "s":
        e.preventDefault();
        // Manual save
        if (editor) {
          const content = editor.getHTML();
          saveContent(content);
        }
        break;

      case "1":
        e.preventDefault();
        editor?.chain().focus().toggleHeading({ level: 1 }).run();
        break;

      case "2":
        e.preventDefault();
        editor?.chain().focus().toggleHeading({ level: 2 }).run();
        break;

      case "3":
        e.preventDefault();
        editor?.chain().focus().toggleHeading({ level: 3 }).run();
        break;

      case "`":
        e.preventDefault();
        editor?.chain().focus().toggleCodeBlock().run();
        break;

      case "q":
        e.preventDefault();
        editor?.chain().focus().toggleBlockquote().run();
        break;

      case "l":
        e.preventDefault();
        editor?.chain().focus().toggleLink({ href: "" }).run();
        break;

      default:
        break;
    }
  }
}