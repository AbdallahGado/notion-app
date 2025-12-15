import React from "react";
import { Editor } from "@tiptap/react";
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Calculator,
} from "lucide-react";

interface CommandItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  command: (editor: Editor) => void;
}

const commands: CommandItem[] = [
  {
    title: "Heading 1",
    description: "Big section heading",
    icon: <Heading1 className="w-4 h-4" />,
    command: (editor) => editor.chain().focus().setHeading({ level: 1 }).run(),
  },
  {
    title: "Heading 2",
    description: "Medium section heading",
    icon: <Heading2 className="w-4 h-4" />,
    command: (editor) => editor.chain().focus().setHeading({ level: 2 }).run(),
  },
  {
    title: "Heading 3",
    description: "Small section heading",
    icon: <Heading3 className="w-4 h-4" />,
    command: (editor) => editor.chain().focus().setHeading({ level: 3 }).run(),
  },
  {
    title: "Bullet List",
    description: "Create a simple bullet list",
    icon: <List className="w-4 h-4" />,
    command: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    title: "Numbered List",
    description: "Create a numbered list",
    icon: <ListOrdered className="w-4 h-4" />,
    command: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    title: "Quote",
    description: "Add a quote block",
    icon: <Quote className="w-4 h-4" />,
    command: (editor) => editor.chain().focus().setBlockquote().run(),
  },
  {
    title: "Code Block",
    description: "Add a code block",
    icon: <Code className="w-4 h-4" />,
    command: (editor) => editor.chain().focus().setCodeBlock().run(),
  },
  {
    title: "Inline Math",
    description: "Insert inline mathematical expression",
    icon: <Calculator className="w-4 h-4" />,
    command: (editor) =>
      editor
        .chain()
        .focus()
        .insertContent({
          type: "math_inline",
          attrs: { latex: String.raw`x^2` },
        })
        .run(),
  },
  {
    title: "Block Math",
    description: "Insert block mathematical expression",
    icon: <Calculator className="w-4 h-4" />,
    command: (editor) =>
      editor
        .chain()
        .focus()
        .insertContent({
          type: "math_block",
          attrs: { latex: String.raw`\int_0^1 x dx` },
        })
        .run(),
  },
];

interface SlashCommandProps {
  items: CommandItem[];
  command: (item: CommandItem) => void;
}

function SlashCommandComponent({
  items,
  command,
}: Readonly<SlashCommandProps>) {
  return (
    <div className="bg-white dark:bg-[#23233a] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 max-h-64 overflow-y-auto">
      {items.map((item) => (
        <button
          key={item.title}
          className="flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          onClick={() => command(item)}
        >
          {item.icon}
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {item.title}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {item.description}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

export const SlashCommand = React.memo(SlashCommandComponent);
SlashCommand.displayName = "SlashCommand";

export { commands };
