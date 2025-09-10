export type Theme = "warm" | "cold";
export type Mode = "light" | "dark";

export class ThemeManager {
  private theme: Theme;
  private mode: Mode;
  private themeLink: HTMLLinkElement | null = null;

  constructor(theme: Theme = "warm", mode: Mode = "light") {
    this.theme = theme;
    this.mode = mode;
    this.init();
  }

  private init(): void {
    // Load theme CSS
    this.themeLink = document.getElementById("theme-link") as HTMLLinkElement;
    if (!this.themeLink) {
      this.themeLink = document.createElement("link");
      this.themeLink.id = "theme-link";
      this.themeLink.rel = "stylesheet";
      document.head.appendChild(this.themeLink);
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

    this.applyTheme();
  }

  private applyTheme(): void {
    if (this.themeLink) {
      this.themeLink.href = `/ui/tokens/${this.theme}-theme.css`;
    }
    document.documentElement.setAttribute("data-theme", this.mode);
  }

  public getTheme(): Theme {
    return this.theme;
  }

  public getMode(): Mode {
    return this.mode;
  }

  public setTheme(theme: Theme): void {
    this.theme = theme;
    this.applyTheme();
  }

  public setMode(mode: Mode): void {
    this.mode = mode;
    this.applyTheme();
  }

  public toggleTheme(): void {
    this.theme = this.theme === "warm" ? "cold" : "warm";
    this.applyTheme();
  }

  public toggleMode(): void {
    this.mode = this.mode === "light" ? "dark" : "light";
    this.applyTheme();
  }

  // Save preferences to localStorage
  public savePreferences(): void {
    localStorage.setItem("monochrome-theme", this.theme);
    localStorage.setItem("monochrome-mode", this.mode);
  }

  // Load preferences from localStorage
  public loadPreferences(): void {
    const savedTheme = localStorage.getItem("monochrome-theme") as Theme | null;
    const savedMode = localStorage.getItem("monochrome-mode") as Mode | null;

    if (savedTheme) {
      this.theme = savedTheme;
    }
    if (savedMode) {
      this.mode = savedMode;
    }

    this.applyTheme();
  }
}
