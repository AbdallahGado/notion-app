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
import { GripVertical, Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

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

  const filteredOrder = search.trim()
    ? toolbarOrder.filter((id) =>
        id.toLowerCase().includes(search.toLowerCase())
      )
    : toolbarOrder;

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || String(active.id) === String(over.id)) return;
    setToolbarOrder((items) => {
      const oldIndex = items.indexOf(String(active.id));
      const newIndex = items.indexOf(String(over.id));
      return arrayMove(items, oldIndex, newIndex);
    });
  }

  function toggleVisibility(id: string) {
    setToolbarVisibility((v) => ({
      ...v,
      [id]: v[id] === false ? true : false,
    }));
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
    
    const isVisible = toolbarVisibility[id] !== false;

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      zIndex: isDragging ? 100 : undefined,
      cursor: "grab" as const,
    };
    
    return (
      <li
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={() => toggleVisibility(id)}
        className={cn(
          "flex justify-between items-center px-4 py-3 text-sm border-b border-gray-100 dark:border-white/10 last:border-b-0 cursor-pointer transition-colors duration-200 select-none",
          isVisible 
            ? "bg-indigo-50/50 dark:bg-indigo-900/10 text-indigo-900 dark:text-indigo-100" 
            : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5",
          isDragging && "bg-indigo-100 dark:bg-indigo-900/30 ring-2 ring-indigo-500/20 z-50 rounded"
        )}
      >
        <span className="flex items-center gap-3">
          <GripVertical className={cn("w-4 h-4", isVisible ? "text-indigo-400" : "text-gray-300 dark:text-gray-600")} />
          <span className="capitalize font-medium">{id.replace(/([A-Z])/g, " $1")}</span>
        </span>
        <div className={cn(
          "p-1.5 rounded-full transition-all",
          isVisible ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300" : "bg-gray-100 dark:bg-white/5 text-gray-400"
        )}>
           {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </div>
      </li>
    );
  }

  // Ensure tool titles are readable
  const formatToolName = (id: string) => id.charAt(0).toUpperCase() + id.slice(1);

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[425px] overflow-hidden flex flex-col max-h-[85vh] p-0 gap-0 bg-white dark:bg-[#121212] border-gray-200 dark:border-gray-800">
        <DialogHeader className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">Customize Toolbar</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 py-4">
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tools to toggle..."
              className="h-10 bg-gray-50 dark:bg-[#1F1F1F] border-gray-200 dark:border-gray-700 focus-visible:ring-indigo-500"
            />
          </div>
          
          <ScrollArea className="flex-1 px-2">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredOrder}
                strategy={verticalListSortingStrategy}
              >
                <ul className="pb-4 space-y-1">
                  {filteredOrder.map((id) => (
                    <SortableItem key={id} id={id} />
                  ))}
                  {filteredOrder.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                       <p className="text-sm">No tools found matching "{search}"</p>
                       <p className="text-xs opacity-70">Try clearing the search.</p>
                    </div>
                  )}
                </ul>
              </SortableContext>
            </DndContext>
          </ScrollArea>
        </div>

        <div className="flex items-center justify-between gap-2 p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-transparent">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const newVisibility = { ...toolbarVisibility };
                filteredOrder.forEach(id => {
                  newVisibility[id] = true;
                });
                setToolbarVisibility(newVisibility);
              }}
              className="text-xs text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              Select All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const newVisibility = { ...toolbarVisibility };
                filteredOrder.forEach(id => {
                  newVisibility[id] = false;
                });
                setToolbarVisibility(newVisibility);
              }}
              className="text-xs text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              Deselect All
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                 resetToolbarOrder();
                 toast("Order reset");
              }}
              className="text-xs"
            >
              Reset Order
            </Button>
            <Button
              size="sm"
              onClick={() => {
                resetToolbarOrder();
                resetToolbarVisibility();
                toast("Toolbar reset to default!");
                onClose();
              }}
              className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white border-0"
            >
              Reset All
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
