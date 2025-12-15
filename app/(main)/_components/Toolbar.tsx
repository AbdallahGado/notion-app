/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
  KeyboardEvent,
  ReactNode,
  memo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Editor } from "@tiptap/react";
import { toast } from "sonner";
import { showErrorToast } from "@/components/ui/ErrorToast";

import {
  Bold,
  Italic,
  Underline,
  Link,
  UploadCloud,
  Image as ImageIcon,
  Smile,
  Palette,
  Settings,
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

// Lazy-load Emoji Picker to reduce initial bundle size

import { Button } from "@/components/ui/button";
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

const groupStyle =
  "flex gap-1 px-1 sm:px-2 py-1 bg-transparent rounded-lg flex-wrap sm:flex-nowrap";

// Animation variants for mobile toolbar groups
const mobileGroupVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: index * 0.1,
      duration: 0.3,
      ease: "easeOut",
    },
  }),
  exit: { opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.2 } },
};

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
          <Button
            aria-label={ariaLabel ?? label}
            aria-pressed={isActive}
            variant={isActive ? "default" : "ghost"}
            size="icon"
            type="button"
            disabled={disabled}
            onClick={onClick}
          >
            {children ?? (Icon && <Icon className="w-4 h-4" />)}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{tooltipText}</TooltipContent>
      </Tooltip>
    );
  }
);
ToolbarButton.displayName = "ToolbarButton";

type HeadingLevel = 1 | 2 | 3;

