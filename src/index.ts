/**
 * @monochrome-edge/ui - Framework wrappers entry point
 * This file only re-exports framework-specific wrappers
 * For vanilla JS/TS components, use the main UI package
 */

export const VERSION = "1.10.0";

// Re-export ThemeManager for framework wrappers
export { ThemeManager } from "../ui/utils/theme-manager";

// Note: Users should use specific entry points:
// - @monochrome-edge/ui for vanilla components
// - @monochrome-edge/ui/react for React components
// - @monochrome-edge/ui/vue for Vue components
// - @monochrome-edge/ui/jquery for jQuery plugins
// - @monochrome-edge/ui/web-components for Web Components
