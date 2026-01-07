"use client";

export const dynamic = 'force-dynamic';

import { useState, useCallback, useEffect } from "react";
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
import { cn } from "@/lib/utils";



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

  // Local UI State for Format & Border (Client-side fallback)
  const [localFormat, setLocalFormat] = useState<string | undefined>(undefined);
  const [localHasBorder, setLocalHasBorder] = useState<boolean | undefined>(undefined);
  const [localFont, setLocalFont] = useState<string>("default");
  const [localMargin, setLocalMargin] = useState<string>("standard");
  const [localLineHeight, setLocalLineHeight] = useState<string>("normal");

  // Initialize from localStorage
  useEffect(() => {
    if (documentId) {
      const savedFormat = localStorage.getItem(`notion-clone-format-${documentId}`);
      if (savedFormat) setLocalFormat(savedFormat);
      
      const savedBorder = localStorage.getItem(`notion-clone-border-${documentId}`);
      if (savedBorder) setLocalHasBorder(savedBorder === "true");

      const savedFont = localStorage.getItem(`notion-clone-font-${documentId}`);
      if (savedFont) setLocalFont(savedFont);

      const savedMargin = localStorage.getItem(`notion-clone-margin-${documentId}`);
      if (savedMargin) setLocalMargin(savedMargin);

      const savedLineHeight = localStorage.getItem(`notion-clone-line-height-${documentId}`);
      if (savedLineHeight) setLocalLineHeight(savedLineHeight);
    }
  }, [documentId]);

  const handleFormatChange = (format: string | undefined) => {
    setLocalFormat(format);
    if (documentId) {
      if (format) {
        localStorage.setItem(`notion-clone-format-${documentId}`, format);
      } else {
        localStorage.removeItem(`notion-clone-format-${documentId}`);
      }
    }
    toast.success(format ? `Format set to ${format}` : "Format reset to Full Width");
  };

  const handleBorderToggle = () => {
    setLocalHasBorder(prev => {
      const newState = !prev;
      if (documentId) {
        localStorage.setItem(`notion-clone-border-${documentId}`, String(newState));
      }
      toast.success(newState ? "Border added" : "Border removed");
      return newState;
    });
  };

  const handleFontChange = (font: string) => {
    setLocalFont(font);
    if (documentId) localStorage.setItem(`notion-clone-font-${documentId}`, font);
    toast.success(`Font set to ${font}`);
  };

  const handleMarginChange = (margin: string) => {
    setLocalMargin(margin);
    if (documentId) localStorage.setItem(`notion-clone-margin-${documentId}`, margin);
    toast.success(`Margin set to ${margin}`);
  };



  const handleLineHeightChange = (height: string) => {
    setLocalLineHeight(height);
    if (documentId) localStorage.setItem(`notion-clone-line-height-${documentId}`, height);
    toast.success(`Line spacing set to ${height}`);
  };

  // Determine effective values (prioritize local state if set, else doc)
  // Note: For border, if local is undefined, verify if doc has it. 
  // Ideally, doc.format/hasBorder are the source of truth, but due to server sync issues, we fallback to local.
  const effectiveFormat = localFormat ?? doc?.format;
  const effectiveHasBorder = localHasBorder ?? doc?.hasBorder;

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
          doc={doc} // We still pass doc, but override visual state in the layout below
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
          onFormatChange={handleFormatChange}
          onBorderToggle={handleBorderToggle}
          font={localFont}
          margin={localMargin}
          onFontChange={handleFontChange}
          onMarginChange={handleMarginChange}
          lineHeight={localLineHeight}
          onLineHeightChange={handleLineHeightChange}
        />

        <div className="flex-1 overflow-y-auto pb-40 scroll-smooth">
          <div className="flex-1 max-w-4xl mx-auto p-8 sm:p-12 md:p-16 relative">

            <div 
              className={cn(
                "w-full max-w-none relative min-h-[500px] mb-20 transition-all duration-300 mx-auto bg-white/50 dark:bg-[#1A1B26]/50 backdrop-blur-sm",
                effectiveHasBorder && "border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl",
                // Padding based on margin selection
                localMargin === "standard" && "p-8 sm:p-12 md:p-16",
                localMargin === "wide" && "p-12 sm:p-20 md:p-24",
                localMargin === "narrow" && "p-4 sm:p-8 md:p-8",
                
                // Font family
                localFont === "serif" && "font-serif",
                localFont === "mono" && "font-mono",
                // Default font is already sans

                // Line Height
                localLineHeight === "tight" && "[&_.ProseMirror]:leading-tight [&_.ProseMirror_p]:leading-tight",
                localLineHeight === "loose" && "[&_.ProseMirror]:leading-loose [&_.ProseMirror_p]:leading-loose",
                localLineHeight === "normal" && "[&_.ProseMirror]:leading-normal [&_.ProseMirror_p]:leading-normal",

                effectiveFormat === "A4" && "max-w-[210mm] min-h-[297mm]",
                effectiveFormat === "A5" && "max-w-[148mm] min-h-[210mm]",
                effectiveFormat === "Letter" && "max-w-[216mm] min-h-[279mm]",
                !effectiveFormat && "max-w-4xl" // Default behavior
              )}
            >
            <EditorToolbar editor={editor} onFileUpload={handleFileUpload} />

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
