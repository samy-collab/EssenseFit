import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";

type Theme = "dark";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.dataset.theme = "dark";
    document.documentElement.classList.add("dark");
    window.localStorage.setItem("essencefit_theme", "dark");
  }, []);

  const value = useMemo<ThemeContextValue>(() => ({ theme: "dark", toggleTheme: () => undefined }), []);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
