"use client";

import React from "react";
import KeyboardShortcuts from "@/app/(main)/_components/KeyboardShortcuts";
import { SearchFilters } from "../hooks/use-document-editor";

const TemplatesModal = React.lazy(() => import("@/app/(main)/(routes)/documents/TemplatesModal"));
const SearchModal = React.lazy(() => import("@/app/(main)/(routes)/documents/SearchModal"));

interface DocumentModalsProps {
  showTemplates: boolean;
  onCloseTemplates: () => void;
  onSelectTemplate: (templateId: string) => void;
  showSearch: boolean;
  onCloseSearch: () => void;
  onSearch: (query: string, filters: SearchFilters) => void;
  onReplace: (sQuery: string, rQuery: string, filters: SearchFilters) => void;
  recentSearches: string[];
  onAddToRecent: (query: string) => void;
}

export const DocumentModals = React.memo(({
  showTemplates,
  onCloseTemplates,
  onSelectTemplate,
  showSearch,
  onCloseSearch,
  onSearch,
  onReplace,
  recentSearches,
  onAddToRecent,
}: DocumentModalsProps) => {
  return (
    <React.Suspense fallback={null}>
      {showTemplates && (
        <TemplatesModal
          open={showTemplates}
          onClose={onCloseTemplates}
          onSelectTemplate={onSelectTemplate}
        />
      )}
      {showSearch && (
        <SearchModal
          isOpen={showSearch}
          onClose={onCloseSearch}
          onSearch={onSearch}
          onReplace={onReplace}
          recentSearches={recentSearches}
          onAddToRecent={onAddToRecent}
        />
      )}
      <KeyboardShortcuts />
    </React.Suspense>
  );
});
