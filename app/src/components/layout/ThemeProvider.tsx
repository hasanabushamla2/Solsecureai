"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

export default function ThemeProvider({
  children,
  ...props
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      {...props}
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="theme"
      scriptProps={
        typeof window === "undefined"
          ? undefined
          : { type: "application/json" }
      }
    >
      {children}
    </NextThemesProvider>
  );
}