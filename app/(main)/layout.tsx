"use client";

import { Spinner } from "@/components/spinner";
import { useConvexAuth } from "convex/react";
import { redirect } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";
import { Navigation } from "./_components/navigation";

function MainLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(256); // default width
  const sidebarRef = useRef<HTMLDivElement>(null);

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
    <div className="h-screen w-screen flex flex-col dark:bg-[#1F1F1F] overflow-hidden">
      <div className="flex flex-1 min-h-0">
        <div
          ref={sidebarRef}
          className={`h-full ${isCollapsed ? "w-0" : "w-64"} flex-shrink-0 z-30 transition-all duration-300`}
        >
          <Navigation
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />
        </div>
        <main className="flex-1 h-full overflow-y-auto bg-gray-50 dark:bg-[#18181B]">
          {React.isValidElement(children)
            ? React.cloneElement(children as React.ReactElement, {
                isSidebarCollapsed: isCollapsed,
                sidebarWidth,
              })
            : children}
        </main>
      </div>
      {/* Toolbar/footer slot: will be rendered by page components as fixed bottom bar */}
      {/* Nothing here, but this structure ensures the toolbar is always at the bottom */}
    </div>
  );
}

export default MainLayout;
