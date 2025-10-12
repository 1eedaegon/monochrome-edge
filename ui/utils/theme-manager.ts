/**
 * Theme Manager - Handles theme switching between warm/cold and light/dark modes
 */

export class ThemeManager {
  private currentTheme: "warm" | "cold" = "warm";
  private currentMode: "light" | "dark" = "light";

  constructor(theme?: "warm" | "cold", mode?: "light" | "dark") {
    if (theme) this.currentTheme = theme;
    if (mode) this.currentMode = mode;
    this.apply();
  }

  setTheme(theme: "warm" | "cold") {
    this.currentTheme = theme;
    this.apply();
  }

  setMode(mode: "light" | "dark") {
    this.currentMode = mode;
    this.apply();
  }

  toggle() {
    this.currentMode = this.currentMode === "light" ? "dark" : "light";
    this.apply();
  }

  private apply() {
    const root = document.documentElement;
    root.setAttribute("data-theme", this.currentMode);
    root.setAttribute("data-theme-variant", this.currentTheme);
  }

  getTheme() {
    return { theme: this.currentTheme, mode: this.currentMode };
  }
}
