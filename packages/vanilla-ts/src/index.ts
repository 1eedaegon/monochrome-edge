// Export components
export {
  MonochromeComponents,
  type ComponentOptions,
  type ButtonOptions,
} from "./components";

// Export theme manager
export { ThemeManager, type Theme, type Mode } from "./theme";

// Initialize styles on import
if (typeof window !== "undefined") {
  // Ensure monochrome CSS is loaded
  const mainCSSId = "monochrome-main-css";
  if (!document.getElementById(mainCSSId)) {
    const link = document.createElement("link");
    link.id = mainCSSId;
    link.rel = "stylesheet";
    link.href = "/ui/monochrome-edge.css";
    document.head.appendChild(link);
  }
}
