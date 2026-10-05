import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";
type ThemePreference = Theme | "system";

interface ThemeContextType {
  theme: Theme;
  preference: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
  toggleTheme: () => void;
  switchable: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemePreference;
  switchable?: boolean;
}

function getSystemTheme(): Theme {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getStoredPreference(defaultTheme: ThemePreference): ThemePreference {
  if (typeof window === "undefined") return defaultTheme;
  const stored = window.localStorage.getItem("portfolio-theme");
  if (stored === "light" || stored === "dark" || stored === "system") return stored;
  return defaultTheme;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  switchable = true,
}: ThemeProviderProps) {
  const [preference, setPreference] = useState<ThemePreference>(() =>
    switchable ? getStoredPreference(defaultTheme) : defaultTheme,
  );
  const [systemTheme, setSystemTheme] = useState<Theme>(getSystemTheme);

  useEffect(() => {
    if (!switchable || typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event: MediaQueryListEvent) =>
      setSystemTheme(event.matches ? "dark" : "light");
    setSystemTheme(media.matches ? "dark" : "light");
    media.addEventListener?.("change", handleChange);
    return () => media.removeEventListener?.("change", handleChange);
  }, [switchable]);

  const theme: Theme = preference === "system" ? systemTheme : preference;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.dataset.theme = theme;

    if (switchable) {
      window.localStorage.setItem("portfolio-theme", preference);
    }
  }, [theme, preference, switchable]);

  const setTheme = (next: ThemePreference) => {
    setPreference(next);
  };

  const toggleTheme = () => {
    setPreference((current) => {
      const resolved: Theme = current === "system" ? systemTheme : current;
      return resolved === "light" ? "dark" : "light";
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, preference, setTheme, toggleTheme, switchable }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
