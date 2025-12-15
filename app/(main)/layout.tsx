"use client";

import { Spinner } from "@/components/spinner";
import { useConvexAuth } from "convex/react";
import { redirect } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";
import { useMediaQuery } from "usehooks-ts";
import { Navigation } from "./_components/navigation";
import KeyboardShortcuts from "./_components/KeyboardShortcuts";

function MainLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(256); // default width
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    if (!sidebarRef.current) return;
    const handleResize = () => {
      setSidebarWidth(sidebarRef.current?.offsetWidth || 0);
    };
    handleResize();
    const observer = new window.ResizeObserver(handleResize);
    observer.observe(sidebarRef.current);
    return () => observer.disconnect();
  }, [sidebarRef]);

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(true);
      setIsMobileMenuOpen(false);
    } else {
      setIsCollapsed(false);
    }
  }, [isMobile]);

  // Close mobile menu on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  if (isLoading) {
    return (
      <div className="h-[100vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return redirect("/");
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-hidden">
      <div className="flex flex-1 min-h-0">
        {/* Mobile Overlay */}
        {isMobile && isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <div
          ref={sidebarRef}
          className={`h-full flex-shrink-0 z-50 transition-all duration-300 ease-in-out ${
            isMobile
              ? `fixed left-0 top-0 w-64 transform ${
                  isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                }`
              : `${isCollapsed ? "w-0" : "w-64"} relative`
          }`}
          role="navigation"
          aria-label="Main navigation"
        >
          <Navigation
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
            isMobile={isMobile}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
          />
        </div>

        {/* Main Content */}
        <main
          className={`flex-1 h-full overflow-hidden bg-gradient-to-br from-white/80 via-blue-50/30 to-indigo-50/50 dark:from-slate-800/80 dark:via-slate-700/30 dark:to-slate-600/50 backdrop-blur-sm transition-all duration-300 ${
            isMobile ? "ml-0" : ""
          }`}
        >
          {React.isValidElement(children)
            ? React.cloneElement(children as React.ReactElement, {
                isSidebarCollapsed: isCollapsed,
                sidebarWidth,
                isMobile,
                isMobileMenuOpen,
                setIsMobileMenuOpen,
              })
            : children}
        </main>
      </div>
      {/* Toolbar/footer slot: will be rendered by page components as fixed bottom bar */}
      {/* Nothing here, but this structure ensures the toolbar is always at the bottom */}
      <KeyboardShortcuts />
    </div>
  );
}

export default MainLayout;
