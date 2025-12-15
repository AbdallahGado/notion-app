"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
// File scoped explicit-any directive temporarily allowed for TipTap integration; plan to replace with precise types.
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useConvex, useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Spinner } from "@/components/spinner";
import { toast } from "sonner";
// Editor imports removed - moved to components/Editor.tsx
import { CommentType } from "../comment-types";
import { MathInline, MathBlock } from "./MathExtension"; // Keep these if used in other helpers, but they might be movable
import { SmartCommandPalette } from "./SmartCommandPalette";


import { DocumentProperties } from "./DocumentProperties";

import TemplatesModal, { templates } from "../TemplatesModal";
import SearchModal from "../SearchModal";
import TableOfContents from "./TableOfContents";

import { DocumentSkeleton } from "./DocumentSkeleton";
import { Cover } from "@/components/Cover";
import { Editor } from "@/components/Editor";
import { Toolbar as PageToolbar } from "@/components/Toolbar";
import Toolbar from "../../../_components/Toolbar";
import FloatingToolbar from "./FloatingToolbar";
import { useUser } from "@clerk/clerk-react";
import KeyboardShortcuts from "../../../_components/KeyboardShortcuts";
import CommentPopup from "../CommentPopup";

import {
  showErrorToast,
  showNetworkErrorToast,
  showAuthErrorToast,
  showFileUploadErrorToast,
  showSaveErrorToast,
} from "@/components/ui/ErrorToast";
import { useMediaQuery } from "usehooks-ts";

import { Search } from "lucide-react";
import { performSearch as doSearch } from "./utils/search-replace";
import { handleEditorShortcuts } from "./utils/keyboard-shortcuts";
import EditorToolbar from "./EditorToolbar";
import { Decoration, DecorationSet } from "prosemirror-view";
import { Node as ProseMirrorNode } from "prosemirror-model";
import TaskList from "@tiptap/extension-task-list";
import { motion, AnimatePresence } from "framer-motion";


type DocumentPageProps = Readonly<{
  params?: { id?: string };
  isSidebarCollapsed?: boolean;
  sidebarWidth?: number;
}>;

// Comment and Reply types are imported from ../comment-types

