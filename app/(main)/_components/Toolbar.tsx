/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
  memo,
  ReactNode,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { EditorLike as Editor } from "@/types/editor";
import { toast } from "sonner";

import {
  Bold,
  Italic,
  Underline,
  Link,
  Image as ImageIcon,
  Smile,
  Palette,
  Heading1,
  Heading2,
  Heading3,
  Undo2,
  Redo2,
  Moon,
  Sun,
  Monitor,
  Code,
} from "lucide-react";


import { HelpModal } from "../_components/modals/HelpModal";
import { CustomizeModal } from "../_components/modals/CustomizeModal";
import { LinkDialog } from "../_components/modals/LinkDialog";
import { useDropdownOutsideClick } from "@/hooks/useDropdownOutsideClick";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useTheme } from "../../_components/theme-provider";

interface ToolbarProps {
  editor: Editor | null;
  disabled?: boolean;
  toolbarOrder?: string[];
  toolbarVisibility?: Record<string, boolean>;
  onToolbarOrderChange?: (order: string[]) => void;
  onToolbarVisibilityChange?: (visibility: Record<string, boolean>) => void;
}

const SHORTCUTS = [
  { label: "Bold", shortcut: "Ctrl+B" },
  { label: "Italic", shortcut: "Ctrl+I" },
  { label: "Underline", shortcut: "Ctrl+U" },
  { label: "Insert Link", shortcut: "Ctrl+K" },
  { label: "Undo", shortcut: "Ctrl+Z" },
  { label: "Redo", shortcut: "Ctrl+Y" },
  { label: "Blockquote", shortcut: "Ctrl+Shift+B" },
];

const COLORS = [
  "#000000",
  "#e63946",
  "#f1c40f",
  "#2ecc71",
  "#3498db",
  "#9b59b6",
  "#ffffff",
];

// Reusable toolbar button with tooltip
interface ToolbarButtonProps {
  label: string;
  icon?: React.FC<React.SVGProps<SVGSVGElement>>;
  onClick: () => void;
  isActive?: boolean;
  shortcut?: string;
  disabled?: boolean;
  ariaLabel?: string;
  children?: ReactNode;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = memo(
  ({
    label,
    icon: Icon,
    onClick,
    isActive = false,
    shortcut,
    disabled = false,
    ariaLabel,
    children,
  }) => {
    const tooltipText = shortcut ? `${label} (${shortcut})` : label;
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            aria-label={ariaLabel ?? label}
            aria-pressed={isActive}
            type="button"
            disabled={disabled}
            onClick={onClick}
            className={`
              relative flex items-center justify-center
              w-9 h-9 sm:w-10 sm:h-10 rounded-xl
              transition-all duration-200
              ${
                isActive
                  ? "bg-black/10 dark:bg-white/20 text-black dark:text-white shadow-inner"
                  : "text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white"
              }
              active:scale-95
            `}
          >
            {children ?? (Icon && <Icon className="w-5 h-5" />)}
          </button>
        </TooltipTrigger>
        <TooltipContent className="tooltip-animate bg-black/80 text-white backdrop-blur-md border-0">{tooltipText}</TooltipContent>
      </Tooltip>
    );
  }
);
ToolbarButton.displayName = "ToolbarButton";

type HeadingLevel = 1 | 2 | 3;

const DEFAULT_TOOLBAR_ORDER = [
  "bold",
  "italic",
  "underline",
  "subscript",
  "superscript",
  "heading 1",
  "heading 2",
  "heading 3",
  "insert link",
  "undo",
  "redo",
  "blockquote",
  "code block",
  "checklist",
  "import markdown",
  "emoji",
  "text color",
  "help",
  "theme",
];

