import React from "react";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import Toolbar from "./Toolbar";
import type { Editor } from "@tiptap/core";

describe("Toolbar", () => {
  it("renders without crashing (with a mock editor)", () => {
    // Provide a lightweight mock that implements the minimal API used by Toolbar
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chainReturn: any = {
      focus: () => chainReturn,
      toggleBold: () => chainReturn,
      toggleItalic: () => chainReturn,
      toggleUnderline: () => chainReturn,
      undo: () => chainReturn,
      redo: () => chainReturn,
      toggleHeading: () => chainReturn,
      toggleSubscript: () => chainReturn,
      toggleSuperscript: () => chainReturn,
      toggleBlockquote: () => chainReturn,
      toggleCodeBlock: () => chainReturn,
      toggleTaskList: () => chainReturn,
      insertContent: () => chainReturn,
      setColor: () => chainReturn,
      extendMarkRange: () => chainReturn,
      setLink: () => chainReturn,
      setContent: () => chainReturn,
      run: () => {},
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockEditor = {
      isActive: jest.fn(() => false),
      getAttributes: jest.fn(() => ({})),
      commands: {
        setContent: jest.fn(),
      },
      chain: () => chainReturn,
    } as unknown as Editor;

    render(<Toolbar editor={mockEditor} />);
  });
});
