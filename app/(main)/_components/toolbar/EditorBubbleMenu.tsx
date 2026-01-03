"use client";

import { BubbleMenu, Editor } from "@tiptap/react";
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Code,
  Link as LinkIcon,
  Quote,
  Check,
  Palette,
  Trash2,
  Pipette,
  Type
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ToolbarAction } from "./ToolbarAction";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { motion } from "framer-motion";

const TEXT_COLORS = [
  { name: 'Default', color: '', class: 'bg-slate-400' },
  { name: 'Gray', color: '#9ca3af', class: 'bg-gray-400' },
  { name: 'Brown', color: '#92400e', class: 'bg-amber-900' },
  { name: 'Orange', color: '#ea580c', class: 'bg-orange-600' },
  { name: 'Yellow', color: '#ca8a04', class: 'bg-yellow-600' },
  { name: 'Green', color: '#16a34a', class: 'bg-green-600' },
  { name: 'Blue', color: '#2563eb', class: 'bg-blue-600' },
  { name: 'Purple', color: '#9333ea', class: 'bg-purple-600' },
  { name: 'Pink', color: '#db2777', class: 'bg-pink-600' },
  { name: 'Red', color: '#dc2626', class: 'bg-red-600' },
];

const HIGHLIGHT_COLORS = [
  { name: 'None', color: 'transparent', class: 'border border-slate-200 dark:border-white/20' },
  { name: 'Gray', color: '#f3f4f6', class: 'bg-gray-200' },
  { name: 'Brown', color: '#fef3c7', class: 'bg-amber-200' },
  { name: 'Orange', color: '#ffedd5', class: 'bg-orange-200' },
  { name: 'Yellow', color: '#fef9c3', class: 'bg-yellow-200' },
  { name: 'Green', color: '#ecfdf5', class: 'bg-green-100' },
  { name: 'Blue', color: '#eff6ff', class: 'bg-blue-100' },
  { name: 'Purple', color: '#f5f3ff', class: 'bg-purple-100' },
  { name: 'Pink', color: '#fdf2f8', class: 'bg-pink-100' },
  { name: 'Red', color: '#fef2f2', class: 'bg-red-100' },
];

interface EditorBubbleMenuProps {
  editor: Editor | null;
}

export const EditorBubbleMenu = ({ editor }: EditorBubbleMenuProps) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="relative">
      <BubbleMenu
        editor={editor}
        shouldShow={({ state }) => {
          const { selection } = state;
          const { empty } = selection;
          return !empty;
        }}
        className="hidden md:flex relative"
      >
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="flex items-center gap-1 p-1 rounded-xl bg-white/60 dark:bg-[#0b0c14]/60 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.2),0_0_20px_rgba(99,102,241,0.05)] border border-black/5 dark:border-white/5 group/bubble relative overflow-visible"
        >
          {/* Subtle Glow Effect */}
          <div className="absolute -inset-[1px] bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-indigo-500/0 rounded-xl opacity-0 group-hover/bubble:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <div className="flex items-center gap-0.5 relative z-10 px-1">
            <ToolbarAction
              label="Bold"
              icon={Bold}
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive("bold")}
              shortcut="Cmd+B"
            />
            <ToolbarAction
              label="Italic"
              icon={Italic}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive("italic")}
              shortcut="Cmd+I"
            />
            <ToolbarAction
              label="Underline"
              icon={Underline}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive("underline")}
              shortcut="Cmd+U"
            />
             <ToolbarAction
              label="Strike"
              icon={Strikethrough}
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive("strike")}
            />
          </div>

          <Separator orientation="vertical" className="h-4 bg-black/10 dark:bg-white/10 relative z-10 mx-0.5" />

          <div className="flex items-center gap-0.5 relative z-10 px-1">
             <Popover>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    "h-8 w-8 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-all active:scale-95 group/link",
                    editor.isActive("link") ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30" : "text-slate-500 dark:text-slate-400 hover:text-indigo-500"
                  )}
                >
                   <LinkIcon className="h-4 w-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-1.5 glass-panel animate-in fade-in zoom-in-95" align="center" side="top" sideOffset={12}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const input = form.elements.namedItem("url") as HTMLInputElement;
                    const url = input.value;
                    if (url) {
                      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
                    } else {
                       editor.chain().focus().unsetLink().run();
                    }
                  }}
                  className="flex gap-1.5"
                >
                  <div className="relative flex-1">
                     <LinkIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                     <Input 
                      name="url" 
                      placeholder="Enter URL..." 
                      defaultValue={editor.getAttributes('link').href} 
                      className="h-9 pl-8 pr-2 bg-black/5 dark:bg-white/5 border-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 text-xs rounded-lg font-medium" 
                     />
                  </div>
                  <Button size="sm" type="submit" className="h-9 px-3 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 rounded-lg">
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                </form>
              </PopoverContent>
            </Popover>

            <Popover>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "h-8 w-8 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-all active:scale-95 group/palette",
                  (editor.isActive("textStyle") || editor.isActive("highlight")) ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30" : "text-slate-500 hover:text-indigo-500"
                )}
              >
                 <Palette className="h-4 w-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3 glass-panel space-y-4 shadow-2xl" align="center" side="top" sideOffset={12}>
              <div>
                <div className="flex items-center gap-2 mb-2 px-1">
                  <Type className="w-3 h-3 text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Text Color</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {TEXT_COLORS.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => c.color ? editor.chain().focus().setColor(c.color).run() : editor.chain().focus().unsetColor().run()}
                      className={cn(
                        "w-8 h-8 rounded-lg transition-all duration-300 hover:scale-110 active:scale-90 border-2",
                        editor.getAttributes("textStyle").color === c.color ? "border-indigo-500 dark:border-indigo-400 shadow-sm" : "border-transparent",
                        c.class
                      )}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2 px-1 text-indigo-500">
                  <Pipette className="w-3 h-3 text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Highlight</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {HIGHLIGHT_COLORS.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => editor.chain().focus().setHighlight({ color: c.color }).run()}
                      className={cn(
                        "w-8 h-8 rounded-lg transition-all duration-300 hover:scale-110 active:scale-90 border-2",
                        editor.isActive("highlight", { color: c.color }) ? "border-indigo-500 dark:border-indigo-400 shadow-sm" : "border-transparent",
                        c.class
                      )}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
              
              <Separator className="bg-black/5 dark:bg-white/5" />
              <button
                onClick={() => editor.chain().focus().unsetColor().unsetHighlight().run()}
                className="w-full flex items-center justify-center gap-2 py-1.5 px-2 text-[11px] font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Reset Colors
              </button>
            </PopoverContent>
          </Popover>
            <ToolbarAction
              label="Code"
              icon={Code}
              onClick={() => editor.chain().focus().toggleCode().run()}
              isActive={editor.isActive("code")}
            />
            <ToolbarAction
              label="Quote"
              icon={Quote}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive("blockquote")}
            />
          </div>

          <Separator orientation="vertical" className="h-4 bg-black/10 dark:bg-white/10 relative z-10 mx-0.5" />

          <div className="flex items-center gap-0.5 relative z-10 px-1">
            <ToolbarAction
              label="Clear Format"
              icon={Trash2}
              onClick={() => editor.chain().focus().unsetAllMarks().run()}
              className="text-red-400 hover:text-red-500 hover:bg-red-500/5"
            />
          </div>
        </motion.div>
      </BubbleMenu>
    </div>
  );
};
