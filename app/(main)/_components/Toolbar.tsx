/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type { EditorLike } from "@/types/editor";

import React, { useState, useRef } from "react";
import { toast } from "sonner";
import {
  Bold,
  Italic,
  Underline,
  Link,
  UploadCloud,
  Smile,
  Palette,
  Settings,
  Heading1,
  Heading2,
  Heading3,
  Undo2,
  Redo2,
} from "lucide-react";

import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

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

interface ToolbarProps {
  editor: unknown;
  disabled?: boolean;
  isSidebarCollapsed?: boolean;
  sidebarWidth?: number;
  toolbarRect?: { left: number; width: number };
  comments?: unknown[];
  setComments?: (c: unknown[]) => void;
  collaborators?: unknown;
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

const colors = ["#000000", "#e63946", "#f1c40f", "#2ecc71", "#3498db"];

const Toolbar: React.FC<ToolbarProps> = ({ editor, ...props }) => {
  // keep editor local and ignore other props to avoid unused var lint errors
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _rest = props;
  // Narrow editor locally where we use TipTap chain/isActive APIs
  const ed = editor as EditorLike;
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkInitialUrl, setLinkInitialUrl] = useState("");

  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [customizeModalOpen, setCustomizeModalOpen] = useState(false);

  const [colorDropdown, setColorDropdown] = useState(false);
  const [emojiDropdown, setEmojiDropdown] = useState(false);

  const colorBtnRef = useRef<HTMLButtonElement | null>(null);
  const emojiBtnRef = useRef<HTMLButtonElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useDropdownOutsideClick({
    isOpen: colorDropdown,
    buttonRef: colorBtnRef,
    dropdownId: "color-dropdown-portal",
    onClose: () => setColorDropdown(false),
  });

  useDropdownOutsideClick({
    isOpen: emojiDropdown,
    buttonRef: emojiBtnRef,
    dropdownId: "emoji-dropdown-portal",
    onClose: () => setEmojiDropdown(false),
  });

  // Small helper to centralize TipTap chain() any boundary
  function withChain(
    editor: EditorLike | null | undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fn: (chain: any) => void
  ) {
    if (!editor || typeof (editor as any).chain !== "function") return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chain = (editor as any).chain();
    if (!chain) return;
    try {
      fn(chain);
    } catch {}
  }

