import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-background",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-modern-primary-500 to-modern-primary-600 text-white hover:from-modern-primary-600 hover:to-modern-primary-700 shadow-modern-medium hover:shadow-modern-strong hover:scale-[1.02] active:scale-[0.98]",
        destructive:
          "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-modern-medium hover:shadow-modern-strong hover:scale-[1.02] active:scale-[0.98]",
        outline:
          "border-2 border-modern-primary-300 bg-transparent text-modern-primary-700 hover:bg-modern-primary-50 hover:border-modern-primary-400 dark:border-modern-primary-600 dark:text-modern-primary-300 dark:hover:bg-modern-primary-900/20 shadow-modern-soft hover:shadow-modern-medium",
        secondary:
          "bg-gradient-to-r from-modern-secondary-500 to-modern-secondary-600 text-white hover:from-modern-secondary-600 hover:to-modern-secondary-700 shadow-modern-medium hover:shadow-modern-strong hover:scale-[1.02] active:scale-[0.98]",
        ghost:
          "text-modern-neutral-700 hover:bg-modern-neutral-100 hover:text-modern-neutral-900 dark:text-modern-neutral-300 dark:hover:bg-modern-neutral-800 dark:hover:text-modern-neutral-100",
        link: "text-modern-primary-600 underline-offset-4 hover:underline hover:text-modern-primary-700 dark:text-modern-primary-400 dark:hover:text-modern-primary-300 p-0 h-auto",
        modern:
          "bg-gradient-to-r from-modern-primary-500 via-modern-primary-600 to-modern-accent-500 text-white hover:from-modern-primary-600 hover:via-modern-primary-700 hover:to-modern-accent-600 shadow-modern-glow hover:shadow-modern-glow-strong hover:scale-[1.02] active:scale-[0.98] btn-modern",
        glass:
          "glass text-white hover:bg-white/10 shadow-modern-medium hover:shadow-modern-strong backdrop-blur-md border border-white/20",
      },
      size: {
        default: "h-11 px-6 py-3",
        sm: "h-9 px-4 py-2 text-xs",
        lg: "h-13 px-8 py-4 text-base",
        xl: "h-15 px-10 py-5 text-lg",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
