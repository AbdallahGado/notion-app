"use client";

import { useCallback } from "react";
import { useMutation, useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { 
  showAuthErrorToast, 
  showErrorToast, 
  showFileUploadErrorToast
} from "@/components/ui/ErrorToast";
import { Editor } from "@tiptap/react";

interface UseDocumentActionsProps {
  documentId: string | undefined;
  title: string;
  editor: Editor | null;
  isSignedIn: boolean | undefined;
}

export const useDocumentActions = ({
  documentId,
  title,
  editor,
  isSignedIn,
}: UseDocumentActionsProps) => {
  const client = useConvex();
  const update = useMutation(api.documents.update);
  const generateUploadUrl = useMutation(api.uploads.generateUploadUrl);
  const createFileMutation = useMutation(api.uploads.createFile);

  const saveTitle = useCallback(async (newTitle: string) => {
    if (!documentId) return;
    try {
      await update({ id: documentId as Id<"documents">, title: newTitle });
    } catch (error) {
      console.error("Failed to save title", error);
      showErrorToast({ message: "Failed to save title" });
    }
  }, [documentId, update]);

  const handleFileUpload = useCallback(async (file: File) => {
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

      if (!result.ok) throw new Error("Upload failed");

      const { storageId } = await result.json();

      await createFileMutation({
        storageId,
        documentId: documentId as Id<"documents">,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });

      if (file.type.startsWith("image/")) {
        const imageUrl = await client.query(api.uploads.getFileUrl, { storageId });
        if (editor && imageUrl) {
          editor.chain().focus().setImage({ src: imageUrl }).run();
        }
      }
      toast.success("File uploaded");
    } catch {
      showFileUploadErrorToast(file.name, () => handleFileUpload(file));
    }
  }, [documentId, isSignedIn, generateUploadUrl, createFileMutation, editor, client]);

  const handleExportHTML = useCallback(() => {
    if (!editor) return;
    const html = editor.getHTML();
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "document"}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported to HTML");
  }, [editor, title]);

  const handleExportMarkdown = useCallback(() => {
    if (!editor) return;
    const html = editor.getHTML();
    const markdown = html
        .replaceAll(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n\n")
        .replaceAll(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n")
        .replaceAll(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n\n")
        .replaceAll(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n")
        .replaceAll(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**")
        .replaceAll(/<em[^>]*>(.*?)<\/em>/gi, "*$1*")
        .replaceAll(/<code[^>]*>(.*?)<\/code>/gi, "`$1`")
        .replaceAll(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gi, "```\n$1\n```\n\n")
        .replaceAll(/<ul[^>]*>(.*?)<\/ul>/gi, "$1\n")
        .replaceAll(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n")
        .replaceAll(/<br[^>]*>/gi, "\n")
        .replaceAll("&nbsp;", " ")
        .replaceAll("<", "<")
        .replaceAll(">", ">")
        .replaceAll("&amp;", "&")
        .replaceAll('"', '"')
        .replaceAll("&#39;", "'")
        .replaceAll("&quot;", '"');

    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "document"}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported to Markdown");
  }, [editor, title]);

  const handleExportPDF = useCallback(async () => {
    const element = document.querySelector(".ProseMirror") as HTMLElement;
    if (!element) return;
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const opt = {
        margin: 1,
        filename: `${title || "document"}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" as const },
      };
      await html2pdf().set(opt).from(element).save();
      toast.success("Exported to PDF");
    } catch {
      toast.error("PDF export failed");
    }
  }, [title]);

  return {
    saveTitle,
    handleFileUpload,
    handleExportHTML,
    handleExportMarkdown,
    handleExportPDF,
  };
};
