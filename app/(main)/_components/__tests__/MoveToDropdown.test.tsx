/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import MoveToDropdown from "../MoveToDropdown";

const doc = {
  _id: "node-1",
  title: "Node 1",
  isFolder: false,
  children: [],
  starred: false,
};
const folders = [
  {
    _id: "f1",
    title: "Folder 1",
    isFolder: true,
    children: [],
    starred: false,
  },
  {
    _id: "f2",
    title: "Folder 2",
    isFolder: true,
    children: [],
    starred: false,
  },
];

describe("MoveToDropdown", () => {
  it("renders when open and calls move handler", () => {
    const setOpenForId = jest.fn();
    const handleMoveTo = jest.fn();

    render(
      // Silence explicit any warnings in tests where we provide simple fakes
      <MoveToDropdown
        openForId={doc._id}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        doc={doc as any}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setOpenForId={setOpenForId as any}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handleMoveTo={handleMoveTo as any}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        allFolders={folders as any}
      />
    );

    // Should show (No parent) button
    const noParent = screen.getByText(/\(No parent\)/i);
    expect(noParent).toBeInTheDocument();
    fireEvent.click(noParent);
    expect(handleMoveTo).toHaveBeenCalledWith(doc._id, undefined);

    // Folder buttons should render
    const folderBtn = screen.getByText(/Folder 1/i);
    expect(folderBtn).toBeInTheDocument();
    fireEvent.click(folderBtn);
    expect(handleMoveTo).toHaveBeenCalledWith(doc._id, "f1");
  });

  it("does not render when openForId doesn't match", () => {
    const { queryByText } = render(
      <MoveToDropdown
        openForId={null as any}
        doc={doc as any}
        setOpenForId={() => {}}
        handleMoveTo={() => {}}
        allFolders={folders as any}
      />
    );
    expect(queryByText(/\(No parent\)/i)).toBeNull();
  });
});
