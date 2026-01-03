"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { useMediaQuery } from "usehooks-ts";

type SidebarContextType = {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobile: boolean;
  expand: () => void;
  collapse: () => void;
  resetWidth: () => void;
  sidebarRef: React.RefObject<HTMLElement>;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useMediaQuery("(max-width: 900px)"); // Using 900px to match prior responsive logic or standard
  const [isCollapsed, setIsCollapsed] = useState(isMobile);
  const sidebarRef = useRef<HTMLElement>(null);

  const resetWidth = useCallback(() => {
    if (sidebarRef.current) {
        setIsCollapsed(false);
        sidebarRef.current.style.width = isMobile ? "100%" : "240px";
    }
  }, [isMobile]);

  const collapse = useCallback(() => {
    if (sidebarRef.current) {
        setIsCollapsed(true);
        sidebarRef.current.style.width = "0";
    }
  }, []);

  const expand = useCallback(() => {
      resetWidth();
  }, [resetWidth]);

  // Sync isCollapsed with mobile state
  useEffect(() => {
    if (isMobile) {
        setIsCollapsed(true);
    } else {
        setIsCollapsed(false);
        resetWidth();
    }
  }, [isMobile, resetWidth]);

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        setIsCollapsed,
        isMobile,
        expand,
        collapse,
        resetWidth,
        sidebarRef
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
}
