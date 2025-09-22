import React, { useEffect } from "react";

interface Shortcut {
  label: string;
  shortcut: string;
}

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
  SHORTCUTS: Shortcut[];
  editor?: unknown;
}

export const HelpModal: React.FC<HelpModalProps> = ({
  open,
  onClose,
  SHORTCUTS,
}) => {
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#23233a] p-6 rounded-lg shadow-xl w-96 max-w-full flex flex-col gap-4 relative"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold text-lg">Keyboard Shortcuts</div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xl"
          >
            ×
          </button>
        </div>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {SHORTCUTS.map(({ label, shortcut }) => (
            <li key={label} className="flex justify-between py-2 text-sm">
              <span>{label}</span>
              <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs">
                {shortcut}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
