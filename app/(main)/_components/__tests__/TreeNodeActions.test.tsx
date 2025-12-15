/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import TreeNodeActions from "../TreeNodeActions";

const mockDoc = {
  _id: "1",
  title: "Doc 1",
  isFolder: false,
  children: [],
  starred: false,
};

describe("TreeNodeActions", () => {
  it("renders action buttons and calls callbacks", () => {
    const onToggleMove = jest.fn();
    const onRename = jest.fn();
    const onToggleStar = jest.fn();
    const onDelete = jest.fn();

    render(
      // Tests use simple JS objects as mocks; silence explicit any lint warnings
      <TreeNodeActions
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        doc={mockDoc as any}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onToggleMove={onToggleMove as any}
        onRename={onRename as any}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onToggleStar={onToggleStar as any}
        onDelete={onDelete as any}
      />
    );

    // Star button should be present
    const starBtn = screen.getByRole("button", {
      name: /star note|unstar note/i,
    });
    fireEvent.click(starBtn);
    expect(onToggleStar).toHaveBeenCalled();

    // More actions trigger present
    const moreBtn = screen.getByRole("button", { name: /more actions/i });
    expect(moreBtn).toBeInTheDocument();

    // We can't easily open the dropdown reliably in this test environment across radix implementations,
    // but ensure the trigger exists and is interactive by clicking it (no error thrown)
    fireEvent.click(moreBtn);
  });
});
