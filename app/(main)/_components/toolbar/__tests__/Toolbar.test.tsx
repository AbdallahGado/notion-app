import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { jest } from "@jest/globals";
import Toolbar from "../../Toolbar";
import { Editor } from "@tiptap/react";

// Mock dependencies
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, ...props }: { children?: React.ReactNode; onClick?: () => void; [key: string]: unknown }) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

jest.mock("../modals/HelpModal", () => ({
  HelpModal: ({ open }: { open: boolean }) =>
    open ? <div data-testid="help-modal">Help Modal</div> : null,
}));

jest.mock("../modals/CustomizeModal", () => ({
  CustomizeModal: ({ open }: { open: boolean }) =>
    open ? <div data-testid="customize-modal">Customize Modal</div> : null,
}));

jest.mock("../modals/LinkDialog", () => ({
  LinkDialog: ({ open }: { open: boolean }) =>
    open ? <div data-testid="link-dialog">Link Dialog</div> : null,
}));

jest.mock("@/hooks/useDropdownOutsideClick", () => ({
  useDropdownOutsideClick: jest.fn(),
}));

jest.mock("../../_components/theme-provider", () => ({
  useTheme: () => ({
    theme: "light",
    setTheme: jest.fn(),
  }),
}));

// Mock Editor
const mockEditor = {
  chain: jest.fn(() => ({
    focus: jest.fn(() => ({
      toggleBold: jest.fn(() => ({ run: jest.fn() })),
      toggleItalic: jest.fn(() => ({ run: jest.fn() })),
      toggleUnderline: jest.fn(() => ({ run: jest.fn() })),
      toggleSubscript: jest.fn(() => ({ run: jest.fn() })),
      toggleSuperscript: jest.fn(() => ({ run: jest.fn() })),
      toggleHeading: jest.fn(() => ({ run: jest.fn() })),
      toggleBlockquote: jest.fn(() => ({ run: jest.fn() })),
      toggleCodeBlock: jest.fn(() => ({ run: jest.fn() })),
      toggleTaskList: jest.fn(() => ({ run: jest.fn() })),
      undo: jest.fn(() => ({ run: jest.fn() })),
      redo: jest.fn(() => ({ run: jest.fn() })),
      setColor: jest.fn(() => ({ run: jest.fn() })),
      setImage: jest.fn(() => ({ run: jest.fn() })),
      insertContent: jest.fn(() => ({ run: jest.fn() })),
    })),
  })),
  isActive: jest.fn(() => false),
  getAttributes: jest.fn(() => ({})),
  commands: {
    setContent: jest.fn(),
  },
} as unknown as Editor;

describe("Toolbar", () => {
  const defaultProps = {
    editor: mockEditor,
    disabled: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders toolbar with proper accessibility attributes", () => {
    render(<Toolbar {...defaultProps} />);

    const toolbar = screen.getByRole("toolbar");
    expect(toolbar).toBeInTheDocument();
    expect(toolbar).toHaveAttribute("aria-label", "Rich text editor toolbar with formatting options");
    expect(toolbar).toHaveAttribute("aria-description", "Use keyboard shortcuts or click buttons to format text, insert elements, and customize the editor");
  });

  it("renders formatting buttons", () => {
    render(<Toolbar {...defaultProps} />);

    expect(screen.getByRole("button", { name: /bold/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /italic/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /underline/i })).toBeInTheDocument();
  });

  it("renders heading buttons", () => {
    render(<Toolbar {...defaultProps} />);

    expect(screen.getByRole("button", { name: /heading 1/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /heading 2/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /heading 3/i })).toBeInTheDocument();
  });

  it("renders action buttons", () => {
    render(<Toolbar {...defaultProps} />);

    expect(screen.getByRole("button", { name: /insert link/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /undo/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /redo/i })).toBeInTheDocument();
  });

  it("opens help modal when help button is clicked", () => {
    render(<Toolbar {...defaultProps} />);

    const helpButton = screen.getByRole("button", { name: /help/i });
    fireEvent.click(helpButton);

    expect(screen.getByTestId("help-modal")).toBeInTheDocument();
  });

  it("opens customize modal when settings button is clicked", () => {
    render(<Toolbar {...defaultProps} />);

    const settingsButton = screen.getByRole("button", { name: /customize toolbar/i });
    fireEvent.click(settingsButton);

    expect(screen.getByTestId("customize-modal")).toBeInTheDocument();
  });

  it("handles keyboard shortcuts", () => {
    render(<Toolbar {...defaultProps} />);

    // Simulate Ctrl+B
    fireEvent.keyDown(document, { key: "b", ctrlKey: true });

    expect(mockEditor.chain).toHaveBeenCalled();
  });

  it("respects toolbar visibility settings", () => {
    const toolbarVisibility = { bold: false, italic: true, underline: true };
    render(
      <Toolbar
        {...defaultProps}
        toolbarVisibility={toolbarVisibility}
      />
    );

    expect(screen.queryByRole("button", { name: /bold/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /italic/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /underline/i })).toBeInTheDocument();
  });

  it("handles disabled state", () => {
    render(<Toolbar {...defaultProps} disabled={true} />);

    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it("handles null editor gracefully", () => {
    render(<Toolbar {...defaultProps} editor={null} />);

    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it("loads emoji picker on dropdown open", async () => {
    // Mock emoji picker modules
    jest.doMock("@emoji-mart/react", () => ({ default: () => <div>Emoji Picker</div> }));
    jest.doMock("@emoji-mart/data", () => ({ default: {} }));

    render(<Toolbar {...defaultProps} />);

    const emojiButton = screen.getByRole("button", { name: /emoji picker/i });
    fireEvent.click(emojiButton);

    // Wait for dynamic import
    await waitFor(() => {
      expect(screen.getByText("Emoji Picker")).toBeInTheDocument();
    });
  });
});
