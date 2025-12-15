"use client";

import { ElementRef, useRef, useState } from "react";
import { ImageIcon, Smile, X } from "lucide-react";
import { useMutation } from "convex/react";
import TextareaAutosize from "react-textarea-autosize";

import { Button } from "@/components/ui/button";

import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { IconPicker } from "./IconPicker";

interface ToolbarProps {
  initialData: Doc<"documents">;
  preview?: boolean;
}

export const Toolbar = ({ initialData, preview }: ToolbarProps) => {
  const inputRef = useRef<ElementRef<"textarea">>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialData.title);

  const update = useMutation(api.documents.update);
  const removeIcon = useMutation(api.documents.removeIcon);

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

  const onIconSelect = (icon: string) => {
    update({
      id: initialData._id,
      icon,
    });
  };

  const onRemoveIcon = () => {
    removeIcon({
      id: initialData._id,
    });
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
          className="text-5xl bg-transparent font-bold break-words outline-none text-slate-900 dark:text-slate-100 resize-none selection:bg-indigo-100 dark:selection:bg-indigo-900/30 placeholder:text-slate-300 dark:placeholder:text-slate-600"
          placeholder="Untitled"
        />
      ) : (
        <div
          onClick={enableInput}
          className="pb-[11.5px] text-5xl font-bold break-words outline-none text-slate-900 dark:text-slate-100 cursor-text hover:bg-slate-50/50 dark:hover:bg-slate-800/10 rounded-lg p-1 -ml-1 transition-colors"
        >
          {initialData.title || <span className="text-slate-300 dark:text-slate-600">Untitled</span>}
        </div>
      )}
    </div>
  );
};