  function getAttr(editor: EditorLike, name: string) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (editor.getAttributes(name) as any) ?? {};
    } catch {
      return {} as any;
    }
  }

  const handleInsertLink = () => {
    const previousUrl = getAttr(ed, "link").href ?? "";
    setLinkInitialUrl(previousUrl);
    setLinkDialogOpen(true);
  };

  const handleFileImport = () => fileInputRef.current?.click();

  const handleMarkdownFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (ed.commands && (ed.commands as any).setContent) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (ed.commands as any).setContent(text);
        } catch {}
      }
    };
    reader.readAsText(file);
  };

  const groupStyle =
    "flex gap-1 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-zinc-300 dark:border-zinc-700";

  const isDisabled = !editor || props.disabled;

  return (
    <TooltipProvider>
      <div
        role="toolbar"
        aria-label="Editor toolbar"
        className="toolbar-wrapper p-2 border rounded-md bg-white dark:bg-zinc-900 shadow-sm flex gap-2 flex-wrap items-center relative z-10 overflow-x-auto"
      >
        {/* Formatting */}
        <div className={groupStyle}>
          {[
            { Icon: Bold, label: "Bold", command: "toggleBold" },
            { Icon: Italic, label: "Italic", command: "toggleItalic" },
            { Icon: Underline, label: "Underline", command: "toggleUnderline" },
          ].map(({ Icon, label, command }) => {
            const shortcut = SHORTCUTS.find((s) => s.label === label)?.shortcut;
            const tooltipText = shortcut ? `${label} (${shortcut})` : label;
            return (
              <Tooltip key={label}>
                <TooltipTrigger asChild>
                  <Button
                    aria-label={label}
                    aria-pressed={!!ed?.isActive?.(label.toLowerCase())}
                    variant={
                      ed?.isActive?.(label.toLowerCase()) ? "default" : "ghost"
                    }
                    size="icon"
                    type="button"
                    disabled={isDisabled}
                    onClick={() =>
                      withChain(ed, (c) => c.focus()[command]().run())
                    }
                  >
                    <Icon className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{tooltipText}</TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Subscript / Superscript */}
        <div className={groupStyle}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-label="Subscript"
                aria-pressed={!!ed?.isActive?.("subscript")}
                variant={ed?.isActive("subscript") ? "default" : "ghost"}
                size="icon"
                type="button"
                disabled={isDisabled}
                onClick={() =>
                  withChain(ed, (c) => c.focus().toggleSubscript().run())
                }
              >
                <span className="text-xs">Sub</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {`Subscript (${SHORTCUTS.find((s) => s.label === "Subscript")?.shortcut ?? ""})`}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-label="Superscript"
                aria-pressed={!!ed?.isActive?.("superscript")}
                variant={ed?.isActive("superscript") ? "default" : "ghost"}
                size="icon"
                type="button"
                disabled={isDisabled}
                onClick={() =>
                  withChain(ed, (c) => c.focus().toggleSuperscript().run())
                }
              >
                <span className="text-xs">Sup</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {`Superscript (${SHORTCUTS.find((s) => s.label === "Superscript")?.shortcut ?? ""})`}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Headings */}
        <div className={groupStyle}>
          {[1, 2, 3].map((level) => {
            const Icon =
              level === 1 ? Heading1 : level === 2 ? Heading2 : Heading3;
            return (
              <Tooltip key={`H${level}`}>
                <TooltipTrigger asChild>
                  <Button
                    aria-pressed={ed?.isActive?.("heading", { level })}
                    variant={
                      ed?.isActive("heading", { level }) ? "default" : "ghost"
                    }
                    size="icon"
                    type="button"
                    disabled={isDisabled}
                    onClick={() =>
                      withChain(ed, (c) =>
                        c.focus().toggleHeading({ level }).run()
                      )
                    }
                  >
                    <Icon className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Heading {level}</TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Link */}
        <div className={groupStyle}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                type="button"
                disabled={isDisabled}
                onClick={handleInsertLink}
              >
                <Link className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Insert Link</TooltipContent>
          </Tooltip>
          <LinkDialog
            open={linkDialogOpen}
            initialUrl={linkInitialUrl}
            onClose={() => setLinkDialogOpen(false)}
            onSubmit={(url: string) => {
              withChain(ed, (c) =>
                c.focus().extendMarkRange("link").setLink({ href: url }).run()
              );
              setLinkDialogOpen(false);
            }}
          />
        </div>

        {/* Undo / Redo */}
        <div className={groupStyle}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                type="button"
                disabled={isDisabled}
                onClick={() => withChain(ed, (c) => c.focus().undo().run())}
              >
                <Undo2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                type="button"
                disabled={isDisabled}
                onClick={() => withChain(ed, (c) => c.focus().redo().run())}
              >
                <Redo2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo</TooltipContent>
          </Tooltip>
        </div>

        {/* Block-level / other actions */}
        <div className={groupStyle}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-label="Blockquote"
                aria-pressed={ed?.isActive?.("blockquote")}
                variant={ed?.isActive("blockquote") ? "default" : "ghost"}
                size="icon"
                type="button"
                disabled={isDisabled}
                onClick={() =>
                  withChain(ed, (c) => c.focus().toggleBlockquote().run())
                }
              >
                <span className="text-sm">❝</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{`Blockquote (${SHORTCUTS.find((s) => s.label === "Blockquote")?.shortcut ?? ""})`}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-label="Code Block"
                aria-pressed={ed?.isActive?.("codeBlock")}
                variant={ed?.isActive("codeBlock") ? "default" : "ghost"}
                size="icon"
                type="button"
                disabled={isDisabled}
                onClick={() =>
                  withChain(ed, (c) => c.focus().toggleCodeBlock().run())
                }
              >
                <span className="text-xs">{`{}`}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Code Block</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-label="Divider"
                variant="ghost"
                size="icon"
                type="button"
                disabled={isDisabled}
              >
                <span className="text-sm">―</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Divider</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-label="Checklist"
                aria-pressed={ed?.isActive?.("taskList")}
                variant="ghost"
                size="icon"
                type="button"
                disabled={isDisabled}
                onClick={() =>
                  withChain(ed, (c) => c.focus().toggleTaskList().run())
                }
              >
                <span className="text-xs">☑</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Checklist</TooltipContent>
          </Tooltip>
        </div>

        {/* File Upload */}
        <div className={groupStyle}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                type="button"
                disabled={isDisabled}
                onClick={handleFileImport}
              >
                <UploadCloud className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Import .md</TooltipContent>
          </Tooltip>
          <input
            type="file"
            accept=".md"
            hidden
            ref={fileInputRef}
            onChange={handleMarkdownFile}
          />
        </div>

        {/* Emoji / Color */}
        <div className={`${groupStyle} relative`}>
          <Button
            aria-label="Emoji"
            aria-haspopup="menu"
            aria-expanded={emojiDropdown}
            variant="ghost"
            size="icon"
            ref={emojiBtnRef}
            type="button"
            disabled={isDisabled}
            onClick={() => setEmojiDropdown(!emojiDropdown)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setEmojiDropdown(!emojiDropdown);
              }
            }}
          >
            <Smile className="w-4 h-4" />
          </Button>
          {emojiDropdown && (
            <div
              id="emoji-dropdown-portal"
              className="absolute z-50 mt-2 bg-white dark:bg-zinc-800 border rounded shadow p-1"
              style={{ top: "100%", left: 0 }}
            >
              <Picker
                data={data}
                onEmojiSelect={(emoji: { native?: string }) => {
                  withChain(ed, (c) =>
                    c
                      .focus()
                      .insertContent(emoji.native ?? "")
                      .run()
                  );
                  setEmojiDropdown(false);
                }}
                theme="light"
              />
            </div>
          )}

          <Button
            aria-label="Text color"
            aria-haspopup="menu"
            aria-expanded={colorDropdown}
            variant="ghost"
            size="icon"
            ref={colorBtnRef}
            type="button"
            disabled={isDisabled}
            onClick={() => setColorDropdown(!colorDropdown)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setColorDropdown(!colorDropdown);
              }
            }}
          >
            <Palette className="w-4 h-4" />
          </Button>
          {colorDropdown && (
            <div
              id="color-dropdown-portal"
              className="absolute z-50 mt-2 p-2 bg-white dark:bg-zinc-800 border rounded shadow flex gap-1"
            >
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    withChain(ed, (c) => c.focus().setColor(color).run());
                    setColorDropdown(false);
                  }}
                  style={{ backgroundColor: color }}
                  className="w-5 h-5 rounded-full border border-black/20"
                />
              ))}
            </div>
          )}
        </div>

        {/* Settings & Help */}
        <div className={groupStyle}>
          <Button
            variant="ghost"
            size="icon"
            type="button"
            disabled={isDisabled}
            onClick={() => setHelpModalOpen(true)}
          >
            ?
          </Button>
          <HelpModal
            editor={ed}
            open={helpModalOpen}
            onClose={() => setHelpModalOpen(false)}
            SHORTCUTS={SHORTCUTS}
          />
          <Button
            variant="ghost"
            size="icon"
            type="button"
            disabled={isDisabled}
            onClick={() => setCustomizeModalOpen(true)}
          >
            <Settings className="w-4 h-4" />
          </Button>
          <CustomizeModal
            open={customizeModalOpen}
            onClose={() => setCustomizeModalOpen(false)}
            toolbarOrder={[]}
            setToolbarOrder={() => {}}
            toolbarVisibility={{}}
            setToolbarVisibility={() => {}}
            resetToolbarOrder={() => {}}
            resetToolbarVisibility={() => {}}
            toast={toast}
            editor={ed}
          />
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Toolbar;