const Toolbar: React.FC<ToolbarProps> = memo(
  ({
    editor,
    disabled = false,
    toolbarOrder = [],
    toolbarVisibility = {},
    onToolbarOrderChange,
    onToolbarVisibilityChange,
  }) => {
    const isDisabled = disabled || !editor;
    const { theme, setTheme } = useTheme();

    const effectiveOrder =
      toolbarOrder && toolbarOrder.length > 0
        ? toolbarOrder
        : DEFAULT_TOOLBAR_ORDER;

    const [linkDialogOpen, setLinkDialogOpen] = useState(false);
    const [linkInitialUrl, setLinkInitialUrl] = useState("");
    const [helpModalOpen, setHelpModalOpen] = useState(false);
    const [customizeModalOpen, setCustomizeModalOpen] = useState(false);
    const [colorDropdownOpen, setColorDropdownOpen] = useState(false);
    const [emojiDropdownOpen, setEmojiDropdownOpen] = useState(false);
    const [EmojiPickerModule, setEmojiPickerModule] = useState<any>(null);
    const [emojiDataModule, setEmojiDataModule] = useState<any>(null);

    const colorBtnRef = useRef<HTMLButtonElement>(null);
    const emojiBtnRef = useRef<HTMLButtonElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    useDropdownOutsideClick({
      isOpen: colorDropdownOpen,
      buttonRef: colorBtnRef,
      dropdownId: "color-dropdown-portal",
      onClose: () => setColorDropdownOpen(false),
    });

    useDropdownOutsideClick({
      isOpen: emojiDropdownOpen,
      buttonRef: emojiBtnRef,
      dropdownId: "emoji-dropdown-portal",
      onClose: () => setEmojiDropdownOpen(false),
    });

    useEffect(() => {
      let mounted = true;
      if (emojiDropdownOpen && !EmojiPickerModule) {
        Promise.all([import("@emoji-mart/react"), import("@emoji-mart/data")])
          .then(([pickerMod, dataMod]) => {
            if (!mounted) return;
            setEmojiPickerModule(() => pickerMod.default ?? pickerMod);
            setEmojiDataModule(() => dataMod.default ?? dataMod);
          })
          .catch(() => {});
      }
      return () => {
        mounted = false;
      };
    }, [emojiDropdownOpen, EmojiPickerModule]);

    // Default to center for dock style
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [toolbarAlignment, setToolbarAlignment] = useState<'start' | 'center' | 'end'>('center');

    const runChain = useCallback(
      (fn: (chain: ReturnType<Editor["chain"]>) => void) => {
        if (!editor) return;
        const chain = editor.chain();
        if (!chain) return;
        try { fn(chain); } catch { }
      },
      [editor]
    );

    const getAttr = useCallback(
      (name: string) => {
        try { return editor?.getAttributes(name) ?? {}; } catch { return {}; }
      },
      [editor]
    );

    const handleInsertLink = useCallback(() => {
      const href = (getAttr("link") as any)?.href ?? "";
      setLinkInitialUrl(href);
      setLinkDialogOpen(true);
    }, [getAttr]);

    const handleImageImport = useCallback(() => {
      imageInputRef.current?.click();
    }, []);

    const handleImageUpload = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          const src = event.target?.result as string;
          if (editor) {
            const chain = editor.chain();
            if (chain) { (chain.focus() as any).insertContent(`<img src="${src}" />`).run(); }
          }
        };
        reader.readAsDataURL(file);
        e.target.value = "";
      },
      [editor]
    );

    const formattingButtons = useMemo(
      () => [
        { Icon: Bold, label: "Bold", command: "toggleBold" },
        { Icon: Italic, label: "Italic", command: "toggleItalic" },
        { Icon: Underline, label: "Underline", command: "toggleUnderline" },
      ],
      []
    );

    const headingButtons = useMemo(
      () => [
        { level: 1 as HeadingLevel, Icon: Heading1 },
        { level: 2 as HeadingLevel, Icon: Heading2 },
        { level: 3 as HeadingLevel, Icon: Heading3 },
      ],
      []
    );

    const isVisible = useCallback(
      (id: string) => {
        if (!toolbarVisibility || Object.keys(toolbarVisibility).length === 0) return true;
        return toolbarVisibility[id] !== false;
      },
      [toolbarVisibility]
    );

    const handleSetToolbarOrder = useCallback((order: any) => onToolbarOrderChange?.(typeof order === "function" ? order(toolbarOrder) : order), [onToolbarOrderChange, toolbarOrder]);
    const handleSetToolbarVisibility = useCallback((vis: any) => onToolbarVisibilityChange?.(typeof vis === "function" ? vis(toolbarVisibility) : vis), [onToolbarVisibilityChange, toolbarVisibility]);

    const toggleTheme = () => {
      if (theme === "light") setTheme("dark");
      else if (theme === "dark") setTheme("system");
      else setTheme("light");
    };

    const getThemeIcon = () => {
      if (theme === "light") return <Sun className="w-5 h-5" />;
      if (theme === "dark") return <Moon className="w-5 h-5" />;
      return <Monitor className="w-5 h-5" />;
    };

    return (
      <TooltipProvider delayDuration={0}>
        <motion.div
           initial={{ y: 200, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ type: "spring", stiffness: 260, damping: 20 }}
           className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[99999] max-w-[95vw] sm:max-w-fit hidden md:block"
        >
          <div
            className="
              flex items-center gap-1 sm:gap-2 px-3 py-2
              bg-white/70 dark:bg-black/70 backdrop-blur-2xl
              border border-white/20 dark:border-white/10
              rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)]
              ring-1 ring-black/5 dark:ring-white/5
              overflow-x-auto overflow-y-hidden
              scrollbar-hide
            "
          >
              {/* Group: Rich Text */}
              <div className="flex flex-none items-center gap-1">
                {formattingButtons.map(({ Icon, label, command }) =>
                  isVisible(label.toLowerCase()) ? (
                    <ToolbarButton
                      key={label}
                      label={label}
                      icon={Icon}
                      shortcut={SHORTCUTS.find((s) => s.label === label)?.shortcut}
                      isActive={editor?.isActive(label.toLowerCase()) ?? false}
                      disabled={isDisabled}
                      onClick={() => runChain((c) => (c.focus() as any)[command]().run())}
                    />
                  ) : null
                )}
                {isVisible("insert link") && (
                  <ToolbarButton label="Link" icon={Link} disabled={isDisabled} onClick={handleInsertLink} isActive={editor?.isActive("link")} />
                )}
              </div>

              <div className="w-[1px] h-6 bg-black/10 dark:bg-white/10 mx-1 flex-none" />

              {/* Group: Headings */}
              <div className="flex flex-none items-center gap-1">
                {headingButtons.map(({ level, Icon }) =>
                  isVisible(`heading ${level}`) ? (
                    <ToolbarButton
                      key={`heading-${level}`}
                      label={`H${level}`}
                      icon={Icon}
                      isActive={editor?.isActive("heading", { level }) ?? false}
                      disabled={isDisabled}
                      onClick={() => runChain((c) => (c.focus() as any).toggleHeading({ level }).run())}
                    />
                  ) : null
                )}
              </div>

              <div className="w-[1px] h-6 bg-black/10 dark:bg-white/10 mx-1 flex-none" />

              {/* Group: Blocks */}
              <div className="flex flex-none items-center gap-1">
                {isVisible("blockquote") && (
                  <ToolbarButton label="Quote" disabled={isDisabled} isActive={editor?.isActive("blockquote")} onClick={() => runChain((c) => (c.focus() as any).toggleBlockquote().run())}>
                    <span className="font-serif font-bold text-lg">&quot;</span>
                  </ToolbarButton>
                )}
                {isVisible("code block") && (
                  <ToolbarButton label="Code" icon={Code} disabled={isDisabled} isActive={editor?.isActive("codeBlock")} onClick={() => runChain((c) => (c.focus() as any).toggleCodeBlock().run())} />
                )}
                {/* {isVisible("checklist") && (
                  <ToolbarButton label="Todo" disabled={isDisabled} isActive={editor?.isActive("taskList")} onClick={() => runChain((c) => c.focus().toggleTaskList().run())}>
                    <span className="text-sm">☑</span>
                  </ToolbarButton>
                )} */}
              </div>

              <div className="w-[1px] h-6 bg-black/10 dark:bg-white/10 mx-1 flex-none" />

              {/* Group: Assets */}
              <div className="flex flex-none items-center gap-1">
                {isVisible("image") && <ToolbarButton label="Image" icon={ImageIcon} disabled={isDisabled} onClick={handleImageImport} />}
                <input type="file" accept="image/*" hidden ref={imageInputRef} onChange={handleImageUpload} />
                
                {isVisible("emoji") && (
                  <div className="relative">
                    <button ref={emojiBtnRef} disabled={isDisabled} onClick={() => setEmojiDropdownOpen(!emojiDropdownOpen)}
                      className="w-10 h-10 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400"
                    >
                      <Smile className="w-5 h-5" />
                    </button>
                    <AnimatePresence>
                    {emojiDropdownOpen && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        id="emoji-dropdown-portal" 
                        className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 p-2 bg-white/90 dark:bg-black/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-white/10 z-[10000]"
                      >
                        {EmojiPickerModule ? (
                          <EmojiPickerModule
                            data={emojiDataModule}
                            onEmojiSelect={(emoji: any) => {
                              runChain((c) => (c.focus() as any).insertContent(emoji.native).run());
                              setEmojiDropdownOpen(false);
                            }}
                            theme={theme === 'dark' ? 'dark' : 'light'}
                          />
                        ) : (
                          <div className="p-4 text-xs font-semibold">Loading Emojis...</div>
                        )}
                      </motion.div>
                    )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              <div className="w-[1px] h-6 bg-black/10 dark:bg-white/10 mx-1 flex-none" />

              {/* Group: History & Color */}
              <div className="flex flex-none items-center gap-1">
                {isVisible("undo") && <ToolbarButton label="Undo" icon={Undo2} disabled={isDisabled} onClick={() => runChain((c) => (c.focus() as any).undo().run())} />}
                {isVisible("redo") && <ToolbarButton label="Redo" icon={Redo2} disabled={isDisabled} onClick={() => runChain((c) => (c.focus() as any).redo().run())} />}
                {isVisible("text color") && (
                  <div className="relative">
                    <button ref={colorBtnRef} disabled={isDisabled} onClick={() => setColorDropdownOpen(!colorDropdownOpen)}
                       className="w-10 h-10 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400"
                    >
                      <Palette className="w-5 h-5" />
                    </button>
                    <AnimatePresence>
                    {colorDropdownOpen && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        id="color-dropdown-portal" 
                        className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 p-3 flex gap-2 flex-wrap w-[184px] bg-white/90 dark:bg-black/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-white/10 z-[10000]"
                      >
                        {COLORS.map((color) => (
                           <button key={color} onClick={() => { runChain((c) => (c.focus() as any).setColor(color).run()); setColorDropdownOpen(false); }} style={{ backgroundColor: color }} className="w-6 h-6 rounded-full border border-black/10 hover:scale-110 transition-transform shadow-sm" />
                        ))}
                      </motion.div>
                    )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              <div className="w-[1px] h-6 bg-black/10 dark:bg-white/10 mx-1 flex-none" />

              {/* Group: System */}
              <div className="flex flex-none items-center gap-1">
                {/* <ToolbarButton label="Align" onClick={() => handleAlignmentChange(toolbarAlignment === 'start' ? 'center' : toolbarAlignment === 'center' ? 'end' : 'start')}>
                  {getAlignmentIcon()}
                </ToolbarButton> */}
                {/* <ToolbarButton label="Settings" icon={Settings} onClick={() => setCustomizeModalOpen(true)} /> */}
                {isVisible("theme") && <ToolbarButton label="Theme" onClick={toggleTheme}>{getThemeIcon()}</ToolbarButton>}
                
              </div>
          </div>
        </motion.div>

        <LinkDialog open={linkDialogOpen} initialUrl={linkInitialUrl} onClose={() => setLinkDialogOpen(false)} onSubmit={(url: string) => { runChain((c) => (c.focus() as any).extendMarkRange("link").setLink({ href: url }).run()); setLinkDialogOpen(false); }} />
        <CustomizeModal open={customizeModalOpen} onClose={() => setCustomizeModalOpen(false)} toolbarOrder={effectiveOrder} setToolbarOrder={handleSetToolbarOrder} toolbarVisibility={toolbarVisibility} setToolbarVisibility={handleSetToolbarVisibility} resetToolbarOrder={() => onToolbarOrderChange?.(DEFAULT_TOOLBAR_ORDER)} resetToolbarVisibility={() => onToolbarVisibilityChange?.({})} toast={toast} editor={editor} />
        <HelpModal editor={editor} open={helpModalOpen} onClose={() => setHelpModalOpen(false)} SHORTCUTS={SHORTCUTS} />
      </TooltipProvider>
    );
  }
);

Toolbar.displayName = "Toolbar";
export default Toolbar;
