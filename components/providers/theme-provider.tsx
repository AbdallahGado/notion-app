"use client";

import * as React from "react";
import { ThemeProvider as CustomThemeProvider } from "../../app/_components/theme-provider";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: "dark" | "light" | "system";
  storageKey?: string;
};

export function ThemeProvider({
  children,
  ...props
}: Readonly<ThemeProviderProps>) {
  return <CustomThemeProvider {...props}>{children}</CustomThemeProvider>;
}
