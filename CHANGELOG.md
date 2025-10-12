# Changelog

All notable changes to Monochrome Edge UI Components will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.11.0] - 2025-10-12

### Added

- **New Interactive Components** (TypeScript)
  - feat: add Accordion component with `allowMultiple` and `defaultOpen` options
  - feat: add Modal component with backdrop/escape key support
  - feat: add Tabs component with programmatic tab switching
  - feat: add Toast notification system with 4 types (success, error, info, warning)
  - feat: add Dropdown component with auto-positioning and placement options
- feat: all new components support both CDN (UMD) and npm (ESM/CJS) usage
- feat: add comprehensive TypeScript type definitions for all components
- feat: add auto-initialization functions (`initAccordions`, `initModals`, etc.)
- feat: add component lifecycle methods (`destroy()` for cleanup)

### Fixed

- fix: resolve TypeScript warnings in stepper.ts (15 undefined checks)
- fix: resolve TypeScript warnings in search-toolbar.ts (3 undefined checks)
- fix: correct import path in molecules/search-toolbar.ts (relative path)
- fix: add null safety checks for `firstPos`, `lastPos`, and `next` in stepper
- fix: add optional chaining for array access in search-toolbar

### Changed

- chore: update rollup.config.js to include new component builds
- chore: update ui/index.ts to export all new components
- docs: add JavaScript Components section to README.md with examples
- docs: add CDN and npm usage examples for all new components

### Developer Experience

- All components now have consistent API patterns
- Full IntelliSense support in TypeScript/VSCode
- Components can be imported individually or as a bundle
- Zero breaking changes - fully backward compatible

## [1.10.0] - 2025-10-12

### Features

- feat: restructure UI components (src/ → ui/) for clear separation
- feat: add TypeScript Accordion component with allowMultiple support
- feat: add TypeScript Modal component with backdrop and keyboard support
- feat: add TypeScript Tabs component with keyboard navigation
- feat: add TypeScript Toast component with positioning and auto-dismiss
- feat: add TypeScript Dropdown component with auto-positioning
- feat: add CDN support for individual UI components (UMD format)
- feat: add unified UI bundle (ui.js) for CDN usage
- feat: simplify asset CDN path from `/ui/ui/assets/` to `/assets/`
- feat: add package.json exports for all UI components
- feat: create utility modules (ThemeManager, dom-helpers, icon-loader)

### Changed

- Moved core components from `src/` to `ui/components/` for better organization
- Updated Rollup config to build individual components + unified bundle
- Updated package.json main entry point to ui.js/ui.esm.js
- src/ now only contains framework wrappers (React, Vue, jQuery, Web Components)
- Assets now available at both `/assets/*` (new) and `/ui/assets/*` (backward compat)

### Breaking Changes

None - this is a backward compatible release. All existing imports continue to work.

## [1.9.12] - 2025-10-11

### Bug Fixes

- fix: add truncate test to stepper ([051746d](../../commit/051746d5c46f9c944467df874e88dbd540e8b57c))
- fix: support web-component for icons ([d2b5c6f](../../commit/d2b5c6fdbdccc40472744e9f8a7c0a9fa3caf59b))
- fix: support cdn for icons ([b5ed2a9](../../commit/b5ed2a933e574c65c6ff302beabd50d9cedfaf50))
- fix: stepper icon dynamic loader ([f75e42c](../../commit/f75e42c685d02917f814cc57b9fa110d4a3145c8))

### Chore

- chore: bump version to 1.9.11 [skip ci] ([23803a9](../../commit/23803a9c20c0e47676c7d40cd755ab4646acfebd))
- chore: bump version to 1.9.10 [skip ci] ([2660760](../../commit/266076079fdec19dd024a6b7777c974fe35782be))

### Other

- ci: fix auto bump version on ci ([95666be](../../commit/95666be1da865b675c5aa12061d6572efbbb8669))

## Changes

