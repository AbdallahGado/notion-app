/**
 * ToolbarButton Component
 *
 * A reusable button component for the rich text editor toolbar that provides:
 * - Consistent styling and behavior across all toolbar buttons
 * - Accessibility features (ARIA labels, keyboard navigation)
 * - Visual feedback for different states (active, hover, disabled)
 * - Tooltip support with keyboard shortcuts
 * - Touch-friendly sizing for mobile devices
 * - Smooth animations and transitions
 *
 * @example
 * ```tsx
 * <ToolbarButton
 *   label="Bold"
 *   icon={Bold}
 *   onClick={() => editor.chain().focus().toggleBold().run()}
 *   isActive={editor.isActive('bold')}
 *   shortcut="Ctrl+B"
 *   disabled={!editor}
 * />
 * ```
 */

import React, { memo } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { LucideIcon } from "lucide-react";

/**
 * Props for the ToolbarButton component
 */
interface ToolbarButtonProps {
  /** The display label for the button (used for accessibility and tooltips) */
  label: string;
  /** Optional Lucide icon component to display in the button */
  icon?: LucideIcon;
  /** Callback function executed when the button is clicked */
  onClick: () => void;
  /** Whether the button represents an active state (e.g., formatting is applied) */
  isActive?: boolean;
  /** Keyboard shortcut to display in the tooltip (e.g., "Ctrl+B") */
  shortcut?: string;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Custom ARIA label (overrides the default label for screen readers) */
  ariaLabel?: string;
  /** Custom content to render instead of the icon */
  children?: React.ReactNode;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = memo(
  ({
    label,
    icon: Icon,
    onClick,
    isActive = false,
    shortcut,
    disabled = false,
    ariaLabel,
    children,
  }) => {
    const tooltipText = shortcut ? `${label} (${shortcut})` : label;
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            aria-label={ariaLabel ?? label}
            aria-pressed={isActive}
            variant={isActive ? "default" : "ghost"}
            size="icon"
            type="button"
            disabled={disabled}
            onClick={onClick}
            className={`
              w-10 h-10 sm:w-8 sm:h-8 md:w-9 md:h-9 touch-manipulation
              transition-all duration-200 ease-in-out
              ${isActive
                ? 'bg-primary text-primary-foreground shadow-md scale-105'
                : 'hover:bg-accent hover:text-accent-foreground hover:scale-105'
              }
              ${disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'active:scale-95 focus:ring-2 focus:ring-offset-2 focus:ring-primary'
              }
              group
            `}
          >
            <span className={`
              transition-transform duration-200 ease-in-out
              ${isActive ? 'scale-110' : 'group-hover:scale-110'}
            `}>
              {children ?? (Icon && <Icon className="w-5 h-5 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5" />)}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent
          className="bg-popover text-popover-foreground border shadow-md"
          side="bottom"
          sideOffset={8}
        >
          {tooltipText}
        </TooltipContent>
      </Tooltip>
    );
  }
);

ToolbarButton.displayName = "ToolbarButton";

export default ToolbarButton;
