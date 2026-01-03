import React, { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { Bold, Italic, Underline } from "lucide-react";
import ToolbarButton from "../toolbar/ToolbarButton";
import type { ToolbarFormattingGroupProps } from "./types";

const SHORTCUTS = [
  { label: "Bold", shortcut: "Ctrl+B" },
  { label: "Italic", shortcut: "Ctrl+I" },
  { label: "Underline", shortcut: "Ctrl+U" },
];

const ToolbarFormattingGroup: React.FC<ToolbarFormattingGroupProps> = memo(
  ({
    editor,
    isDisabled,
    isVisible,
    runChain,
    groupStyle,
    mobileGroupVariants,
  }) => {
    const formattingButtons = useMemo(
      () => [
        { Icon: Bold, label: "Bold", command: "toggleBold" },
        { Icon: Italic, label: "Italic", command: "toggleItalic" },
        { Icon: Underline, label: "Underline", command: "toggleUnderline" },
      ],
      []
    );

    return (
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
                runChain((c) => {
                  const cmd = command as keyof typeof c;
                  if (typeof c[cmd] === "function") {
                    // @ts-expect-error - Tiptap command execution
                    c[cmd]().run();
                  }
                })
              }
            />
          ) : null
        )}
      </motion.div>
    );
  }
);

ToolbarFormattingGroup.displayName = "ToolbarFormattingGroup";

export default ToolbarFormattingGroup;
