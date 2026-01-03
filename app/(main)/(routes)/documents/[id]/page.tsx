"use client";

import { useState, useCallback } from "react";
import { useMediaQuery } from "usehooks-ts";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { useUser } from "@clerk/clerk-react";

import { DocumentSkeleton } from "./DocumentSkeleton";
import { Editor } from "@/components/Editor";
import TableOfContents from "./TableOfContents";
import CommentPopup from "../CommentPopup";
import { CommentType } from "../comment-types";
import EditorToolbar from "./EditorToolbar";
import { DocumentHeader } from "./components/DocumentHeader";
import { DocumentModals } from "./components/DocumentModals";
import { templates } from "@/app/(main)/(routes)/documents/TemplatesModal";

import { useDocumentEditor } from "./hooks/use-document-editor";
import { useDocumentActions } from "./hooks/use-document-actions";
import { useSidebar } from "@/components/providers/sidebar-provider";

const coerceDocumentId = (v: unknown): string | undefined => 
  typeof v === "string" && v.length > 0 ? v : undefined;

export default function DocumentPage({ params }: { params: { id?: string } }) {
  const { isSignedIn } = useUser();
  const documentId = coerceDocumentId(params?.id);
  const isLargeScreen = useMediaQuery("(min-width: 1280px)");
  const { isCollapsed, resetWidth } = useSidebar();

  // Convex Queries & Mutations
  const doc = useQuery(api.documents.getById, { documentId: documentId as Id<"documents"> });
  const update = useMutation(api.documents.update);
  const convexComments = useQuery(api.comments.getByDocument, { documentId: documentId as Id<"documents"> });
  const updateComment = useMutation(api.comments.update);
  const removeComment = useMutation(api.comments.remove);
  
  // Local UI State
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showToc, setShowToc] = useState(true);
  const [showMobileToc, setShowMobileToc] = useState(false);
  const [selectedComment, setSelectedComment] = useState<CommentType | null>(null);

  // Modular Hooks
  const {
    editor, setEditor, counts, searchResults, currentSearchIndex, recentSearches,
    performSearch, performReplace, tocItems,
    expandedSections, toggleAllExpansion, toggleSectionExpansion, navigateToHeading
  } = useDocumentEditor({
    documentId,
    initialContent: doc?.content,
    onSave: async (content) => {
      if (documentId) await update({ id: documentId as Id<"documents">, content });
    }
  });

  const { handleFileUpload, handleExportHTML, handleExportMarkdown, handleExportPDF } = useDocumentActions({
    documentId,
    title: doc?.title || "Untitled",
    editor,
    isSignedIn
  });

  // Comment Handlers (Could be moved to its own hook later)
  const onToggleResolve = useCallback(async (id: string, resolved: boolean) => {
    try {
      await updateComment({ id: id as Id<"comments">, resolved: !resolved });
      setSelectedComment(null);
    } catch (e) {
      console.error("Failed to update comment", e);
    }
  }, [updateComment]);

  const onDeleteComment = useCallback(async (id: string) => {
    try {
      await removeComment({ id: id as Id<"comments"> });
      setSelectedComment(null);
    } catch (e) {
      console.error("Failed to delete comment", e);
    }
  }, [removeComment]);

  if (doc === undefined) return <div className="h-screen flex items-center justify-center"><DocumentSkeleton /></div>;
  if (!doc) return <div className="h-screen flex items-center justify-center text-gray-400">Document not found.</div>;

  return (
    <div className="flex relative h-full w-full">
      <TableOfContents
        tocItems={tocItems}
        showToc={showToc}
        expandedSections={expandedSections}
        showMobileToc={showMobileToc}
        navigateToHeading={navigateToHeading}
        toggleSectionExpansion={toggleSectionExpansion}
        toggleAllExpansion={toggleAllExpansion}
        setShowToc={setShowToc}
        setShowMobileToc={setShowMobileToc}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden bg-gradient-to-br from-slate-50/30 via-white/20 to-slate-100/30 dark:from-slate-900/30 dark:via-slate-800/20 dark:to-slate-900/30">
        <DocumentHeader
          doc={doc}
          isLargeScreen={isLargeScreen}
          isCollapsed={isCollapsed}
          onResetWidth={resetWidth}
          showToc={showToc}
          onToggleToc={() => isLargeScreen ? setShowToc(!showToc) : setShowMobileToc(true)}
          onOpenMobileSidebar={() => document.dispatchEvent(new CustomEvent("open-mobile-sidebar"))}
          onShowSearch={() => setShowSearchModal(true)}
          onShowTemplates={() => setShowTemplatesModal(true)}
          onExportHTML={handleExportHTML}
          onExportMarkdown={handleExportMarkdown}
          onExportPDF={handleExportPDF}
          tocItemsCount={tocItems.length}
        />

        <div className="flex-1 overflow-y-auto pb-40 scroll-smooth">
          <div className="flex-1 max-w-4xl mx-auto p-8 sm:p-12 md:p-16 relative">
            <EditorToolbar editor={editor} onFileUpload={handleFileUpload} />
            <div className="w-full max-w-none relative min-h-[500px] mb-20">
              <Editor
                initialContent={doc.content}
                editable={!doc.isArchived}
                onChange={() => {}}
                searchResults={searchResults}
                currentSearchIndex={currentSearchIndex}
                documentComments={convexComments}
                setEditor={setEditor}
              />
            </div>

            <div className="fixed bottom-6 right-8 z-[100] px-3.5 py-1.5 rounded-full bg-white/60 dark:bg-[#0b0c14]/60 backdrop-blur-md border border-black/5 dark:border-white/5 shadow-sm text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 hidden md:block">
              {counts.words} <span className="text-[10px] uppercase opacity-60">words</span> | {counts.chars} <span className="text-[10px] uppercase opacity-60">chars</span>
            </div>

            {selectedComment && (
              <CommentPopup
              
                comment={selectedComment}
                onClose={() => setSelectedComment(null)}
                onToggleResolve={(id) => onToggleResolve(id, !!selectedComment.resolved)}
                onDeleteComment={onDeleteComment}
                onAddReply={() => { /* handle reply */ }}
                onEditReply={() => { /* handle edit */ }}
                onDeleteReply={() => { /* handle delete */ }}
              />
            )}
          </div>
        </div>
      </div>

      <DocumentModals
        showTemplates={showTemplatesModal}
        onCloseTemplates={() => setShowTemplatesModal(false)}
        onSelectTemplate={(id) => {
          const template = templates.find(t => t.id === id);
          if (template && editor) {
            editor.commands.setContent(template.content);
            toast.success(`Template "${template.title}" applied`);
          }
          setShowTemplatesModal(false);
        }}
        showSearch={showSearchModal}
        onCloseSearch={() => setShowSearchModal(false)}
        onSearch={performSearch}
        onReplace={performReplace}
        recentSearches={recentSearches}
        onAddToRecent={() => {}}
      />
    </div>
  );
}
