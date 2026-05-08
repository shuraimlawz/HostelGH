"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch by only rendering after mount
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center bg-gray-100 dark:bg-[#151518] rounded-full p-1 w-[104px] h-[36px] border border-gray-200 dark:border-gray-800 animate-pulse" />
    );
  }

  return (
    <div className="flex items-center bg-gray-100 dark:bg-[#151518] rounded-full p-1 relative shadow-inner border border-gray-200 dark:border-gray-800/60">
      <button
        onClick={() => setTheme("dark")}
        aria-label="Dark mode"
        className={cn(
          "relative z-10 w-8 h-7 rounded-full flex items-center justify-center transition-all duration-300",
          theme === "dark" ? "text-blue-500" : "text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
        )}
      >
        <Moon size={14} strokeWidth={2.5} />
      </button>
      
      <button
        onClick={() => setTheme("light")}
        aria-label="Light mode"
        className={cn(
          "relative z-10 w-8 h-7 rounded-full flex items-center justify-center transition-all duration-300",
          theme === "light" ? "text-amber-500" : "text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
        )}
      >
        <Sun size={15} strokeWidth={2.5} />
      </button>

      <button
        onClick={() => setTheme("system")}
        aria-label="System theme"
        className={cn(
          "relative z-10 w-8 h-7 rounded-full flex items-center justify-center transition-all duration-300",
          theme === "system" ? "text-gray-900 dark:text-white" : "text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
        )}
      >
        <Monitor size={14} strokeWidth={2.5} />
      </button>

      {/* Sliding Indicator Background */}
      <div 
        className={cn(
          "absolute top-1 left-1 w-8 h-7 rounded-full bg-white dark:bg-[#27272A] shadow-sm border border-gray-200 dark:border-gray-700/50 transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)",
          theme === "dark" ? "translate-x-0" : 
          theme === "light" ? "translate-x-8" : 
          "translate-x-16"
        )}
      />
    </div>
  );
}
