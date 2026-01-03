import type { Editor } from "@tiptap/react";
import type { LucideIcon } from "lucide-react";

// Base toolbar button configuration
export interface ToolbarButtonConfig {
  id: string;
  label: string;
  icon?: LucideIcon;
  shortcut?: string;
  command?: string;
  children?: React.ReactNode;
}

/**
 * Props for individual toolbar buttons
 *
 * Defines the properties for toolbar buttons including accessibility,
 * state management, and visual configuration.
 */
export interface ToolbarButtonProps {
  /** Display label for the button */
  label: string;
  /** Optional Lucide icon component */
  icon?: LucideIcon;
  /** Click handler function */
  onClick: () => void;
  /** Whether the button represents an active state */
  isActive?: boolean;
  /** Keyboard shortcut string (e.g., "Ctrl+B") */
  shortcut?: string;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** ARIA label for accessibility */
  ariaLabel?: string;
  /** Custom content to render instead of icon */
  children?: React.ReactNode;
}

// Toolbar formatting group props
export interface ToolbarFormattingGroupProps {
  editor: Editor | null;
  isDisabled: boolean;
  isVisible: (id: string) => boolean;
  runChain: (fn: (chain: ReturnType<Editor["chain"]>) => void) => void;
  groupStyle: string;
  mobileGroupVariants: {
    hidden: { opacity: number; y: number; scale: number };
    visible: (index: number) => {
      opacity: number;
      y: number;
      scale: number;
      transition: {
        delay: number;
        duration: number;
        ease: string;
      };
    };
    exit: { opacity: number; y: number; scale: number; transition: { duration: number } };
  };
}

/**
 * Main props for the Toolbar component
 *
 * Defines the configuration and event handlers for the rich text editor toolbar,
 * including customization options for layout, visibility, and user interactions.
 */
export interface ToolbarProps {
  /** The TipTap editor instance for executing commands */
  editor: Editor | null;
  /** Whether the entire toolbar is disabled */
  disabled?: boolean;
  /** Custom order of toolbar items (array of item IDs) */
  toolbarOrder?: string[];
  /** Visibility settings for individual toolbar items */
  toolbarVisibility?: Record<string, boolean>;
  /** Callback when the toolbar order is changed by user */
  onToolbarOrderChange?: (order: string[]) => void;
  /** Callback when toolbar visibility settings are changed */
  onToolbarVisibilityChange?: (visibility: Record<string, boolean>) => void;
}

// Toolbar state interface
export interface ToolbarState {
  linkDialogOpen: boolean;
  linkInitialUrl: string;
  helpModalOpen: boolean;
  customizeModalOpen: boolean;
  colorDropdownOpen: boolean;
  emojiDropdownOpen: boolean;
  EmojiPickerModule: unknown;
  emojiDataModule: unknown;
  isUploadingMarkdown: boolean;
  isUploadingImage: boolean;
}

// Toolbar shortcuts configuration
export interface ToolbarShortcut {
  label: string;
  shortcut: string;
}

// Toolbar color configuration
export type ToolbarColor = string;

// Toolbar theme types
export type ToolbarTheme = "light" | "dark" | "system";

// Toolbar customization handlers
export interface ToolbarCustomizationHandlers {
  handleSetToolbarOrder: (order: string[] | ((order: string[]) => string[])) => void;
  handleSetToolbarVisibility: (
    visibility: Record<string, boolean> | ((visibility: Record<string, boolean>) => Record<string, boolean>)
  ) => void;
}

// Toolbar group variants for animations
export interface ToolbarGroupVariants {
  hidden: { opacity: number; y: number; scale: number };
  visible: (index: number) => {
    opacity: number;
    y: number;
    scale: number;
    transition: {
      delay: number;
      duration: number;
      ease: string;
    };
  };
  exit: { opacity: number; y: number; scale: number; transition: { duration: number } };
}

// Toolbar button group configuration
export interface ToolbarButtonGroup {
  id: string;
  label: string;
  buttons: ToolbarButtonConfig[];
  custom?: boolean;
}

