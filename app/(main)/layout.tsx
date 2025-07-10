"use client";

import { Spinner } from "@/components/spinner";
import { useConvexAuth } from "convex/react";
import { redirect } from "next/navigation";
import React, { useState } from "react";
import { Navigation } from "./_components/navigation";

function MainLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

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
    <div className="h-screen w-screen flex dark:bg-[#1F1F1F] overflow-hidden">
      <div
        className={`h-screen ${isCollapsed ? "w-0" : "w-64"} flex-shrink-0 z-30 transition-all duration-300`}
      >
        <Navigation isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>
      <main className="flex-1 h-screen overflow-y-auto bg-gray-50 dark:bg-[#18181B]">
        {children}
      </main>
    </div>
  );
}

export default MainLayout;
