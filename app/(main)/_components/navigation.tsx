"use client";

//! THE MANE PAGE

import { ChevronsLeft, MenuIcon, PlusCircle } from "lucide-react";
import { ElementRef, useRef, useState, useEffect } from "react";
import { useMediaQuery } from "usehooks-ts";
import { useMutation, useQuery } from "convex/react";
import { cn } from "@/lib/utils"; // Utility function for conditional class names
import { api } from "@/convex/_generated/api"; // Ensure the correct path to your API
import { usePathname } from "next/navigation";
import { UserItem } from "./user-item"; // Adjust import paths as necessary
import { Item } from "./item"; // Adjust import paths as necessary
import { toast } from "sonner";
import { Id } from "../../../convex/_generated/dataModel";

export const Navigation = () => {
  const isMobile = useMediaQuery("(max-width: 768px)"); // Check if the viewport is mobile size
  const isResizingRef = useRef(false); // Ref to track resizing state
  const pathname = usePathname();
  const create = useMutation(api.documents.create); // Mutation for creating documents
  const documents = useQuery(api.documents.getSearch); // Query to fetch documents
  const sidebarRef = useRef<ElementRef<"aside">>(null);
  const navbarRef = useRef<ElementRef<"div">>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(isMobile);

  useEffect(() => {
    if (isMobile) {
      collapse();
    } else {
      resetWidth();
    }
  }, [isMobile, pathname]);

  // Start resizing when mouse is down
  const handleMouseDown = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.preventDefault();
    event.stopPropagation();
    isResizingRef.current = true;

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Handle resizing of the sidebar
  const handleMouseMove = (event: MouseEvent) => {
    if (!isResizingRef.current) return;
    let newWidth = event.clientX;
    newWidth = Math.min(Math.max(newWidth, 240), 480);
    if (sidebarRef.current && navbarRef.current) {
      sidebarRef.current.style.width = `${newWidth}px`;
      navbarRef.current.style.setProperty("left", `${newWidth}px`);
      navbarRef.current.style.setProperty(
        "width",
        `calc(100% - ${newWidth}px)`
      );
    }
  };

  // Stop resizing
  const handleMouseUp = () => {
    isResizingRef.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  // Reset sidebar width
  const resetWidth = () => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(false);
      setIsResetting(true);
      
      sidebarRef.current.style.width = isMobile ? "100%" : "240px";
      navbarRef.current.style.setProperty(
        "width",
        isMobile ? "0" : "calc(100% - 240px)"
      );
      navbarRef.current.style.setProperty("left", isMobile ? "100%" : "240px");

      setTimeout(() => {
        setIsResetting(false);
      }, 300);
    }
  };
  // Collapse sidebar
  const collapse = () => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(true);
      setIsResetting(true);
      sidebarRef.current.style.width = "0";
      navbarRef.current.style.setProperty("width", "100%");
      navbarRef.current.style.setProperty("left", "0");

      setTimeout(() => {
        setIsResetting(false);
      }, 300);
    }
  };

  // Handle document creation
  const handleCreate = () => {
    const promise = create({ title: "Untitled" });
    toast.promise(promise, {
      loading: "Creating a new note...",
      success: "New note created",
      error: "Failed to create a new note",
    });
  };

  return (
    <>
      <aside
        ref={sidebarRef}
        className={cn(
          `group/sidebar h-screen bg-secondary overflow-y-auto relative flex flex-col w-60 z-[99999]`,
          isResetting && "transition-all ease-in-out duration-300",
          isMobile && "w-0"
        )}
      >
        <button
          onClick={collapse}
          className={cn(
            "h-6 w-6 text-muted-foreground cursor-pointer rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-900 absolute top-3 right-2 opacity-0 group-hover/sidebar:opacity-100 transition duration-300",
            isMobile && "opacity-100"
          )}
        >
          <ChevronsLeft className="h-6 w-6" />
        </button>
        <div>
          <UserItem />
          <Item
            label="New Page"
            onClick={handleCreate}
            icon={PlusCircle}
            id={undefined as unknown as Id<"documents">}
          />
        </div>
        <div className="mt-4">
          {documents?.map((document) => (
            <p key={document._id} className="text-sm text-muted-foreground">
              {document.title}
            </p>
          ))}
        </div>
        <div
          role="button"
          tabIndex={0}
          onMouseDown={handleMouseDown}
          onClick={resetWidth}
          className="opacity-0 group-hover/sidebar:opacity-100 transition cursor-ew-resize absolute h-screen w-1 bg-gray-500 right-0 top-0"
        />
      </aside>
      <div
        ref={navbarRef}
        className={cn(
          "absolute top-0 left-60 z-[99999]",
          isMobile && "left-0 w-full"
        )}
      >
        <nav className="bg-transparent w-full">
          {isCollapsed && (
            <MenuIcon
              onClick={resetWidth}
              role="button"
              className="h-6 w-6 text-muted-foreground"
            />
          )}
        </nav>
      </div>
    </>
  );
};
