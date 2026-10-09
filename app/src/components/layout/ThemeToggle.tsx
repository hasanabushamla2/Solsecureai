"use client";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export default function ThemeToggle({header}:{header?:boolean}) {
  
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const changeTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  if (!mounted) {
    return <div className="size-6 shrink-0" aria-hidden="true" />;
  }
  const isDark = resolvedTheme === "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={
        isDark ? "Switch to light mode" : "Switch to dark mode"
      }
      className={`${header&&"text-white"}`}
    >
      {isDark ? (
        <>
          <Moon aria-hidden="true" />
        </>
      ) : (
        <>
          <Sun aria-hidden="true" />
        </>
      )}
    </button>
  );
}
