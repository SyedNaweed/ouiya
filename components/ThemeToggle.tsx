"use client";

import React from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useApp } from "../lib/AppContext";

export type ThemeMode = "light" | "dark" | "system";

export default function ThemeToggle() {
  const { themeMode, toggleTheme } = useApp();

  return (
    <button
      onClick={toggleTheme}
      title={`Theme mode: ${themeMode} (Click to switch)`}
      aria-label="Toggle dark/light theme mode"
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-[#27272A] bg-zinc-100 dark:bg-[#1E1E1E] text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-[#27272A] transition-colors text-xs font-bold cursor-pointer shadow-xs"
    >
      {themeMode === "light" && <Sun className="w-3.5 h-3.5 text-amber-500" />}
      {themeMode === "dark" && <Moon className="w-3.5 h-3.5 text-amber-300" />}
      {themeMode === "system" && <Monitor className="w-3.5 h-3.5 text-zinc-400" />}
      <span className="capitalize hidden sm:inline">{themeMode}</span>
    </button>
  );
}
