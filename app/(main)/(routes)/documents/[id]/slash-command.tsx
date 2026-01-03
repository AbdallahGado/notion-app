import { Extension } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import { ReactRenderer, Editor } from "@tiptap/react";
import tippy, { Instance } from "tippy.js";
import { SlashCommand, commands, CommandItem } from "./SlashCommand"; // Import the UI component

interface CommandProps {
  editor: Editor; // Editor instance from TipTap
  range: { from: number; to: number }; // Range object
  props: Record<string, unknown>;
}

export const SlashCommandExtension = Extension.create({
  name: "slashCommand",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        command: ({ editor, range, props }: CommandProps) => {
          (props.command as (editor: Editor, range: { from: number; to: number }) => void)(editor, range);
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

interface OnStartProps {
  editor: Editor;
  clientRect: () => DOMRect;
  items: CommandItem[];
  command: (item: CommandItem) => void;
}

interface OnUpdateProps {
  clientRect: () => DOMRect;
}

interface OnKeyDownProps {
  event: KeyboardEvent;
}

export const suggestion = {
  items: ({ query }: { query: string }) => {
    return commands
      .filter((item) =>
        item.title.toLowerCase().startsWith(query.toLowerCase())
      )
      .slice(0, 10);
  },

  render: () => {
    let component: ReactRenderer;
    let popup: Instance[];

    return {
      onStart: (props: OnStartProps) => {
        component = new ReactRenderer(SlashCommand, {
          editor: props.editor,
          props: {
            items: props.items,
            command: props.command,
            selectedIndex: 0,
          },
        });
        if (!props.clientRect) {
          return;
        }

        popup = tippy("body", {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: "manual",
          placement: "bottom-start",
        });
      },

      onUpdate(props: OnUpdateProps) {
        component.updateProps(props);

        if (!props.clientRect) {
          return;
        }

        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        });
      },

      onKeyDown(props: OnKeyDownProps) {
        if (props.event.key === "Escape") {
          popup[0].hide();
          return true;
        }

        return (component.ref as { onKeyDown?: (props: OnKeyDownProps) => boolean })?.onKeyDown?.(props);
      },

      onExit() {
        popup[0].destroy();
        component.destroy();
      },
    };
  },
};
