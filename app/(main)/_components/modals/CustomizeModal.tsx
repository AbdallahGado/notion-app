import React, { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

interface CustomizeModalProps {
  open: boolean;
  onClose: () => void;
  toolbarOrder: string[];
  editor?: unknown;
  setToolbarOrder: (order: string[] | ((order: string[]) => string[])) => void;
  toolbarVisibility: Record<string, boolean>;
  setToolbarVisibility: (
    v:
      | Record<string, boolean>
      | ((v: Record<string, boolean>) => Record<string, boolean>)
  ) => void;
  resetToolbarOrder: () => void;
  resetToolbarVisibility: () => void;
  toast: (msg: string) => void;
}

export const CustomizeModal: React.FC<CustomizeModalProps> = ({
  open,
  onClose,
  toolbarOrder,
  setToolbarOrder,
  toolbarVisibility,
  setToolbarVisibility,
  resetToolbarOrder,
  resetToolbarVisibility,
  toast,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );
  const [search, setSearch] = useState("");
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);
  if (!open) return null;

  const filteredOrder = search.trim()
    ? toolbarOrder.filter((id) =>
        id.toLowerCase().includes(search.toLowerCase())
      )
    : toolbarOrder;
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    // If there's no over target or it's the same item, do nothing
    if (!over || String(active.id) === String(over.id)) return;
    setToolbarOrder((items) => {
      const oldIndex = items.indexOf(String(active.id));
      const newIndex = items.indexOf(String(over.id));
      return arrayMove(items, oldIndex, newIndex);
    });
  }
  function SortableItem({ id }: { id: string }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      zIndex: isDragging ? 100 : undefined,
      cursor: "grab" as const,
      background: isDragging ? "#e0e7ff" : undefined,
    };
    return (
      <li
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="flex justify-between items-center py-2 text-sm border-b border-gray-200 dark:border-gray-700 last:border-b-0"
      >
        <span className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-gray-400 mr-2 cursor-grab" />
          {id}
        </span>
        <input
          type="checkbox"
          checked={toolbarVisibility[id] !== false}
          onChange={(e) =>
            setToolbarVisibility((v) => ({
              ...v,
              [id]: e.target.checked,
            }))
          }
          aria-label={`Show ${id}`}
        />
      </li>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#23233a] p-6 rounded-lg shadow-xl w-96 max-w-full flex flex-col gap-4 relative"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold text-lg">Customize Toolbar</div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xl"
          >
            ×
          </button>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search toolbar buttons..."
          className="mb-3 px-3 py-2 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#23233a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
        />
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredOrder}
            strategy={verticalListSortingStrategy}
          >
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredOrder.map((id) => (
                <SortableItem key={id} id={id} />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
        <button
          type="button"
          onClick={resetToolbarVisibility}
          className="mt-4 px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 text-xs"
        >
          Reset to Default
        </button>
        <button
          type="button"
          onClick={() => {
            resetToolbarOrder();
            resetToolbarVisibility();
            toast("Toolbar reset to default!");
            onClose();
          }}
          className="mt-4 px-3 py-1 rounded bg-indigo-500 text-white hover:bg-indigo-700 text-xs"
        >
          Reset Toolbar
        </button>
      </div>
    </div>
  );
};
