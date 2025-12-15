"use client";

import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud } from "lucide-react";

import { showErrorToast } from "./ErrorToast";

type DropZoneProps = {
  readonly onFileUpload: (file: File) => void;
  readonly disabled?: boolean;
  readonly className?: string;
};

export function DropZone({
  onFileUpload,
  disabled = false,
  className = "",
}: DropZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        if (file.size > 10 * 1024 * 1024) {
          // 10MB limit
          showErrorToast({
            message: "File too large",
            description: `File "${file.name}" exceeds the 10MB limit. Please choose a smaller file.`,
          });
          return;
        }
        onFileUpload(file);
      });
    },
    [onFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
      "video/*": [".mp4", ".webm", ".ogg"],
      "application/pdf": [".pdf"],
      "text/*": [".txt", ".md"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-4 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-500 ease-in-out shadow-2xl hover:shadow-3xl backdrop-blur-md ${
        isDragActive
          ? "border-blue-500 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 dark:from-blue-900 dark:via-indigo-900 dark:to-purple-900 scale-105 animate-pulse"
          : "border-gray-400 dark:border-gray-500 hover:border-blue-500 dark:hover:border-blue-400 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900 dark:hover:to-indigo-900"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      <input {...getInputProps()} />
      <UploadCloud
        className={`w-20 h-20 mx-auto mb-6 transition-all duration-300 ${isDragActive ? "text-indigo-600 dark:text-indigo-400 animate-bounce" : "text-gray-500 dark:text-gray-400"}`}
      />
      <p
        className={`text-xl sm:text-2xl font-bold mb-3 transition-colors duration-300 ${isDragActive ? "text-indigo-800 dark:text-indigo-200" : "text-gray-900 dark:text-white"}`}
      >
        {isDragActive ? "Drop files here..." : "Drag & drop files here"}
      </p>
      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4">
        or click to select files (images, videos, PDFs, documents)
      </p>
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
          Images
        </span>
        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
          Videos
        </span>
        <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
          PDFs
        </span>
        <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded-full text-xs font-medium">
          Documents
        </span>
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-400">
        Maximum file size: 10MB
      </p>
    </div>
  );
}
