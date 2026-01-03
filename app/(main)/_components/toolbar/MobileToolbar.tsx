"use client";

import { Undo, Redo, Bold, Italic, Link, Heading1, Quote, Image as ImageIcon, Check, X, Type, List, CheckSquare, Palette, Pipette, Trash2 } from "lucide-react";
import { Editor } from "@tiptap/react";
import { ToolbarAction } from "./ToolbarAction";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "usehooks-ts";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

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

interface MobileToolbarProps {
  editor: Editor | null;
}

export const MobileToolbar = ({ editor }: MobileToolbarProps) => {
  const [showInput, setShowInput] = useState<'link' | 'image' | null>(null);
  const [inputValue, setInputValue] = useState("");
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!editor || !mounted || !isMobile) {
    return null;
  }

  const handleInputSubmit = () => {
    if (showInput === 'link') {
      if (inputValue) {
        editor.chain().focus().setLink({ href: inputValue }).run();
      } else {
        editor.chain().focus().unsetLink().run();
      }
    } else if (showInput === 'image') {
      if (inputValue) {
        editor.chain().focus().setImage({ src: inputValue }).run();
      }
    }
    setShowInput(null);
    setInputValue("");
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-fit max-w-[95vw]">
      <AnimatePresence mode="wait">
        {showInput && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="flex items-center gap-2 p-2 rounded-2xl bg-white/80 dark:bg-[#0b0c14]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-2xl mb-4"
          >
            <div className="relative flex-1">
               {showInput === 'link' ? <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-500" /> : <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />}
               <Input 
                autoFocus
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={showInput === 'link' ? "Paste link..." : "Paste image URL..."}
                className="h-10 pl-10 pr-2 bg-black/5 dark:bg-white/5 border-none text-sm font-medium w-56 rounded-xl focus-visible:ring-indigo-500/20"
                onKeyDown={(e) => e.key === 'Enter' && handleInputSubmit()}
              />
            </div>
            <div className="flex gap-1.5">
               <Button size="icon" className="h-10 w-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/20" onClick={handleInputSubmit}>
                <Check className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-10 w-10 text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl" onClick={() => setShowInput(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ y: 50, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="bg-white/80 dark:bg-[#0b0c14]/80 backdrop-blur-2xl border border-black/5 dark:border-white/10 p-1.5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3),0_0_20px_rgba(99,102,241,0.1)] flex gap-1 items-center px-4 relative group/mobile-toolbar overflow-visible h-12"
      >
        {/* Subtle Glow Effect */}
        <div className="absolute -inset-[1px] bg-gradient-to-r from-indigo-500/0 via-indigo-500/30 to-indigo-500/0 rounded-2xl opacity-100 animate-pulse pointer-events-none" />

        <div className="flex items-center gap-1.5 relative z-10">
          <ToolbarAction
            label="Undo"
            icon={Undo}
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          />
          <ToolbarAction
            label="Redo"
            icon={Redo}
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          />
        </div>

        <Separator orientation="vertical" className="h-5 bg-black/10 dark:bg-white/10 mx-2 flex-shrink-0 relative z-10" />

        <div className="flex items-center gap-1 relative z-10">
          <ToolbarAction
            label="Bold"
            icon={Bold}
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
          />
          <ToolbarAction
            label="Italic"
            icon={Italic}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
          />
          
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                "h-8 w-8 flex items-center justify-center rounded-lg transition-all duration-300 hover:scale-110 active:scale-95",
                (editor.isActive("heading") || editor.isActive("blockquote")) ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 shadow-inner" : "text-slate-500 hover:bg-black/5 dark:hover:bg-white/5"
              )}>
                <Type className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="glass-panel w-44 p-1 animate-in slide-in-from-bottom-2 duration-300" side="top" sideOffset={16} align="center">
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className="rounded-lg h-9">
                <Heading1 className="h-4 w-4 mr-2 text-indigo-500" /> Heading 1
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleBlockquote().run()} className="rounded-lg h-9">
                <Quote className="h-4 w-4 mr-2 text-indigo-500" /> Blockquote
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

           <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                "h-8 w-8 flex items-center justify-center rounded-lg transition-all duration-300 hover:scale-110 active:scale-95",
                (editor.isActive("bulletList") || editor.isActive("orderedList") || editor.isActive("taskList")) ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 shadow-inner" : "text-slate-500 hover:bg-black/5 dark:hover:bg-white/5"
              )}>
                <List className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="glass-panel w-44 p-1 animate-in slide-in-from-bottom-2 duration-300" side="top" sideOffset={16} align="center">
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleBulletList().run()} className="rounded-lg h-9">
                <List className="h-4 w-4 mr-2 text-indigo-500" /> Bullet List
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleTaskList().run()} className="rounded-lg h-9">
                <CheckSquare className="h-4 w-4 mr-2 text-indigo-500" /> Task List
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ToolbarAction
            label="Link"
            icon={Link}
            onClick={() => {
              setShowInput('link');
              setInputValue(editor.getAttributes('link').href || "");
            }}
            isActive={editor.isActive("link")}
          />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                "h-8 w-8 flex items-center justify-center rounded-lg transition-all",
                (editor.isActive("textStyle") || editor.isActive("highlight")) ? "text-indigo-500 bg-indigo-500/10" : "text-slate-500 hover:bg-black/5"
              )}>
                <Palette className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="glass-panel w-64 p-3 space-y-4" side="top" sideOffset={12}>
              <div>
                <div className="flex items-center gap-2 mb-2 px-1">
                  <Type className="w-3 h-3 text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Text</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {TEXT_COLORS.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => c.color ? editor.chain().focus().setColor(c.color).run() : editor.chain().focus().unsetColor().run()}
                      className={cn(
                        "w-8 h-8 rounded-lg transition-all border-2",
                        editor.getAttributes("textStyle").color === c.color ? "border-indigo-500" : "border-transparent",
                        c.class
                      )}
                    />
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2 px-1">
                  <Pipette className="w-3 h-3 text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Highlight</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {HIGHLIGHT_COLORS.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => editor.chain().focus().setHighlight({ color: c.color }).run()}
                      className={cn(
                        "w-8 h-8 rounded-lg transition-all border-2",
                        editor.isActive("highlight", { color: c.color }) ? "border-indigo-500" : "border-transparent",
                        c.class
                      )}
                    />
                  ))}
                </div>
              </div>
              <DropdownMenuSeparator className="bg-black/5 dark:bg-white/5" />
              <button
                onClick={() => editor.chain().focus().unsetColor().unsetHighlight().run()}
                className="w-full flex items-center justify-center gap-2 py-1.5 text-[11px] font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Reset
              </button>
            </DropdownMenuContent>
          </DropdownMenu>

          <ToolbarAction
            label="Image"
            icon={ImageIcon}
            onClick={() => setShowInput('image')}
          />
        </div>
      </motion.div>
    </div>
  );
};
