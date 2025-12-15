"use client";

import { Spinner } from "@/components/spinner";

export default function Loading() {
  return (
    <div className="h-full flex items-center justify-center bg-white dark:bg-[#1F1F1F]">
      <Spinner size="lg" />
    </div>
  );
}
