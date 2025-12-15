"use client";

import EmojiPicker, { Theme } from "emoji-picker-react";
import { useTheme } from "@/app/_components/theme-provider";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface IconPickerProps {
  onChange: (icon: string) => void;
  children: React.ReactNode;
  asChild?: boolean;
}

export const IconPicker = ({
  onChange,
  children,
  asChild,
}: IconPickerProps) => {
  const { theme } = useTheme();
  const currentTheme = (theme || "light") as keyof typeof themeMap;

  const themeMap = {
    "dark": Theme.DARK,
    "light": Theme.LIGHT,
    "system": Theme.LIGHT, // Default to light for system if we can't detect easily here, or use logic below
  };

  // Simple system theme detection if needed, or just default to light/dark based on preference
  // Since we are in a client component, we can check window
  const resolvedTheme = theme === "system" 
    ? (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? Theme.DARK : Theme.LIGHT)
    : themeMap[theme];

  return (
    <Popover>
      <PopoverTrigger asChild={asChild}>{children}</PopoverTrigger>
      <PopoverContent className="p-0 w-full border-none shadow-none">
        <EmojiPicker
          height={350}
          theme={resolvedTheme}
          onEmojiClick={(data) => onChange(data.emoji)}
        />
      </PopoverContent>
    </Popover>
  );
};