// Pure function to coerce document ID
function coerceDocumentId(v: unknown): string | undefined {
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

export default function DocumentPage(props: any) {
  // Accept "any" from Next so the runtime props can include Next-specific fields.
  // Cast to our narrower DocumentPageProps for internal usage.
  const { params } = props as DocumentPageProps;
  const { user, isSignedIn } = useUser();
  const { id } = params || {};

  const documentId = coerceDocumentId(id);

  // All hooks called unconditionally
  const client = useConvex();

  // Use the generated client API for comments
  const convexComments = useQuery(api.comments.getByDocument, {
    documentId: documentId as any,
  });
  const createComment = useMutation(api.comments.create);
  const updateComment = useMutation(api.comments.update);
  const removeComment = useMutation(api.comments.remove);
  const addReply = useMutation(api.comments.addReply);
  const editReply = useMutation(api.comments.editReply);
  const deleteReply = useMutation(api.comments.deleteReply);

  // Presence mutations
  const joinDocument = useMutation(api.presence.joinDocument);
  const leaveDocument = useMutation(api.presence.leaveDocument);
  const updatePresence = useMutation(api.presence.updatePresence);

  // Upload mutations
  const generateUploadUrl = useMutation(api.uploads.generateUploadUrl);
  const createFileMutation = useMutation(api.uploads.createFile);

  // useQuery must be called unconditionally (rules of hooks). We provide the coerced id
  // (or undefined) so the Convex client receives a predictable value. Keep a single cast
  // at the API boundary to satisfy the generated types.
  const doc = useQuery(api.documents.getById, {
    documentId: documentId as any,
  });
  const update = useMutation(api.documents.update);

  // For comment popup
  const [selectedComment, setSelectedComment] = useState<CommentType | null>(
    null
  );
  const [popupPos, setPopupPos] = useState({ x: 0, y: 0 });
  const [showToolbar, setShowToolbar] = useState(true);

  // Enhanced Search functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    { from: number; to: number }[]
  >([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [searchFilters, setSearchFilters] = useState({
    caseSensitive: false,
    wholeWord: false,
    regex: false,
    matchDiacritics: false,
    preserveCase: false,
  });
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const [showSearchFilters, setShowSearchFilters] = useState(false);

  const [replaceQuery, setReplaceQuery] = useState("");


  // Templates Modal
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);

  // Search Modal
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Mobile TOC Drawer
  const [showMobileToc, setShowMobileToc] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Smart Command Palette
  const [isSmartCommandPaletteOpen, setIsSmartCommandPaletteOpen] =
    useState(false);



  // Last saved timestamp
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    if (documentId) {
      const saved = localStorage.getItem(`recent-searches-${documentId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setRecentSearches(parsed);
          }
        } catch (error) {
          console.error(
            "Failed to parse recent searches from localStorage:",
            error
          );
        }
      }
    }
  }, [documentId]);

  // Table of Contents
  const [tocItems, setTocItems] = useState<
    { id: string; text: string; level: number; pos: number }[]
  >([]);
  const [showToc, setShowToc] = useState(true);
  const [tocProgress, setTocProgress] = useState(0);
  const [activeTocItem, setActiveTocItem] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );
  const toggleAllExpansion = useCallback(() => {
    setExpandedSections((prev) => {
      const allIds = tocItems.map((item) => item.id);
      if (prev.size === allIds.length) {
        return new Set();
      } else {
        return new Set(allIds);
      }
    });
  }, [tocItems]);

  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  const [titleSaveTimeout, setTitleSaveTimeout] =
    useState<NodeJS.Timeout | null>(null);

  const [counts, setCounts] = useState({ words: 0, chars: 0 });

  // Convert Convex comments to local format - memoized for performance
  const documentComments: CommentType[] = React.useMemo(
    () =>
      ((convexComments as any[]) || []).map((c) => ({
        id: c._id,
        from: c.from,
        to: c.to,
        text: c.text,
        resolved: c.resolved,
        replies: c.replies || [],
        userId: c.userId,
        userName: c.userName,
        userAvatar: c.userAvatar,
      })),
    [convexComments]
  );

  // Editor instance state, now lifted up from the child Editor component
  const [editor, setEditor] = useState<any>(null); // Type 'any' for now to match strictness level of file, ideally 'Editor' from @tiptap/react


  // Handler for creating comments from FloatingToolbar
  const handleCreateComment = useCallback(
    async (from: number, to: number, text: string) => {
      if (!documentId || !isSignedIn || !user?.id) {
        showAuthErrorToast();
        return;
      }
      try {
        await createComment({
          documentId: documentId as any,
          from,
          to,
          text,
          userId: user.id,
          userName: user.fullName || "Anonymous",
          userAvatar: user.imageUrl || "",
        });
        toast.success("Comment added");
      } catch (error) {
        console.error("Failed to add comment:", error);
        showErrorToast({
          message: "Failed to add comment",
          description: "Unable to save your comment. Please try again.",
          onRetry: () => {
            void handleCreateComment(from, to, text);
          },
        });
      }
    },
    [documentId, isSignedIn, user, createComment]
  );

  // Handler for selecting templates
  const handleSelectTemplate = useCallback(
    (templateId: string) => {
      const template = templates.find((t) => t.id === templateId);
      if (template && editor) {
        editor.commands.setContent(template.content);
        toast.success(`Template "${template.title}" applied`);
      }
    },
    [editor]
  );

  // TOC navigation with smooth scrolling
  const navigateToHeading = useCallback(
    (pos: number) => {
      if (!editor) return;
      editor.commands.setTextSelection(pos);
      const element = editor.view.domAtPos(pos).node;
      if (element && element.nodeType === Node.ELEMENT_NODE) {
        (element as Element).scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });
      }
    },
    [editor]
  );

  // Toggle section expansion
  const toggleSectionExpansion = useCallback((headingId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(headingId)) {
        newSet.delete(headingId);
      } else {
        newSet.add(headingId);
      }
      return newSet;
    });
  }, []);

  // File upload handler
  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!documentId || !isSignedIn) {
        showAuthErrorToast();
        return;
      }

      try {
        // Generate upload URL
        const uploadUrl = await generateUploadUrl();

        // Upload file to Convex storage
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!result.ok) {
          throw new Error(`Upload failed with status ${result.status}`);
        }

        const { storageId } = await result.json();

        // Create file record in database
        await createFileMutation({
          storageId: storageId,
          documentId: documentId as any,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        });

        // Insert image into editor if it's an image
        if (file.type.startsWith("image/")) {
          const imageUrl = await client.query(api.uploads.getFileUrl, {
            storageId,
          });
          if (editor && imageUrl) {
            editor.chain().focus().setImage({ src: imageUrl }).run();
          }
          toast.success(`Image ${file.name} uploaded and inserted.`);
        }

        toast.success(`File ${file.name} uploaded successfully`);
      } catch (error) {
        console.error("File upload failed:", error);
        if (error instanceof TypeError && error.message.includes("fetch")) {
          showNetworkErrorToast(() => handleFileUpload(file));
        } else {
          showFileUploadErrorToast(file.name, () => handleFileUpload(file));
        }
      }
    },
    [
      documentId,
      isSignedIn,
      generateUploadUrl,
      createFileMutation,
      editor,
      client,
    ]
  );

  // Separate handler for cover image upload
  const handleCoverUpload = useCallback(
    async (file: File) => {
      if (!documentId || !isSignedIn) {
        showAuthErrorToast();
        return;
      }

      try {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!result.ok) {
          throw new Error(`Upload failed with status ${result.status}`);
        }

        const { storageId } = await result.json();
        const url = await client.query(api.uploads.getFileUrl, { storageId });

        if (url) {
          await update({
            id: documentId as any,
            coverImage: url,
          });
          toast.success("Cover image updated");
        }
      } catch (error) {
        console.error("Cover upload failed:", error);
        showErrorToast({ message: "Failed to update cover image" });
      }
    },
    [documentId, isSignedIn, generateUploadUrl, update, client]
  );

  useEffect(() => {
    const updateRect = () => {
      if (containerRef.current) {
        // no-op: layout listener retained for future toolbar calculations
      }
    };
    updateRect();
    globalThis.addEventListener("resize", updateRect);
    globalThis.addEventListener("scroll", updateRect, true);
    return () => {
      globalThis.removeEventListener("resize", updateRect);
      globalThis.removeEventListener("scroll", updateRect, true);
    };
  }, []);

  // Update title and editor content when document changes
  useEffect(() => {
    if (
      editor &&
      !editor.isDestroyed &&
      typeof editor.commands?.setContent === "function" &&
      doc &&
      typeof doc.content === "string" &&
      editor.getHTML() !== doc.content
    ) {
      try {
        editor.commands.setContent(doc.content);
        // Immediately update the word/letter count after setting content
        const text = editor.getText();
        const words =
          text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;
        const chars = text.replaceAll(/\s/g, "").length;
        setCounts({ words, chars });
      } catch {
        console.error("Failed to set content");
      }
    }
    if (doc && typeof doc.content === "string") {
      setTitle(doc.title || "Untitled Document");
      // setEditorContent(doc.content); // This line was removed
    }
  }, [doc, editor]);

  // Handle presence (join/leave document)
  useEffect(() => {
    if (!documentId || !user?.id || !user?.fullName) return;

    // Join document
    joinDocument({
      documentId: documentId as any,
      userId: user.id,
      userName: user.fullName,
      userAvatar: user.imageUrl || "",
    });

    // Update presence periodically
    const interval = setInterval(() => {
      updatePresence({
        documentId: documentId as any,
        userId: user.id,
      });
    }, 30000); // Update every 30 seconds

    // Leave document on unmount
    return () => {
      clearInterval(interval);
      leaveDocument({
        documentId: documentId as any,
        userId: user.id,
      });
    };
  }, [documentId, user, joinDocument, leaveDocument, updatePresence]);

  // Save title to backend with debouncing
  const saveTitle = useCallback(
    async (value: string) => {
      setSaving(true);
      try {
        if (!documentId) throw new Error("Missing document id");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await update({ id: documentId as any, title: value });
        // toast.success("Saved");
      } catch (error) {
        console.error("Failed to save title:", error);
        showSaveErrorToast(() => saveTitle(value));
      } finally {
        setSaving(false);
      }
    },
    [documentId, update]
  );

  // Debounced title save
  const debouncedSaveTitle = useCallback(
    (value: string) => {
      if (titleSaveTimeout) clearTimeout(titleSaveTimeout);
      const timeout = setTimeout(() => {
        saveTitle(value);
      }, 1000); // Debounce title save for 1 second
      setTitleSaveTimeout(timeout);
    },
    [saveTitle, titleSaveTimeout]
  );

  // Auto-save content with debouncing
  const saveContent = useCallback(
    async (content: string) => {
      setAutoSaving(true);
      try {
        if (!documentId) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await update({ id: documentId as any, content });
        setLastSaved(new Date());
      } catch (error) {
        console.error("Failed to auto-save content:", error);
        showSaveErrorToast(() => saveContent(content));
      } finally {
        setAutoSaving(false);
      }
    },
    [documentId, update]
  );

  useEffect(() => {
    if (!editor) return;
    const handleUpdate = () => {
      if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
      const timeout = setTimeout(() => {
        const content = editor.getHTML();
        saveContent(content);
      }, 2000); // Auto-save after 2 seconds of inactivity
      setAutoSaveTimeout(timeout);
    };
    editor.on("update", handleUpdate);
    return () => {
      editor.off("update", handleUpdate);
      if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
    };
  }, [editor, saveContent, autoSaveTimeout]);

  // Cleanup title save timeout on unmount
  useEffect(() => {
    return () => {
      if (titleSaveTimeout) clearTimeout(titleSaveTimeout);
    };
  }, [titleSaveTimeout]);

  // Word and character count with debouncing
  useEffect(() => {
    if (!editor) return;
    let timeoutId: NodeJS.Timeout;
    const updateCounts = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const text = editor.getText();
        const words =
          text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;
        const chars = text.replaceAll(/\s/g, "").length;
        setCounts({ words, chars });
      }, 100); // Debounce for 100ms
    };
    updateCounts();
    editor.on("update", updateCounts);
    return () => {
      clearTimeout(timeoutId);
      editor.off("update", updateCounts);
    };
  }, [editor]);

  // Table of Contents generation with debouncing for performance - memoized
  const tocItemsMemo = React.useMemo(() => {
    if (!editor) return [];
    const doc = editor.state.doc;
    const items: {
      id: string;
      text: string;
      level: number;
      pos: number;
    }[] = [];
    doc.descendants((node: ProseMirrorNode, pos: number) => {
      if (node.type.name === "heading") {
        const level = node.attrs.level;
        const text = node.textContent;
        const id = `heading-${pos}`;
        items.push({ id, text, level, pos });
      }
    });
    return items;
  }, [editor]);

  useEffect(() => {
    setTocItems(tocItemsMemo);
    // Auto-expand all sections by default
    const allIds = new Set(tocItemsMemo.map((item) => item.id));
    setExpandedSections(allIds);
  }, [tocItemsMemo]);

  // Progress indicator and active heading tracking - memoized
  const activeTocItemMemo = React.useMemo(() => {
    if (!editor || tocItems.length === 0) return null;

    const editorElement = globalThis.document.querySelector(".ProseMirror");
    if (!editorElement) return null;

    const headings = tocItems
      .map((item) => {
        const element = editor.view.domAtPos(item.pos).node;
        return { item, element };
      })
      .filter(
        ({ element }) => element && element.nodeType === Node.ELEMENT_NODE
      );

    let activeId = null;
    for (let i = headings.length - 1; i >= 0; i--) {
      const { item, element } = headings[i];
      const rect = (element as Element).getBoundingClientRect();
      if (rect.top <= 100) {
        // Consider heading active if within 100px from top
        activeId = item.id;
        break;
      }
    }
    return activeId;
  }, [editor, tocItems]);

  useEffect(() => {
    setActiveTocItem(activeTocItemMemo);
  }, [activeTocItemMemo]);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop =
        globalThis.scrollY || globalThis.document.documentElement.scrollTop;
      const docHeight =
        globalThis.document.documentElement.scrollHeight -
        globalThis.innerHeight;
      const progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
      setTocProgress(progress);
    };

    updateProgress();
    globalThis.addEventListener("scroll", updateProgress);
    return () => globalThis.removeEventListener("scroll", updateProgress);
  }, []);

  // Keyboard navigation for TOC with null checks for editor - memoized
  const handleTocKeyDown = React.useCallback(
    (e: KeyboardEvent) => {
      if (!showToc || tocItems.length === 0) return;
      const activeElement = document.activeElement;
      if (!activeElement) return;
      if (!activeElement.classList.contains("toc-item")) return;

      const currentIndex = tocItems.findIndex(
        (item) => item.id === (activeElement as HTMLElement).dataset.id
      );
      if (currentIndex === -1) return;

      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          const nextIndex = (currentIndex + 1) % tocItems.length;
          const nextItem = document.querySelector(
            `.toc-item[data-id="${tocItems[nextIndex].id}"]`
          ) as HTMLElement;
          nextItem?.focus();
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          const prevIndex =
            currentIndex === 0 ? tocItems.length - 1 : currentIndex - 1;
          const prevItem = document.querySelector(
            `.toc-item[data-id="${tocItems[prevIndex].id}"]`
          ) as HTMLElement;
          prevItem?.focus();
          break;
        }
        case "Enter":
        case " ": {
          e.preventDefault();
          const pos = tocItems[currentIndex].pos;
          if (editor) {
            editor.commands.setTextSelection(pos);
            editor.commands.scrollIntoView();
          }
          break;
        }
        default:
          break;
      }
    },
    [showToc, tocItems, editor]
  );

  useEffect(() => {
    globalThis.addEventListener("keydown", handleTocKeyDown);
    return () => globalThis.removeEventListener("keydown", handleTocKeyDown);
  }, [handleTocKeyDown]);

  // Reply handlers using Convex mutations
  const handleAddReply = useCallback(
    async (replyText: string) => {
      if (!selectedComment) return;
      try {
        await addReply({
          commentId: selectedComment.id as any,
          text: replyText,
          from: selectedComment.from,
          to: selectedComment.to,
          userId: selectedComment.userId,
          userName: selectedComment.userName || "",
          userAvatar: selectedComment.userAvatar || "",
        });
        toast.success("Reply added");
      } catch (error) {
        console.error("Failed to add reply:", error);
        showErrorToast({
          message: "Failed to add reply",
          description: "Unable to save your reply. Please try again.",
          onRetry: () => {
            void handleAddReply(replyText);
          },
        });
      }
    },
    [selectedComment, addReply]
  );

  const handleEditReply = useCallback(
    async (replyIndex: number, newText: string) => {
      if (!selectedComment?.replies) return;
      const reply = selectedComment.replies[replyIndex];
      if (!reply) return;
      try {
        await editReply({
          commentId: selectedComment.id as any,
          replyId: reply.id,
          text: newText,
        });
        toast.success("Reply updated");
      } catch (error) {
        console.error("Failed to edit reply:", error);
        showErrorToast({
          message: "Failed to edit reply",
          description: "Unable to update your reply. Please try again.",
          onRetry: () => {
            void handleEditReply(replyIndex, newText);
          },
        });
      }
    },
    [selectedComment, editReply]
  );

  const handleDeleteReply = useCallback(
    async (replyIndex: number) => {
      if (!selectedComment?.replies) return;
      const reply = selectedComment.replies[replyIndex];
      if (!reply) return;
      try {
        await deleteReply({
          commentId: selectedComment.id as any,
          replyId: reply.id,
        });
        toast.success("Reply deleted");
      } catch (error) {
        console.error("Failed to delete reply:", error);
        showErrorToast({
          message: "Failed to delete reply",
          description: "Unable to delete your reply. Please try again.",
          onRetry: () => {
            void handleDeleteReply(replyIndex);
          },
        });
      }
    },
    [selectedComment, deleteReply]
  );

  // Enhanced search function with filters and animations - memoized
  const performSearch = React.useCallback(() => {
    if (!editor || !searchQuery.trim()) {
      setSearchResults([]);
      setCurrentSearchIndex(0);
      return;
    }

    const results = doSearch(editor, searchQuery, searchFilters);
    setSearchResults(results);
    setCurrentSearchIndex(0);

    // Add to recent searches
    if (searchQuery.trim() && !recentSearches.includes(searchQuery.trim())) {
      const updatedSearches = [
        searchQuery.trim(),
        ...recentSearches.slice(0, 4),
      ];
      setRecentSearches(updatedSearches);
      localStorage.setItem(
        `recent-searches-${documentId}`,
        JSON.stringify(updatedSearches)
      );
    }

    if (results.length > 0) {
      // Smooth scroll to first result with animation
      editor.commands.setTextSelection(results[0].from);
      const element = editor.view.domAtPos(results[0].from).node;
      if (element && element.nodeType === Node.ELEMENT_NODE) {
        (element as Element).scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
      }

    }
  }, [editor, searchQuery, searchFilters, recentSearches, documentId]);

  // Replace function with filters and animations - memoized
  const performReplace = React.useCallback(() => {
    if (!editor || !searchQuery.trim() || !replaceQuery.trim()) {
      toast.error("Please enter both search and replace text");
      return;
    }

    try {
      const text = editor.getText();

      // Reuse the search utility to find matches (indices are relative to the original text)
      const results = doSearch(editor, searchQuery, searchFilters);
      if (results.length === 0) {
        toast.info("No matches found to replace");
        return;
      }

      // Replace occurrences from the end to avoid offset calculations
      let newText = text;
      for (let i = results.length - 1; i >= 0; i--) {
        const { from, to } = results[i];
        newText = newText.slice(0, from) + replaceQuery + newText.slice(to);
      }

      editor.commands.setContent(newText);

    } catch (error) {
      console.error("Replace error:", error);
      toast.error("Replace failed");
    }
  }, [editor, searchQuery, replaceQuery, searchFilters]);

  const nextSearchResult = React.useCallback(() => {
    if (searchResults.length === 0) return;
    const nextIndex = (currentSearchIndex + 1) % searchResults.length;
    setCurrentSearchIndex(nextIndex);
    if (editor) {
      editor.commands.setTextSelection(searchResults[nextIndex].from);
      // Enhanced smooth scroll with animation and visual feedback
      const element = editor.view.domAtPos(searchResults[nextIndex].from).node;
      if (element && element.nodeType === Node.ELEMENT_NODE) {
        (element as Element).scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
        // Add temporary highlight animation
        const targetElement = element as HTMLElement;
        targetElement.style.animation = "search-highlight 0.6s ease-out";
        setTimeout(() => {
          if (targetElement) {
            targetElement.style.animation = "";
          }
        }, 600);
      }
    }

  }, [searchResults, currentSearchIndex, editor]);

  const prevSearchResult = React.useCallback(() => {
    if (searchResults.length === 0) return;
    const prevIndex =
      currentSearchIndex === 0
        ? searchResults.length - 1
        : currentSearchIndex - 1;
    setCurrentSearchIndex(prevIndex);
    if (editor) {
      editor.commands.setTextSelection(searchResults[prevIndex].from);
      // Enhanced smooth scroll with animation and visual feedback
      const element = editor.view.domAtPos(searchResults[prevIndex].from).node;
      if (element && element.nodeType === Node.ELEMENT_NODE) {
        (element as Element).scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
        // Add temporary highlight animation
        const targetElement = element as HTMLElement;
        targetElement.style.animation = "search-highlight 0.6s ease-out";
        setTimeout(() => {
          if (targetElement) {
            targetElement.style.animation = "";
          }
        }, 600);
      }
    }

  }, [searchResults, currentSearchIndex, editor]);

  // Keyboard shortcuts - memoized
  const handleGlobalKeyDown = React.useCallback(
    (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "T") {
        e.preventDefault();
        setShowToolbar((prev) => !prev);
      }
      if (e.ctrlKey && e.key === "f") {
        e.preventDefault();
        // Focus search input if exists
        const searchInput = document.getElementById("search-input");
        if (searchInput) searchInput.focus();
      }
      if (e.key === "F3" || (e.ctrlKey && e.key === "g")) {
        e.preventDefault();
        nextSearchResult();
      }
      if (
        (e.shiftKey && e.key === "F3") ||
        (e.ctrlKey && e.shiftKey && e.key === "g")
      ) {
        e.preventDefault();
        prevSearchResult();
      }

      handleEditorShortcuts(e, editor, saveContent);
    },
    [nextSearchResult, prevSearchResult, editor, saveContent]
  );

  useEffect(() => {
    globalThis.addEventListener("keydown", handleGlobalKeyDown);
    return () => globalThis.removeEventListener("keydown", handleGlobalKeyDown);
  }, [handleGlobalKeyDown]);

  // Editor click handler moved out of JSX to reduce nesting depth - memoized
  const computePopupPosition = (
    range: Range | null,
    clientX: number,
    clientY: number
  ) => {
    const popupWidth = 300; // Approximate width
    const popupHeight = 200; // Approximate height
    if (range && typeof range.getBoundingClientRect === "function") {
      const rect = range.getBoundingClientRect();
      let x = rect.left + rect.width / 2;
      let y = rect.top - 10 - popupHeight; // Above the selection

      // Adjust if off-screen
      if (x + popupWidth > globalThis.innerWidth) {
        x = globalThis.innerWidth - popupWidth - 10;
      }
      if (x < 10) x = 10;
      if (y < 10) y = rect.bottom + 10; // Below if above is off-screen

      return { x, y };
    }
    return { x: clientX, y: clientY };
  };

  const handleEditorClick = React.useCallback(
    (evt: React.MouseEvent) => {
      if (!editor?.view) {
        return;
      }
      const clientX = evt.clientX;
      const clientY = evt.clientY;
      const pos = editor.view.posAtCoords({ left: clientX, top: clientY });
      if (!pos) return;
      const found = documentComments.find(
        (c) => !c.resolved && pos.pos >= c.from && pos.pos <= c.to
      );
      if (found) {
        setSelectedComment(found);
        // Position popup relative to the selection, avoiding off-screen
        const selection = globalThis.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          setPopupPos(computePopupPosition(range, clientX, clientY));
        } else {
          setPopupPos({ x: clientX, y: clientY });
        }
      } else {
        setSelectedComment(null);
      }
    },
    [editor, documentComments]
  );

  if (doc === undefined) {
    return (
      <div className="h-screen flex items-center justify-center">
        <DocumentSkeleton />
      </div>
    );
  }
  if (!doc) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-400">
        Document not found.
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex relative h-full w-full">
      <TableOfContents
        tocItems={tocItems}
        showToc={showToc}
        activeTocItem={activeTocItem}
        expandedSections={expandedSections}
        showMobileToc={showMobileToc}
        navigateToHeading={navigateToHeading}
        toggleSectionExpansion={toggleSectionExpansion}
        toggleAllExpansion={toggleAllExpansion}
        setShowToc={setShowToc}
        setShowMobileToc={setShowMobileToc}
      />

      {/* Main Content */}
      {/* Main Content Wrapper - Flex Column for Fixed Header */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-gradient-to-br from-slate-50/30 via-white/20 to-slate-100/30 dark:from-slate-900/30 dark:via-slate-800/20 dark:to-slate-900/30 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.02)_1px,transparent_0)] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.02)_1px,transparent_0)] bg-[length:20px_20px]">
        {/* Fixed Header */}
        <div className="z-50 w-full bg-white/50 dark:bg-[#1F1F1F]/50 backdrop-blur-md border-b border-black/5 dark:border-white/5 transition-all duration-300">
          <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-2 md:py-3 flex flex-col gap-2 md:gap-3">
            <div className="flex items-center justify-between gap-4">
               <div className="flex-1 min-w-0">
                  <PageToolbar initialData={doc} />
               </div>
               <div className="flex-shrink-0">
                  <EditorToolbar
                    editor={editor}
                    showToolbar={showToolbar}
                    setShowToolbar={setShowToolbar}
                    showToc={showToc}
                    setShowToc={setShowToc}
                    setShowMobileToc={setShowMobileToc}
                    tocItemsLength={tocItems.length}
                    title={title}
                    setShowTemplatesModal={setShowTemplatesModal}
                    setShowSearchModal={setShowSearchModal}
                  />
               </div>
            </div>
          </div>
            {showToolbar && !isMobile && (
              <div className="w-full flex justify-center py-2 animate-in fade-in slide-in-from-top-2 duration-300 hidden md:flex">
                 <div className="w-full max-w-4xl">
                    <Toolbar editor={editor} disabled={saving} />
                 </div>
              </div>
            )}
            {showToolbar && isMobile && (
              <div className="w-full flex justify-center py-2 animate-in fade-in slide-in-from-top-2 duration-300 md:hidden overflow-x-auto remove-scrollbar">
                 <div className="min-w-fit px-2">
                    <Toolbar editor={editor} disabled={saving} />
                 </div>
              </div>
            )}
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto">


        <motion.div
          className={`flex-1 ${showToc && tocItems.length > 0 ? "max-w-3xl md:max-w-3xl" : "max-w-4xl md:max-w-4xl"} mx-auto p-4 sm:p-6 md:p-8 relative`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >







          {/* Editor Component with Refactored Logic */}
          <div className="w-full max-w-none relative min-h-[500px] mb-20">
             <Editor 
                initialContent={doc.content}
                editable={!doc.isArchived}
                onChange={(content) => {
                  // Only auto-save logic needs to be triggered here if not handled by editor internal debounce
                  // But our page.tsx uses an effect on 'editor' instance to attach 'update' listener.
                  // Since we pass 'setEditor', the effect in page.tsx [editor, saveContent] will still work!
                  // taking care of word count updates:
                  if (editor) {
                     const text = editor.getText();
                     const words = text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;
                     const chars = text.replaceAll(/\s/g, "").length;
                     setCounts({ words, chars });
                  }
                }}
                searchResults={searchResults}
                currentSearchIndex={currentSearchIndex}
                documentComments={documentComments}
                setEditor={setEditor}
             />
             <FloatingToolbar editor={editor} onCreateComment={handleCreateComment} comments={documentComments} />

          </div>
          {/* Static Word Count at bottom of doc */}
          <div className="w-full max-w-none px-8 md:px-12 mb-12 text-right text-xs text-slate-400 dark:text-slate-500 font-medium select-none">
            {counts.words} words • {counts.chars} characters
          </div>
          {doc === undefined && (
            <motion.div
              className="h-40 flex items-center justify-center bg-white/10 dark:bg-slate-900/20 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/30"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <Spinner />
            </motion.div>
          )}


          {/* Comment popup */}
          {selectedComment && (
            <CommentPopup
              comment={selectedComment}
              style={{
                position: "fixed",
                left: popupPos.x + 10,
                top: popupPos.y + 10,
                zIndex: 1000,
              }}
              onClose={() => setSelectedComment(null)}
              onToggleResolve={async (id: string) => {
                try {
                  await updateComment({
                    id: id as any,
                    resolved: !selectedComment.resolved,
                  });
                  // toast.success("Comment updated");
                  setSelectedComment(null);
                } catch (error) {
                  console.error("Failed to update comment:", error);
                  showErrorToast({
                    message: "Failed to update comment",
                    description:
                      "Unable to update the comment status. Please try again.",
                    onRetry: () => {
                      if (selectedComment) {
                        updateComment({
                          id: id as any,
                          resolved: !selectedComment?.resolved,
                        }).then(() => {
                          // toast.success("Comment updated");
                          setSelectedComment(null);
                        });
                      }
                    },
                  });
                }
              }}
              onDeleteComment={async (id: string) => {
                try {
                  await removeComment({ id: id as any });
                  // toast.success("Comment deleted");
                  setSelectedComment(null);
                } catch (error) {
                  console.error("Failed to delete comment:", error);
                  showErrorToast({
                    message: "Failed to delete comment",
                    description:
                      "Unable to delete the comment. Please try again.",
                    onRetry: () => {
                      removeComment({ id: id as any }).then(() => {
                        // toast.success("Comment deleted");
                        setSelectedComment(null);
                      });
                    },
                  });
                }
              }}
              onAddReply={(text: string) => handleAddReply(text)}
              onEditReply={(index: number, text: string) =>
                handleEditReply(index, text)
              }
              onDeleteReply={(index: number) => handleDeleteReply(index)}
            />
          )}


          {/* Word and character count */}


          {/* Version History Modal (lazy) */}


          {/* Templates Modal */}
            <TemplatesModal
              open={showTemplatesModal}
              onClose={() => setShowTemplatesModal(false)}
              onSelectTemplate={handleSelectTemplate}
            />

          {/* Search Modal */}
            <SearchModal
              isOpen={showSearchModal}
              onClose={() => setShowSearchModal(false)}
              onSearch={(query, filters) => {
                setSearchQuery(query);
                setSearchFilters(filters);
                performSearch();
                setShowSearchModal(false);
              }}
              onReplace={(searchQuery, replaceQuery, filters) => {
                setSearchQuery(searchQuery);
                setReplaceQuery(replaceQuery);
                setSearchFilters(filters);
                performReplace();
                setShowSearchModal(false);
              }}
              recentSearches={recentSearches}
              onAddToRecent={(query) => {
                if (!recentSearches.includes(query)) {
                  const updatedSearches = [
                    query,
                    ...recentSearches.slice(0, 4),
                  ];
                  setRecentSearches(updatedSearches);
                  localStorage.setItem(
                    `recent-searches-${documentId}`,
                    JSON.stringify(updatedSearches)
                  );
                }
              }}
            />

          {/* Toolbar at the bottom for mobile */}

        </motion.div>
      </div> {/* End scrollable content */}
      </div> {/* End flex column wrapper */}
      
      <input
        type="file"
        id="cover-upload"
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            handleCoverUpload(e.target.files[0]);
          }
        }}
      />
      {/* Keyboard shortcuts modal (listens to Ctrl+/ and custom events) */}
      <KeyboardShortcuts />
    </div>
  );
}

// Reply UI is now handled by CommentPopup.tsx
