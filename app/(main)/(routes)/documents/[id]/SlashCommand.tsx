/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @typescript-eslint/no-unused-vars */

import React from "react";
import { Editor } from "@tiptap/react";
import { cn } from "@/lib/utils";
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Calculator,
  Image,
  Table,
  CheckSquare,
} from "lucide-react";

export interface CommandItem {
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
  {
    title: "Image from File",
    description: "Upload and insert an image from file",
    icon: <Image className="w-4 h-4" />,
    command: (_editor) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          // Trigger the file upload handler from the page component
          const event = new CustomEvent("imageUpload", { detail: { file } });
          document.dispatchEvent(event);
        }
      };
      input.click();
    },
  },
  {
    title: "Image from URL",
    description: "Insert an image from URL",
    icon: <Image className="w-4 h-4" />,
    command: (_editor) => {
      const url = prompt("Enter image URL:");
      if (url) {
        _editor.chain().focus().setImage({ src: url }).run();
      }
    },
  },
  {
    title: "Table",
    description: "Insert a table",
    icon: <Table className="w-4 h-4" />,
    command: (editor) => {
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    },
  },
  {
    title: "Task List",
    description: "Create a task list",
    icon: <CheckSquare className="w-4 h-4" />,
    command: (editor) => {
      editor.chain().focus().toggleTaskList().run();
    },
  },
];

interface SlashCommandProps {
  items: CommandItem[];
  command: (item: CommandItem) => void;
  selectedIndex?: number;
}

function SlashCommandComponent({
  items,
  command,
  selectedIndex = 0,
}: Readonly<SlashCommandProps>) {
  const selectedItemRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  return (
    <div className="relative z-50 h-[330px] w-72 overflow-hidden rounded-xl border border-white/20 bg-white/80 p-2 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#1f1f1f]/80">
       {/* Gradient Overlay for Premium feel */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-white/10 to-transparent dark:from-white/5" />
      
      <div className="mb-2 px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">
        Basic Blocks
      </div>
      
      <div className="h-[280px] overflow-y-auto scrollbar-hide space-y-1">
        {items.map((item, index) => {
          const isSelected = index === selectedIndex;
          return (
            <button
              key={item.title}
              ref={isSelected ? selectedItemRef : null}
              className={cn(
                "group relative flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm transition-all duration-200",
                isSelected
                  ? "bg-indigo-500/10 dark:bg-indigo-500/20"
                  : "hover:bg-slate-100 dark:hover:bg-white/5"
              )}
              onClick={() => command(item)}
            >
              {isSelected && (
                 <div className="absolute inset-0 rounded-lg border border-indigo-500/30 dark:border-indigo-400/30 shadow-sm" />
              )}

              <div
                className={cn(
                  "relative flex h-9 w-9 items-center justify-center rounded-md border transition-all duration-200",
                  isSelected
                    ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                    : "border-slate-200 bg-white text-slate-500 dark:border-white/10 dark:bg-[#2f2f2f] dark:text-gray-400 group-hover:border-indigo-500/30 group-hover:text-indigo-500"
                )}
              >
                {/* Clone element to ensure icon size is consistent */}
                {React.isValidElement(item.icon) &&
                  React.cloneElement(item.icon as React.ReactElement, {
                    className: cn("h-4 w-4 transition-transform duration-200", isSelected && "scale-110"),
                  })}
              </div>
              
              <div className="flex flex-col text-left">
                <span className={cn("font-semibold transition-colors duration-200", isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-slate-700 dark:text-gray-200")}>
                    {item.title}
                </span>
                <span
                  className={cn(
                    "text-[11px] transition-colors duration-200",
                    isSelected ? "text-indigo-600/70 dark:text-indigo-400/70" : "text-slate-400 dark:text-gray-500"
                  )}
                >
                  {item.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const SlashCommand = React.memo(SlashCommandComponent);
SlashCommand.displayName = "SlashCommand";

export { commands };
