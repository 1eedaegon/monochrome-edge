import { useState, useEffect } from "react";

export type Theme = "warm" | "cold";
export type Mode = "light" | "dark";

export interface ThemeConfig {
  theme: Theme;
  mode: Mode;
  toggleTheme: () => void;
  toggleMode: () => void;
  setTheme: (theme: Theme) => void;
  setMode: (mode: Mode) => void;
}

export const useTheme = (
  initialTheme: Theme = "warm",
  initialMode: Mode = "light",
): ThemeConfig => {
  const [theme, setThemeState] = useState<Theme>(initialTheme);
  const [mode, setModeState] = useState<Mode>(initialMode);

  useEffect(() => {
    // Load theme CSS
    const themeLink = document.getElementById("theme-link") as HTMLLinkElement;
    if (!themeLink) {
      const link = document.createElement("link");
      link.id = "theme-link";
      link.rel = "stylesheet";
      link.href = `/ui/tokens/${theme}-theme.css`;
      document.head.appendChild(link);
    } else {
      themeLink.href = `/ui/tokens/${theme}-theme.css`;
    }

    // Load main CSS if not already loaded
    const mainCSSId = "monochrome-main-css";
    if (!document.getElementById(mainCSSId)) {
      const link = document.createElement("link");
      link.id = mainCSSId;
      link.rel = "stylesheet";
      link.href = "/ui/monochrome-edge.css";
      document.head.appendChild(link);
    }

    // Set mode attribute
    document.documentElement.setAttribute("data-theme", mode);
  }, [theme, mode]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "warm" ? "cold" : "warm"));
  };

  const toggleMode = () => {
    setModeState((prev) => (prev === "light" ? "dark" : "light"));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const setMode = (newMode: Mode) => {
    setModeState(newMode);
  };

  return {
    theme,
    mode,
    toggleTheme,
    toggleMode,
    setTheme,
    setMode,
  };
};
