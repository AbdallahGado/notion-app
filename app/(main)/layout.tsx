"use client";

import { Spinner } from "@/components/spinner";
import { useConvexAuth } from "convex/react";
import { redirect } from "next/navigation";
import React from "react";
import { Navigation } from "./_components/navigation";
import KeyboardShortcuts from "./_components/KeyboardShortcuts";
import { SidebarProvider } from "@/components/providers/sidebar-provider";

function MainLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return redirect("/");
  }

  return (
    <SidebarProvider>
      <div className="h-full flex dark:bg-[#1F1F1F]">
        <Navigation className="no-print" />
        <main className="flex-1 h-full overflow-y-auto">
          {children}
        </main>
        <KeyboardShortcuts className="no-print" />
      </div>
    </SidebarProvider>
  );
}

export default MainLayout;
