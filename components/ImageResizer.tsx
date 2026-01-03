"use client";

import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Image from "next/image";

type Align = "left" | "center" | "right";

export const ImageResizer = ({
  node,
  updateAttributes,
  selected,
}: NodeViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLElement | null>(null);

  /* ---------------- State ---------------- */

  const [tempWidth, setTempWidth] = useState(
    node.attrs.width || "300px"
  );

  useEffect(() => {
    setTempWidth(node.attrs.width || "300px");
  }, [node.attrs.width]);

  /* ---------------- Editor ---------------- */

  useEffect(() => {
    editorRef.current = document.querySelector(".ProseMirror");
  }, []);

  /* ---------------- Image URL ---------------- */

  const freshUrl = useQuery(api.uploads.getFileUrl,
    node.attrs.storageId ? { storageId: node.attrs.storageId } : "skip"
  );

  const imageSrc = freshUrl || node.attrs.src;

  /* ---------------- Resize ---------------- */

  const resizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const onResizeStart = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();

    resizing.current = true;
    startX.current = e.clientX;
    startWidth.current =
      containerRef.current?.offsetWidth || 300;

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!resizing.current) return;

    const diff = e.clientX - startX.current;
    setTempWidth(`${Math.max(120, startWidth.current + diff)}px`);
  }, []);

  const onPointerUp = useCallback(() => {
    if (resizing.current) {
      updateAttributes({ width: tempWidth });
    }
    resizing.current = false;
  }, [tempWidth, updateAttributes]);

  useEffect(() => {
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);

    return () => {
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
    };
  }, [onPointerMove, onPointerUp]);

  /* ---------------- Drag = ALIGN ---------------- */

  const onDragEnd = (e: React.PointerEvent) => {
    if (!editorRef.current) return;

    const rect = editorRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = x / rect.width;

    let align: Align = "left";
    if (ratio > 0.66) align = "right";
    else if (ratio > 0.33) align = "center";

    updateAttributes({ align });
  };

  /* ---------------- Render ---------------- */

  return (
    <NodeViewWrapper as="span">
      <div
        ref={containerRef}
        onPointerUp={onDragEnd}
        className={cn(
          "group relative my-2",
          node.attrs.align === "left" && "float-left mr-4",
          node.attrs.align === "right" && "float-right ml-4",
          node.attrs.align === "center" && "mx-auto",
          selected && "ring-2 ring-indigo-500 rounded-md"
        )}
        style={{
          width: tempWidth,
        }}
      >
        {/* Image */}
        <div className="relative rounded-xl overflow-hidden shadow-sm group-hover:shadow-xl transition-all duration-300">
          <Image
            src={imageSrc}
            alt={node.attrs.alt || "Uploaded image"}
            draggable={false}
            width={0}
            height={0}
            sizes="100vw"
            unoptimized
            style={{ width: '100%', height: 'auto' }}
            className={cn(
              "block rounded-xl transition-all duration-300",
              selected ? "brightness-[.98]" : ""
            )}
          />
          {selected && (
            <div className="absolute inset-0 ring-2 ring-indigo-500/50 ring-offset-1 dark:ring-offset-[#0b0c14] rounded-xl pointer-events-none" />
          )}
        </div>

        {/* Resize Handle - Glass Style */}
        <div
          onPointerDown={onResizeStart}
          className="
            absolute -right-3 bottom-1/2 translate-y-1/2
            h-12 w-1.5
            bg-slate-900/20 dark:bg-white/20
            backdrop-blur-md
            border border-white/20
            rounded-full
            cursor-ew-resize
            opacity-0
            group-hover:opacity-100
            transition-all duration-200
            hover:bg-indigo-500 hover:w-2
            shadow-sm
          "
        />
      </div>
    </NodeViewWrapper>
  );
};
