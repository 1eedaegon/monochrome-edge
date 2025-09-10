import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ThemeManager, Theme, Mode } from '@monochrome-edge/core';

interface ThemeContextValue {
  theme: Theme;
  mode: Mode;
  setTheme: (theme: Theme) => void;
  setMode: (mode: Mode) => void;
  toggleMode: () => void;
  themeManager: ThemeManager;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  defaultMode?: Mode;
  persistKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'warm',
  defaultMode = 'light',
  persistKey = 'monochrome-theme'
}: ThemeProviderProps) {
  const [themeManager] = useState(() => new ThemeManager({
    defaultTheme,
    defaultMode,
    persistKey
  }));

  const [theme, setThemeState] = useState<Theme>(themeManager.getTheme());
  const [mode, setModeState] = useState<Mode>(themeManager.getMode());

  useEffect(() => {
    // Initialize theme
    themeManager.init();

    // Subscribe to theme changes
    const unsubscribe = themeManager.subscribe((newTheme, newMode) => {
      setThemeState(newTheme);
      setModeState(newMode);
    });

    return () => {
      unsubscribe();
    };
  }, [themeManager]);

  const setTheme = (newTheme: Theme) => {
    themeManager.setTheme(newTheme);
  };

  const setMode = (newMode: Mode) => {
    themeManager.setMode(newMode);
  };

  const toggleMode = () => {
    themeManager.toggleMode();
  };

  const value: ThemeContextValue = {
    theme,
    mode,
    setTheme,
    setMode,
    toggleMode,
    themeManager
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}
