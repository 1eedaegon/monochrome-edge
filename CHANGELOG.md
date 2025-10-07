# Changelog

All notable changes to Monochrome Edge UI Components will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.7.0] - 2025-10-07

### Added
- feat: Add TOC Hover Card component for standalone navigation
- feat: Add TOC Collapsible component for in-document navigation
- feat: Add Changelog pagination component with 10 items per page default
- feat: Split Typography Markdown showcase into individual components (Paragraph, Lists, Inline Code, Code Blocks, Blockquote, HR, Tables)
- feat: Export TOC utilities in vanilla JS/TS (createTocHoverCard, createTocCollapsible, initTocCollapsible)
- feat: Export TOC components for React (TocHoverCard, TocCollapsible, Changelog)
- feat: Export TOC components for Vue (TocHoverCard, TocCollapsible, Changelog)

### Changed
- style: Redesign blockquote with modern edge styling
- style: Add "//" pseudo-element to blockquotes for visual emphasis
- style: Update blockquote to use gradient background
- style: Remove border-radius and italic styling from blockquote
- style: Use 3px solid left border on blockquote instead of 4px
- docs: Improve Typography section with separate showcases for each markdown element

### Fixed
- fix: Changelog structure - wrap all entries in proper .changelog-entry div
- fix: Add data-version attribute to all changelog entries

## [1.6.1] - 2025-10-07

### Bug Fixes

- fix: resolve conflict ([af45ab4](../../commit/af45ab4b22691a4e95bda0167b21f6a242b04ce1))

## Changes

