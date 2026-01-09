"use client";

import React from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  ChevronDown,
  Undo2,
  Redo2,
  Type,
  Code,
  Terminal,
  Palette,
  CheckSquare,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Minus,
  Trash2,
  Plus,
  Pipette
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Editor } from "@tiptap/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface EditorToolbarProps {
  editor: Editor | null;
  onFileUpload?: (file: File) => Promise<void>;
}

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

function EditorToolbar({ editor, onFileUpload }: EditorToolbarProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  if (!editor) return null;

  const handleAddLink = () => {
    const url = window.prompt('Enter URL', '');
    if (url === null) return; // Cancelled
    if (url === '') {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const handleAddImage = () => {
    if (onFileUpload && fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      // Fallback to URL if upload not available
      const url = window.prompt('Enter image URL', '');
      if (url === null) return;
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileUpload) {
      await onFileUpload(file);
      // Reset input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="inline-flex z-40 items-center justify-start gap-1 p-1 pb-2 rounded-xl border border-black/5 dark:border-white/5 bg-white/80 dark:bg-[#0b0c14]/80 backdrop-blur-xl shadow-sm transition-all duration-300 overflow-x-auto toolbar-scrollbar">
      {/* Hidden file input for image uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {/* Undo/Redo */}
      <div className="flex items-center gap-0.5 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-all hover:scale-110 active:scale-95"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-all hover:scale-110 active:scale-95"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-4 bg-black/10 dark:bg-white/10 mx-1 flex-shrink-0" />

      {/* Headings - Direct buttons on large screens, dropdown on small/medium */}
      <div className="hidden lg:flex items-center gap-0.5 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 w-8 p-0 transition-all hover:scale-110 active:scale-95",
            editor.isActive("heading", { level: 1 })
              ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30"
              : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          title="Heading 1"
        >
          <Heading1 className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 w-8 p-0 transition-all hover:scale-110 active:scale-95",
            editor.isActive("heading", { level: 2 })
              ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30"
              : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading 2"
        >
          <Heading2 className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 w-8 p-0 transition-all hover:scale-110 active:scale-95",
            editor.isActive("heading", { level: 3 })
              ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30"
              : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Heading 3"
        >
          <Heading3 className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Headings Dropdown for small/medium screens */}
      <div className="lg:hidden flex-shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 gap-1.5 px-2 text-xs font-medium transition-all hover:bg-slate-100 dark:hover:bg-slate-800 flex-shrink-0",
                (editor.isActive("heading") || editor.isActive("blockquote") || editor.isActive("codeBlock")) 
                  ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30" 
                  : "text-slate-500"
              )}
            >
              <Type className="w-3.5 h-3.5" />
              <ChevronDown className="w-3 h-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52 p-1 glass-panel">
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={cn("rounded-lg", editor.isActive("heading", { level: 1 }) && "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600")}>
              <Heading1 className="w-4 h-4 mr-2" /> Heading 1
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={cn("rounded-lg", editor.isActive("heading", { level: 2 }) && "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600")}>
              <Heading2 className="w-4 h-4 mr-2" /> Heading 2
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={cn("rounded-lg", editor.isActive("heading", { level: 3 }) && "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600")}>
              <Heading3 className="w-4 h-4 mr-2" /> Heading 3
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-black/5 dark:bg-white/5" />
            <DropdownMenuItem onClick={() => editor.chain().focus().setParagraph().run()} className="rounded-lg">
              <Type className="w-4 h-4 mr-2" /> Paragraph
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Separator orientation="vertical" className="h-4 bg-black/10 dark:bg-white/10 mx-1 flex-shrink-0 hidden lg:block" />

      {/* Text Formatting - Direct buttons on large screens */}
      <div className="hidden lg:flex items-center gap-0.5 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 w-8 p-0 transition-all hover:scale-110 active:scale-95",
            editor.isActive("bold")
              ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30"
              : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 w-8 p-0 transition-all hover:scale-110 active:scale-95",
            editor.isActive("italic")
              ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30"
              : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 w-8 p-0 transition-all hover:scale-110 active:scale-95",
            editor.isActive("underline")
              ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30"
              : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Underline (Ctrl+U)"
        >
          <Underline className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 w-8 p-0 transition-all hover:scale-110 active:scale-95",
            editor.isActive("strike")
              ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30"
              : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Strikethrough"
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 w-8 p-0 transition-all hover:scale-110 active:scale-95",
            editor.isActive("code")
              ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30"
              : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
          onClick={() => editor.chain().focus().toggleCode().run()}
          title="Inline Code"
        >
          <Code className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Text Formatting Dropdown for small/medium screens */}
      <div className="lg:hidden flex-shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 gap-1.5 px-2 text-xs font-medium transition-all hover:bg-slate-100 dark:hover:bg-slate-800 flex-shrink-0",
                (editor.isActive("bold") || editor.isActive("italic") || editor.isActive("underline") || editor.isActive("strike") || editor.isActive("code")) 
                  ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30" 
                  : "text-slate-500"
              )}
            >
              <Bold className="w-3.5 h-3.5" />
              <ChevronDown className="w-3 h-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52 p-1 glass-panel">
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleBold().run()} className={cn("rounded-lg", editor.isActive("bold") && "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600")}>
              <Bold className="w-4 h-4 mr-2" /> Bold <span className="ml-auto text-[10px] text-slate-400">Ctrl+B</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleItalic().run()} className={cn("rounded-lg", editor.isActive("italic") && "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600")}>
              <Italic className="w-4 h-4 mr-2" /> Italic <span className="ml-auto text-[10px] text-slate-400">Ctrl+I</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleUnderline().run()} className={cn("rounded-lg", editor.isActive("underline") && "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600")}>
              <Underline className="w-4 h-4 mr-2" /> Underline <span className="ml-auto text-[10px] text-slate-400">Ctrl+U</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleStrike().run()} className={cn("rounded-lg", editor.isActive("strike") && "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600")}>
              <Strikethrough className="w-4 h-4 mr-2" /> Strikethrough
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleCode().run()} className={cn("rounded-lg", editor.isActive("code") && "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600")}>
              <Code className="w-4 h-4 mr-2" /> Inline Code
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Separator orientation="vertical" className="h-4 bg-black/10 dark:bg-white/10 mx-1 flex-shrink-0" />

      {/* Lists - Direct buttons on large screens */}
      <div className="hidden lg:flex items-center gap-0.5 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 w-8 p-0 transition-all hover:scale-110 active:scale-95",
            editor.isActive("bulletList")
              ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30"
              : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet List"
        >
          <List className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 w-8 p-0 transition-all hover:scale-110 active:scale-95",
            editor.isActive("orderedList")
              ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30"
              : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Ordered List"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 w-8 p-0 transition-all hover:scale-110 active:scale-95",
            editor.isActive("taskList")
              ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30"
              : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          title="Task List"
        >
          <CheckSquare className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 w-8 p-0 transition-all hover:scale-110 active:scale-95",
            editor.isActive("blockquote")
              ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30"
              : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Blockquote"
        >
          <Quote className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 w-8 p-0 transition-all hover:scale-110 active:scale-95",
            editor.isActive("codeBlock")
              ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30"
              : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          title="Code Block"
        >
          <Terminal className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Lists Dropdown for small/medium screens */}
      <div className="lg:hidden flex-shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 gap-1.5 px-2 text-xs font-medium transition-all hover:bg-slate-100 dark:hover:bg-slate-800 flex-shrink-0",
                (editor.isActive("bulletList") || editor.isActive("orderedList") || editor.isActive("taskList") || editor.isActive("blockquote") || editor.isActive("codeBlock")) 
                  ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30" 
                  : "text-slate-500"
              )}
            >
              <List className="w-3.5 h-3.5" />
              <ChevronDown className="w-3 h-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52 p-1 glass-panel">
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleBulletList().run()} className={cn("rounded-lg", editor.isActive("bulletList") && "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600")}>
              <List className="w-4 h-4 mr-2" /> Bullet List
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleOrderedList().run()} className={cn("rounded-lg", editor.isActive("orderedList") && "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600")}>
              <ListOrdered className="w-4 h-4 mr-2" /> Ordered List
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleTaskList().run()} className={cn("rounded-lg", editor.isActive("taskList") && "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600")}>
              <CheckSquare className="w-4 h-4 mr-2" /> Task List
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-black/5 dark:bg-white/5" />
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleBlockquote().run()} className={cn("rounded-lg", editor.isActive("blockquote") && "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600")}>
              <Quote className="w-4 h-4 mr-2" /> Blockquote
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={cn("rounded-lg", editor.isActive("codeBlock") && "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600")}>
              <Terminal className="w-4 h-4 mr-2" /> Code Block
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Separator orientation="vertical" className="h-4 bg-black/10 dark:bg-white/10 mx-1 flex-shrink-0" />

      {/* Alignment Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 gap-1.5 px-2 text-xs font-medium transition-all hover:bg-slate-100 dark:hover:bg-slate-800 flex-shrink-0",
              (editor.isActive({ textAlign: "center" }) || editor.isActive({ textAlign: "right" })) 
                ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30" 
                : "text-slate-500"
            )}
          >
            <AlignLeft className="w-3.5 h-3.5" />
            <ChevronDown className="w-3 h-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48 p-1 glass-panel">
          <DropdownMenuItem 
            onClick={() => editor.chain().focus().setTextAlign("left").run()} 
            className={cn("rounded-lg", editor.isActive({ textAlign: "left" }) && "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600")}
          >
            <AlignLeft className="w-4 h-4 mr-2" /> Align Left
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => editor.chain().focus().setTextAlign("center").run()} 
            className={cn("rounded-lg", editor.isActive({ textAlign: "center" }) && "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600")}
          >
            <AlignCenter className="w-4 h-4 mr-2" /> Align Center
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => editor.chain().focus().setTextAlign("right").run()} 
            className={cn("rounded-lg", editor.isActive({ textAlign: "right" }) && "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600")}
          >
            <AlignRight className="w-4 h-4 mr-2" /> Align Right
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Color Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 gap-1.5 px-2 text-xs font-medium transition-all hover:bg-slate-100 dark:hover:bg-slate-800 flex-shrink-0",
              (editor.isActive("textStyle") || editor.isActive("highlight")) 
                ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30" 
                : "text-slate-500"
            )}
          >
            <Palette className="w-3.5 h-3.5" />
            <ChevronDown className="w-3 h-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64 p-3 glass-panel space-y-4">
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
          
          <DropdownMenuSeparator className="bg-black/5 dark:bg-white/5" />
          <button
            onClick={() => editor.chain().focus().unsetColor().unsetHighlight().run()}
            className="w-full flex items-center justify-center gap-2 py-1.5 px-2 text-[11px] font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Reset Colors
          </button>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Insert Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 px-2 text-xs font-medium transition-all hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 flex-shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <ChevronDown className="w-3 h-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-52 p-1 glass-panel">
          <DropdownMenuItem onClick={handleAddLink} className="rounded-lg">
            <LinkIcon className="w-4 h-4 mr-2 text-indigo-500" /> Link
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleAddImage} className="rounded-lg">
            <ImageIcon className="w-4 h-4 mr-2 text-blue-500" /> Image
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-black/5 dark:bg-white/5" />
          <DropdownMenuItem onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} className="rounded-lg">
            <TableIcon className="w-4 h-4 mr-2 text-emerald-500" /> Table
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().setHorizontalRule().run()} className="rounded-lg">
            <Minus className="w-4 h-4 mr-2 text-slate-400" /> Horizontal Rule
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default React.memo(EditorToolbar);