// Default order of tools
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

    // Ensure we have a valid order list for the modal
    const effectiveOrder =
      toolbarOrder && toolbarOrder.length > 0
        ? toolbarOrder
        : DEFAULT_TOOLBAR_ORDER;

    // State for modals and dropdowns
    const [linkDialogOpen, setLinkDialogOpen] = useState(false);
    const [linkInitialUrl, setLinkInitialUrl] = useState("");
    const [helpModalOpen, setHelpModalOpen] = useState(false);
    const [customizeModalOpen, setCustomizeModalOpen] = useState(false);
    const [colorDropdownOpen, setColorDropdownOpen] = useState(false);
    const [emojiDropdownOpen, setEmojiDropdownOpen] = useState(false);
    const [EmojiPickerModule, setEmojiPickerModule] = useState<any>(null);
    const [emojiDataModule, setEmojiDataModule] = useState<any>(null);

    // Refs for dropdown buttons and file input
    const colorBtnRef = useRef<HTMLButtonElement>(null);
    const emojiBtnRef = useRef<HTMLButtonElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    // Close dropdowns on outside click
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

    // Load emoji picker only when the dropdown is opened for the first time
    useEffect(() => {
      let mounted = true;
      if (emojiDropdownOpen && !EmojiPickerModule) {
        Promise.all([import("@emoji-mart/react"), import("@emoji-mart/data")])
          .then(([pickerMod, dataMod]) => {
            if (!mounted) return;
            setEmojiPickerModule(() => pickerMod.default ?? pickerMod);
            setEmojiDataModule(() => dataMod.default ?? dataMod);
          })
          .catch((err) => console.error("Failed to load emoji picker:", err));
      }
      return () => {
        mounted = false;
      };
    }, [emojiDropdownOpen, EmojiPickerModule]);

    // Helper: safely run editor chain commands
    const runChain = useCallback(
      (fn: (chain: ReturnType<Editor["chain"]>) => void) => {
        if (!editor) return;
        const chain = editor.chain();
        if (!chain) return;
        try {
          fn(chain);
        } catch (error) {
          console.error("Editor command failed:", error);
        }
      },
      [editor]
    );

    // Get attribute safely
    const getAttr = useCallback(
      (name: string) => {
        try {
          return editor?.getAttributes(name) ?? {};
        } catch {
          return {};
        }
      },
      [editor]
    );

    // Handle Insert Link button click
    const handleInsertLink = useCallback(() => {
      const href = getAttr("link").href ?? "";
      setLinkInitialUrl(href);
      setLinkDialogOpen(true);
    }, [getAttr]);

    // Handle file import button click
    const handleFileImport = useCallback(() => {
      fileInputRef.current?.click();
    }, []);

    const handleImageImport = useCallback(() => {
      imageInputRef.current?.click();
    }, []);

    // Handle markdown file upload
    const handleMarkdownFile = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          if (editor?.commands.setContent) {
            try {
              editor.commands.setContent(text);
              toast.success("Markdown file imported successfully");
            } catch (error) {
              console.error("Failed to import markdown file:", error);
              showErrorToast({
                message: "Import Failed",
                description:
                  "Failed to import the markdown file. Please check the file format and try again.",
                onRetry: () =>
                  handleMarkdownFile({ target: { files: [file] } } as any),
              });
            }
          }
        };
        reader.readAsText(file);
        e.target.value = ""; // Reset input to allow re-upload same file
      },
      [editor]
    );

    const handleImageUpload = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          const src = event.target?.result as string;
          if (editor) {
            editor.chain().focus().setImage({ src }).run();
          }
        };
        reader.readAsDataURL(file);
        e.target.value = "";
      },
      [editor]
    );

    // Keyboard shortcuts support (Ctrl+B, Ctrl+I, etc.)
    useEffect(() => {
      if (!editor) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey || e.metaKey) {
          switch (e.key.toLowerCase()) {
            case "b":
              e.preventDefault();
              runChain((c) => c.focus().toggleBold().run());
              break;
            case "i":
              e.preventDefault();
              runChain((c) => c.focus().toggleItalic().run());
              break;
            case "u":
              e.preventDefault();
              runChain((c) => c.focus().toggleUnderline().run());
              break;
            case "k":
              e.preventDefault();
              handleInsertLink();
              break;
            case "z":
              e.preventDefault();
              runChain((c) => c.focus().undo().run());
              break;
            case "y":
              e.preventDefault();
              runChain((c) => c.focus().redo().run());
              break;
            default:
              break;
          }
        }
      };

      document.addEventListener(
        "keydown",
        handleKeyDown as unknown as EventListener
      );
      return () => {
        document.removeEventListener(
          "keydown",
          handleKeyDown as unknown as EventListener
        );
      };
    }, [editor, runChain, handleInsertLink]);

    // Memoized button groups for performance
    const formattingButtons = useMemo(
      () => [
        { Icon: Bold, label: "Bold", command: "toggleBold" },
        { Icon: Italic, label: "Italic", command: "toggleItalic" },
        { Icon: Underline, label: "Underline", command: "toggleUnderline" },
      ],
      []
    );

    const headingButtons: {
      level: HeadingLevel;
      Icon: React.FC<React.SVGProps<SVGSVGElement>>;
    }[] = useMemo(
      () => [
        { level: 1, Icon: Heading1 },
        { level: 2, Icon: Heading2 },
        { level: 3, Icon: Heading3 },
      ],
      []
    );

    // Wrap setToolbarOrder to accept updater function or value
    const handleSetToolbarOrder = useCallback(
      (order: string[] | ((order: string[]) => string[])) => {
        if (!onToolbarOrderChange) return;
        if (typeof order === "function") {
          onToolbarOrderChange(order(toolbarOrder));
        } else {
          onToolbarOrderChange(order);
        }
      },
      [onToolbarOrderChange, toolbarOrder]
    );

    // Wrap setToolbarVisibility to accept updater function or value
    const handleSetToolbarVisibility = useCallback(
      (
        visibility:
          | Record<string, boolean>
          | ((visibility: Record<string, boolean>) => Record<string, boolean>)
      ) => {
        if (!onToolbarVisibilityChange) return;
        if (typeof visibility === "function") {
          onToolbarVisibilityChange(visibility(toolbarVisibility));
        } else {
          onToolbarVisibilityChange(visibility);
        }
      },
      [onToolbarVisibilityChange, toolbarVisibility]
    );

    // Helper to check visibility
    const isVisible = useCallback(
      (id: string) => {
        // If visibility map is empty, everything is visible
        if (!toolbarVisibility || Object.keys(toolbarVisibility).length === 0)
          return true;
        // Otherwise, check specific key. Default to true if undefined.
        return toolbarVisibility[id] !== false;
      },
      [toolbarVisibility]
    );

    const toggleTheme = () => {
      if (theme === "light") setTheme("dark");
      else if (theme === "dark") setTheme("system");
      else setTheme("light");
    };

    const getThemeIcon = () => {
      if (theme === "light") return <Sun className="w-4 h-4" />;
      if (theme === "dark") return <Moon className="w-4 h-4" />;
      return <Monitor className="w-4 h-4" />;
    };

    return (
      <TooltipProvider>
        <div
          role="toolbar"
          aria-label="Editor toolbar"
          className="toolbar-wrapper p-2 glass-panel rounded-xl shadow-lg flex gap-1 sm:gap-2 flex-wrap sm:flex-nowrap items-center relative z-10 overflow-x-auto dark:text-white"
        >
          {/* Formatting */}
          <AnimatePresence>
            <motion.div
              key="formatting-group"
              className={`${groupStyle} border-r border-zinc-300 dark:border-zinc-700 pr-2`}
              variants={mobileGroupVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              custom={0}
            >
              {formattingButtons.map(({ Icon, label, command }) =>
                isVisible(label.toLowerCase()) ? (
                  <ToolbarButton
                    key={label}
                    label={label}
                    icon={Icon}
                    shortcut={
                      SHORTCUTS.find((s) => s.label === label)?.shortcut
                    }
                    isActive={editor?.isActive(label.toLowerCase()) ?? false}
                    disabled={isDisabled}
                    onClick={() =>
                      runChain((c) => (c.focus() as any)[command]().run())
                    }
                  />
                ) : null
              )}
            </motion.div>
          </AnimatePresence>

          {/* Subscript / Superscript */}
          <AnimatePresence>
            <motion.div
              key="subscript-group"
              className={`${groupStyle} border-r border-zinc-300 dark:border-zinc-700 pr-2`}
              variants={mobileGroupVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              custom={1}
            >
              {isVisible("subscript") && (
                <ToolbarButton
                  label="Subscript"
                  shortcut={
                    SHORTCUTS.find((s) => s.label === "Subscript")?.shortcut
                  }
                  isActive={editor?.isActive("subscript") ?? false}
                  disabled={isDisabled}
                  onClick={() =>
                    runChain((c) => c.focus(undefined).toggleSubscript().run())
                  }
                >
                  <span className="text-xs select-none">Sub</span>
                </ToolbarButton>
              )}

              {isVisible("superscript") && (
                <ToolbarButton
                  label="Superscript"
                  shortcut={
                    SHORTCUTS.find((s) => s.label === "Superscript")?.shortcut
                  }
                  isActive={editor?.isActive("superscript") ?? false}
                  disabled={isDisabled}
                  onClick={() =>
                    runChain((c) =>
                      c.focus(undefined).toggleSuperscript().run()
                    )
                  }
                >
                  <span className="text-xs select-none">Sup</span>
                </ToolbarButton>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Headings */}
          <AnimatePresence>
            <motion.div
              key="headings-group"
              className={groupStyle}
              variants={mobileGroupVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              custom={2}
            >
              {headingButtons.map(({ level, Icon }) =>
                isVisible(`heading ${level}`) ? (
                  <ToolbarButton
                    key={`heading-${level}`}
                    label={`Heading ${level}`}
                    icon={Icon}
                    isActive={editor?.isActive("heading", { level }) ?? false}
                    disabled={isDisabled}
                    onClick={() =>
                      runChain((c) =>
                        c.focus(undefined).toggleHeading({ level }).run()
                      )
                    }
                  />
                ) : null
              )}
            </motion.div>
          </AnimatePresence>

          {/* Link */}
          <AnimatePresence>
            <motion.div
              key="link-group"
              className={groupStyle}
              variants={mobileGroupVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              custom={3}
            >
              {isVisible("insert link") && (
                <>
                  <ToolbarButton
                    label="Insert Link"
                    icon={Link}
                    disabled={isDisabled}
                    onClick={handleInsertLink}
                  />
                  <LinkDialog
                    open={linkDialogOpen}
                    initialUrl={linkInitialUrl}
                    onClose={() => setLinkDialogOpen(false)}
                    onSubmit={(url: string) => {
                      runChain((c) =>
                        c
                          .focus(undefined)
                          .extendMarkRange("link")
                          .setLink({ href: url })
                          .run()
                      );
                      setLinkDialogOpen(false);
                    }}
                  />
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Undo / Redo */}
          <AnimatePresence>
            <motion.div
              key="undo-redo-group"
              className={groupStyle}
              variants={mobileGroupVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              custom={4}
            >
              {isVisible("undo") && (
                <ToolbarButton
                  label="Undo"
                  icon={Undo2}
                  disabled={isDisabled}
                  onClick={() =>
                    runChain((c) => c.focus(undefined).undo().run())
                  }
                />
              )}
              {isVisible("redo") && (
                <ToolbarButton
                  label="Redo"
                  icon={Redo2}
                  disabled={isDisabled}
                  onClick={() =>
                    runChain((c) => c.focus(undefined).redo().run())
                  }
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Block-level / other actions */}
          <AnimatePresence>
            <motion.div
              key="block-actions-group"
              className={groupStyle}
              variants={mobileGroupVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              custom={5}
            >
              {isVisible("blockquote") && (
                <ToolbarButton
                  label="Blockquote"
                  disabled={isDisabled}
                  isActive={editor?.isActive("blockquote") ?? false}
                  onClick={() =>
                    runChain((c) =>
                      c.focus(undefined).toggleBlockquote().run()
                    )
                  }
                >
                  <span className="text-sm select-none">❝</span>
                </ToolbarButton>
              )}

              {isVisible("code block") && (
                <ToolbarButton
                  label="Code Block"
                  icon={Code}
                  disabled={isDisabled}
                  isActive={editor?.isActive("codeBlock") ?? false}
                  onClick={() =>
                    runChain((c) => c.focus(undefined).toggleCodeBlock().run())
                  }
                />
              )}

              {/* Divider is not customizable? */}
              {/* <ToolbarButton label="Divider" disabled onClick={() => {}}>
                <span className="text-sm select-none">―</span>
              </ToolbarButton> */}

              {isVisible("checklist") && (
                <ToolbarButton
                  label="Checklist"
                  disabled={isDisabled}
                  isActive={editor?.isActive("taskList") ?? false}
                  onClick={() =>
                    runChain((c) => c.focus(undefined).toggleTaskList().run())
                  }
                >
                  <span className="text-xs select-none">☑</span>
                </ToolbarButton>
              )}
            </motion.div>
          </AnimatePresence>

          {/* File Upload */}
          <AnimatePresence>
            <motion.div
              key="file-upload-group"
              className={groupStyle}
              variants={mobileGroupVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              custom={6}
            >
              {(isVisible("import markdown") || isVisible("image")) && (
                <>
                  {isVisible("import markdown") && (
                    <>
                      <ToolbarButton
                        label="Import Markdown"
                        icon={UploadCloud}
                        disabled={isDisabled}
                        onClick={handleFileImport}
                      />
                      <input
                        type="file"
                        accept=".md"
                        hidden
                        ref={fileInputRef}
                        onChange={handleMarkdownFile}
                        aria-hidden="true"
                        tabIndex={-1}
                      />
                    </>
                  )}
                  {isVisible("image") && (
                    <>
                      <ToolbarButton
                        label="Insert Image"
                        icon={ImageIcon}
                        disabled={isDisabled}
                        onClick={handleImageImport}
                      />
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        ref={imageInputRef}
                        onChange={handleImageUpload}
                        aria-hidden="true"
                        tabIndex={-1}
                      />
                    </>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Emoji / Color */}
          <AnimatePresence>
            <motion.div
              key="emoji-color-group"
              className={`${groupStyle} relative`}
              variants={mobileGroupVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              custom={7}
            >
              {isVisible("emoji") && (
                <>
                  <Button
                    aria-label="Emoji picker"
                    aria-haspopup="menu"
                    aria-expanded={emojiDropdownOpen}
                    variant="ghost"
                    size="icon"
                    ref={emojiBtnRef}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => setEmojiDropdownOpen((open) => !open)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setEmojiDropdownOpen((open) => !open);
                      }
                    }}
                  >
                    <Smile className="w-4 h-4" />
                  </Button>
                  {emojiDropdownOpen && (
                    <div
                      id="emoji-dropdown-portal"
                      className="absolute z-50 mt-2 bg-white dark:bg-zinc-800 border rounded shadow p-1 max-w-xs max-h-64 overflow-auto"
                      style={{ top: "100%", left: 0 }}
                      role="menu"
                      aria-label="Emoji picker"
                    >
                      {EmojiPickerModule ? (
                        <EmojiPickerModule
                          data={emojiDataModule}
                          onEmojiSelect={(emoji: { native?: string }) => {
                            runChain((c) =>
                              c
                                .focus(undefined)
                                .insertContent(emoji.native ?? "")
                                .run()
                            );
                            setEmojiDropdownOpen(false);
                          }}
                          theme="light"
                        />
                      ) : (
                        <div className="p-4 text-sm">Loading emojis…</div>
                      )}
                    </div>
                  )}
                </>
              )}

              {isVisible("text color") && (
                <>
                  <Button
                    aria-label="Text color picker"
                    aria-haspopup="menu"
                    aria-expanded={colorDropdownOpen}
                    variant="ghost"
                    size="icon"
                    ref={colorBtnRef}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => setColorDropdownOpen((open) => !open)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setColorDropdownOpen((open) => !open);
                      }
                    }}
                  >
                    <Palette className="w-4 h-4" />
                  </Button>
                  {colorDropdownOpen && (
                    <div
                      id="color-dropdown-portal"
                      className="absolute z-50 mt-2 p-2 bg-white dark:bg-zinc-800 border rounded shadow flex gap-1"
                      role="menu"
                      aria-label="Text color picker"
                    >
                      {COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => {
                            runChain((c) =>
                              c.focus(undefined).setColor(color).run()
                            );
                            setColorDropdownOpen(false);
                          }}
                          style={{ backgroundColor: color }}
                          className="w-5 h-5 rounded-full border border-black/20 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
                          aria-label={`Set text color to ${color}`}
                          type="button"
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Settings & Help */}
          <AnimatePresence>
            <motion.div
              key="settings-group"
              className={groupStyle}
              variants={mobileGroupVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              custom={8}
            >
              {isVisible("help") && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    disabled={isDisabled}
                    aria-label="Help"
                    onClick={() => setHelpModalOpen(true)}
                  >
                    ?
                  </Button>
                  <HelpModal
                    editor={editor}
                    open={helpModalOpen}
                    onClose={() => setHelpModalOpen(false)}
                    SHORTCUTS={SHORTCUTS}
                  />
                </>
              )}
              {/* Settings and Theme are always visible as they control the customization itself */}
              <Button
                variant="ghost"
                size="icon"
                type="button"
                disabled={isDisabled}
                aria-label="Customize toolbar"
                onClick={() => setCustomizeModalOpen(true)}
              >
                <Settings className="w-4 h-4" />
              </Button>
              <CustomizeModal
                open={customizeModalOpen}
                onClose={() => setCustomizeModalOpen(false)}
                toolbarOrder={effectiveOrder}
                setToolbarOrder={handleSetToolbarOrder}
                toolbarVisibility={toolbarVisibility}
                setToolbarVisibility={handleSetToolbarVisibility}
                resetToolbarOrder={() => onToolbarOrderChange?.(DEFAULT_TOOLBAR_ORDER)}
                resetToolbarVisibility={() => onToolbarVisibilityChange?.({})}
                toast={toast}
                editor={editor}
              />
              {isVisible("theme") && (
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  aria-label={`Switch to ${theme === "light" ? "dark" : theme === "dark" ? "system" : "light"} theme`}
                  onClick={toggleTheme}
                >
                  {getThemeIcon()}
                </Button>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </TooltipProvider>
    );
  }

);

Toolbar.displayName = "Toolbar";

export default Toolbar;
