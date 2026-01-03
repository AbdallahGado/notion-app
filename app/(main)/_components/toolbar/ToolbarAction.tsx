import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";

interface ToolbarActionProps {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  shortcut?: string;
  className?: string;
}

export const ToolbarAction = ({
  label,
  icon: Icon,
  onClick,
  isActive,
  disabled,
  shortcut,
  className
}: ToolbarActionProps) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={400}>
        <TooltipTrigger asChild>
          <motion.button
            whileHover={!disabled ? { scale: 1.15 } : {}}
            whileTap={!disabled ? { scale: 0.9 } : {}}
            onClick={onClick}
            disabled={disabled}
            className={cn(
              "h-8 w-8 flex items-center justify-center transition-all duration-300 rounded-lg group/action",
              isActive 
                ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.1)]" 
                : "text-slate-500 dark:text-slate-400 hover:text-indigo-500 hover:bg-black/5 dark:hover:bg-white/5",
              disabled && "opacity-20 cursor-not-allowed grayscale",
              className
            )}
          >
            <Icon className={cn(
              "h-4 w-4 transition-transform duration-300",
              isActive && "scale-110",
              !disabled && "group-hover/action:rotate-3"
            )} />
          </motion.button>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-slate-900 border-slate-800 text-white text-[10px] font-bold py-1 px-2 rounded-md shadow-xl border border-white/5 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-x-2 px-1">
                <span className="uppercase tracking-widest">{label}</span>
                {shortcut && <span className="text-slate-500 bg-white/10 px-1 rounded text-[9px]">{shortcut}</span>}
            </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
