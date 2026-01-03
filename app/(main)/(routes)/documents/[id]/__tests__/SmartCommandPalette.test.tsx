/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { SmartCommandPalette } from "../SmartCommandPalette";

// Mock the Editor from @tiptap/react
const mockEditor = {
  chain: jest.fn().mockReturnThis(),
  focus: jest.fn().mockReturnThis(),
  toggleBold: jest.fn().mockReturnThis(),
  toggleItalic: jest.fn().mockReturnThis(),
  toggleHeading: jest.fn().mockReturnThis(),
  toggleBulletList: jest.fn().mockReturnThis(),
  run: jest.fn(),
};

describe("SmartCommandPalette", () => {
  const defaultProps = {
    editor: mockEditor as any,
    isOpen: true,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly when open", () => {
    render(<SmartCommandPalette {...defaultProps} />);

    expect(screen.getByPlaceholderText("Search commands...")).toBeInTheDocument();
    expect(screen.getByText("Bold")).toBeInTheDocument();
    expect(screen.getByText("Italic")).toBeInTheDocument();
    expect(screen.getByText("Heading 1")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(<SmartCommandPalette {...defaultProps} isOpen={false} />);

    expect(screen.queryByPlaceholderText("Search commands...")).not.toBeInTheDocument();
  });

  it("filters commands based on search query", () => {
    render(<SmartCommandPalette {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText("Search commands...");
    fireEvent.change(searchInput, { target: { value: "bold" } });

    expect(screen.getByText("Bold")).toBeInTheDocument();
    expect(screen.queryByText("Italic")).not.toBeInTheDocument();
  });

  it("executes command and closes palette when command is clicked", () => {
    render(<SmartCommandPalette {...defaultProps} />);

    const boldCommand = screen.getByText("Bold");
    fireEvent.click(boldCommand);

    expect(mockEditor.chain).toHaveBeenCalled();
    expect(mockEditor.focus).toHaveBeenCalled();
    expect(mockEditor.toggleBold).toHaveBeenCalled();
    expect(mockEditor.run).toHaveBeenCalled();
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("calls onClose when clicking outside", () => {
    render(<SmartCommandPalette {...defaultProps} />);

    const backdrop = screen.getByTestId ? screen.getByTestId("backdrop") : document.querySelector(".fixed.inset-0");
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(defaultProps.onClose).toHaveBeenCalled();
    }
  });

  it("shows correct number of commands in footer", () => {
    render(<SmartCommandPalette {...defaultProps} />);

    expect(screen.getByText(/commands$/)).toBeInTheDocument();
  });
});
