// Minimal TipTap editor typings for local project use
// Place narrow types here to avoid spreading `any` across the codebase

interface TipTapChain {
  focus: () => TipTapChain;
  run: () => void;
  undo?: () => TipTapChain;
  redo?: () => TipTapChain;
  insertContent?: (content: unknown) => TipTapChain;
  toggleBold?: () => TipTapChain;
  toggleItalic?: () => TipTapChain;
  toggleUnderline?: () => TipTapChain;
  toggleSubscript?: () => TipTapChain;
  toggleSuperscript?: () => TipTapChain;
  toggleHeading?: (opts: { level?: number }) => TipTapChain;
  toggleBlockquote?: () => TipTapChain;
  toggleCodeBlock?: () => TipTapChain;
  toggleTaskList?: () => TipTapChain;
  setLink?: (opts: { href?: string }) => TipTapChain;
  extendMarkRange?: (mark: string) => TipTapChain;
  setColor?: (color: string) => TipTapChain;
  setHighlight?: (opts: { color?: string }) => TipTapChain;
  unsetLink?: () => TipTapChain;
  unsetColor?: () => TipTapChain;
  unsetHighlight?: () => TipTapChain;
}

interface EditorLike {
  isActive: (name: string, options?: unknown) => boolean;
  getAttributes: (name: string) => Record<string, unknown>;
  chain: () => TipTapChain;
  commands?: Record<string, (...args: unknown[]) => void>;
  on?: (event: string, fn: (...args: unknown[]) => void) => void;
  off?: (event: string, fn: (...args: unknown[]) => void) => void;
  // Provide a minimal typed selection shape used by the toolbars to avoid unsafe `any`.
  // Keep a narrow known shape for `state` so callers can access `state.selection` safely.
  state?: { selection?: { from?: number; to?: number } };
  isFocused?: boolean;
}

declare module "@/types/editor" {
  export type { EditorLike, TipTapChain };
}
