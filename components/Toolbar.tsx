"use client";

import { ElementRef, useRef, useState } from "react";
import { useMutation } from "convex/react";
import TextareaAutosize from "react-textarea-autosize";
import { cn } from "@/lib/utils";

import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";

interface ToolbarProps {
  initialData: Doc<"documents">;
  preview?: boolean;
  isHeader?: boolean;
}

export const Toolbar = ({ initialData, preview, isHeader }: ToolbarProps) => {
  const inputRef = useRef<ElementRef<"textarea">>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialData.title);

  const update = useMutation(api.documents.update);

  const enableInput = () => {
    if (preview) return;

    setIsEditing(true);
    setTimeout(() => {
      setValue(initialData.title);
      inputRef.current?.focus();
    }, 0);
  };

  const disableInput = () => setIsEditing(false);

  const onInput = (value: string) => {
    setValue(value);
    update({
      id: initialData._id,
      title: value || "Untitled",
    });
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      disableInput();
    }
  };


  return (
    <div className="group relative pb-4">
      {/* Header Info Area - Removed Icon/Cover UI */}
      
      {/* Action Buttons - Removed */}


      {/* Document Title */}
      {isEditing && !preview ? (
        <TextareaAutosize
          ref={inputRef}
          onBlur={disableInput}
          onKeyDown={onKeyDown}
          value={value}
          onChange={(e) => onInput(e.target.value)}
          className={cn(
            "bg-transparent font-bold break-words outline-none text-slate-900 dark:text-slate-100 resize-none selection:bg-indigo-100 dark:selection:bg-indigo-900/30 placeholder:text-slate-300 dark:placeholder:text-slate-600 leading-tight",
            isHeader ? "text-sm" : "text-3xl"
          )}
          placeholder="Untitled"
        />
      ) : (
        <div
          onClick={enableInput}
          className={cn(
            "font-bold break-words outline-none text-slate-900 dark:text-slate-100 cursor-text hover:bg-slate-50/50 dark:hover:bg-slate-800/10 rounded-lg p-1 -ml-1 transition-colors truncate leading-tight",
            isHeader ? "text-sm pb-0 max-w-[200px]" : "text-3xl pb-[11.5px]"
          )}
        >
          {initialData.title || <span className="text-slate-300 dark:text-slate-600">Untitled</span>}
        </div>
      )}
    </div>
  );
};
