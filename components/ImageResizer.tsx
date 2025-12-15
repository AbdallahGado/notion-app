"use client";

import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import { useCallback, useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

export const ImageResizer = (props: NodeViewProps) => {
  const { node, updateAttributes, selected } = props;
  const [resizing, setResizing] = useState(false);
  const [width, setWidth] = useState(node.attrs.width || "100%");
  
  // Convert standard HTML width to number if possible for calculation, else use container reference
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setResizing(true);
    startXRef.current = e.clientX;
    
    // Get current width in pixels
    if (containerRef.current) {
        startWidthRef.current = containerRef.current.offsetWidth;
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!resizing) return;
    
    const diff = e.clientX - startXRef.current;
    const newWidth = Math.max(100, startWidthRef.current + diff); // Min 100px
    
    // Update local state for smoothness
    setWidth(`${newWidth}px`);
  }, [resizing]);

  const onMouseUp = useCallback(() => {
    setResizing(false);
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
    
    // Commit the change
    updateAttributes({ width: width });
  }, [width, updateAttributes, onMouseMove]);

  // Clean up listeners if unmounted while resizing
  useEffect(() => {
     return () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
     };
  }, [onMouseMove, onMouseUp]);

  return (
    <NodeViewWrapper className="image-resizer-wrapper flex justify-center py-2 relative group">
      <div 
         ref={containerRef}
         className={cn(
            "relative inline-block transition-shadow duration-200",
            (selected || resizing) && "ring-2 ring-indigo-500 rounded-md shadow-lg"
         )}
         style={{ width: node.attrs.width || width, maxWidth: "100%" }}
      >
        {/* The Image */}
        <img
          src={node.attrs.src}
          alt={node.attrs.alt}
          className="rounded-md border border-transparent"
          style={{ width: "100%", height: "auto", display: "block" }}
        />

        {/* Resize Handle */}
        {(selected || resizing) && (
            <div
                onMouseDown={onMouseDown}
                className="absolute right-2 bottom-2 h-4 w-4 bg-indigo-500 border-2 border-white rounded-full cursor-nwse-resize z-10 hover:scale-125 transition-transform"
                title="Resize"
            />
        )}
        
        {/* Delete button (optional, can just use backspace) */}
      </div>
    </NodeViewWrapper>
  );
};
