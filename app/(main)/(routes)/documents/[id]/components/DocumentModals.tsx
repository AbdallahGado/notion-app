"use client";

import React from "react";
import TemplatesModal from "@/app/(main)/(routes)/documents/TemplatesModal";
import SearchModal from "@/app/(main)/(routes)/documents/SearchModal";
import KeyboardShortcuts from "@/app/(main)/_components/KeyboardShortcuts";
import { SearchFilters } from "../hooks/use-document-editor";

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

export const DocumentModals = ({
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
    <>
      <TemplatesModal
        open={showTemplates}
        onClose={onCloseTemplates}
        onSelectTemplate={onSelectTemplate}
      />
      <SearchModal
        isOpen={showSearch}
        onClose={onCloseSearch}
        onSearch={onSearch}
        onReplace={onReplace}
        recentSearches={recentSearches}
        onAddToRecent={onAddToRecent}
      />
      <KeyboardShortcuts />
    </>
  );
};
