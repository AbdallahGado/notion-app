import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { jest } from "@jest/globals";
import ToolbarButton from "../ToolbarButton";
import { Bold } from "lucide-react";

describe("ToolbarButton", () => {
  const defaultProps = {
    label: "Bold",
    onClick: jest.fn(),
    isActive: false,
    disabled: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with label and icon", () => {
    render(<ToolbarButton {...defaultProps} icon={Bold} />);

    const button = screen.getByRole("button", { name: /bold/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  it("renders with custom aria label", () => {
    render(
      <ToolbarButton
        {...defaultProps}
        ariaLabel="Custom Bold Label"
        icon={Bold}
      />
    );

    const button = screen.getByRole("button", { name: "Custom Bold Label" });
    expect(button).toBeInTheDocument();
  });

  it("renders with children instead of icon", () => {
    render(
      <ToolbarButton {...defaultProps}>
        <span>Custom Content</span>
      </ToolbarButton>
    );

    const button = screen.getByRole("button", { name: /bold/i });
    expect(button).toBeInTheDocument();
    expect(screen.getByText("Custom Content")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const mockOnClick = jest.fn();
    render(<ToolbarButton {...defaultProps} onClick={mockOnClick} />);

    const button = screen.getByRole("button", { name: /bold/i });
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it("shows active state correctly", () => {
    render(<ToolbarButton {...defaultProps} isActive={true} />);

    const button = screen.getByRole("button", { name: /bold/i });
    expect(button).toHaveAttribute("aria-pressed", "true");
  });

  it("is disabled when disabled prop is true", () => {
    const mockOnClick = jest.fn();
    render(
      <ToolbarButton {...defaultProps} disabled={true} onClick={mockOnClick} />
    );

    const button = screen.getByRole("button", { name: /bold/i });
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it("applies correct variant classes", () => {
    const { rerender } = render(<ToolbarButton {...defaultProps} isActive={false} />);
    let button = screen.getByRole("button", { name: /bold/i });
    expect(button).toHaveClass("variant-ghost");

    rerender(<ToolbarButton {...defaultProps} isActive={true} />);
    button = screen.getByRole("button", { name: /bold/i });
    expect(button).toHaveClass("variant-default");
  });

  it("handles keyboard events", () => {
    const mockOnClick = jest.fn();
    render(<ToolbarButton {...defaultProps} onClick={mockOnClick} />);

    const button = screen.getByRole("button", { name: /bold/i });

    fireEvent.keyDown(button, { key: "Enter" });
    expect(mockOnClick).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(button, { key: " " });
    expect(mockOnClick).toHaveBeenCalledTimes(2);
  });
});
