"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "devhub-theme";
type ThemeMode = "light" | "dark";

function applyTheme(theme: ThemeMode) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const initialTheme: ThemeMode = saved === "dark" ? "dark" : "light";
    setTheme(initialTheme);
    applyTheme(initialTheme);
    setReady(true);
  }, []);

  const toggleTheme = () => {
    const nextTheme: ThemeMode = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    applyTheme(nextTheme);
    localStorage.setItem(STORAGE_KEY, nextTheme);
  };

  return (
    <button
      className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-surface-secondary text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
      onClick={toggleTheme}
      aria-label={ready && theme === "dark" ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"}
      type="button"
    >
      {ready && theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