// Toolbar preset configuration
export interface ToolbarPreset {
  id: string;
  name: string;
  description: string;
  order: string[];
  visibility: Record<string, boolean>;
}

// Toolbar analytics event types
export type ToolbarAnalyticsEvent =
  | "button_click"
  | "dropdown_open"
  | "modal_open"
  | "customization_save"
  | "preset_apply";

// Toolbar analytics payload
export interface ToolbarAnalyticsPayload {
  event: ToolbarAnalyticsEvent;
  buttonId?: string;
  modalId?: string;
  presetId?: string;
  timestamp: number;
  userAgent: string;
}

// Error types for toolbar operations
export class ToolbarError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ToolbarError";
  }
}

// Toolbar command types
export type ToolbarCommand =
  | "toggleBold"
  | "toggleItalic"
  | "toggleUnderline"
  | "toggleSubscript"
  | "toggleSuperscript"
  | "toggleHeading"
  | "toggleBlockquote"
  | "toggleCodeBlock"
  | "toggleTaskList"
  | "undo"
  | "redo"
  | "setColor"
  | "setLink"
  | "insertImage"
  | "insertEmoji";

// Toolbar file upload types
export interface ToolbarFileUpload {
  type: "markdown" | "image";
  file: File;
  onSuccess?: (result: unknown) => void;
  onError?: (error: Error) => void;
}

// Toolbar keyboard event handler
export type ToolbarKeyboardHandler = (e: KeyboardEvent) => void;

// Toolbar focus management
export interface ToolbarFocusManager {
  focusFirst: () => void;
  focusLast: () => void;
  focusNext: () => void;
  focusPrevious: () => void;
  getFocusedElement: () => HTMLElement | null;
}

// Toolbar accessibility configuration
export interface ToolbarAccessibilityConfig {
  announceChanges: boolean;
  skipLinks: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
}

// Toolbar performance metrics
export interface ToolbarPerformanceMetrics {
  renderTime: number;
  interactionTime: number;
  memoryUsage: number;
  bundleSize: number;
}

// Toolbar test utilities
export interface ToolbarTestUtils {
  renderWithEditor: (editor: Editor) => React.ReactElement;
  mockEditor: () => Editor;
  simulateClick: (buttonId: string) => void;
  waitForAnimation: () => Promise<void>;
}

// Heading level type for toolbar headings
export type HeadingLevel = 1 | 2 | 3;

// Default toolbar order configuration
export const DEFAULT_TOOLBAR_ORDER = [
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
] as const;

// Toolbar shortcuts configuration
export const TOOLBAR_SHORTCUTS = [
  { label: "Bold", shortcut: "Ctrl+B" },
  { label: "Italic", shortcut: "Ctrl+I" },
  { label: "Underline", shortcut: "Ctrl+U" },
  { label: "Subscript", shortcut: "Ctrl+," },
  { label: "Superscript", shortcut: "Ctrl+." },
  { label: "Insert Link", shortcut: "Ctrl+K" },
  { label: "Undo", shortcut: "Ctrl+Z" },
  { label: "Redo", shortcut: "Ctrl+Y" },
  { label: "Blockquote", shortcut: "Ctrl+Shift+B" },
] as const;

// Toolbar colors configuration
export const TOOLBAR_COLORS = [
  "#000000",
  "#e63946",
  "#f1c40f",
  "#2ecc71",
  "#3498db",
  "#9b59b6",
  "#ffffff",
] as const;

// Toolbar group style configuration
export const TOOLBAR_GROUP_STYLE =
  "flex gap-2 px-2 sm:px-3 md:px-4 py-1 bg-transparent flex-nowrap";

// Animation variants for mobile toolbar groups
export const MOBILE_GROUP_VARIANTS = {
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

// Heading button configuration
export interface HeadingButton {
  level: HeadingLevel;
  Icon: LucideIcon;
}

// Formatting button configuration
export interface FormattingButton {
  Icon: LucideIcon;
  label: string;
  command: ToolbarCommand;
}
