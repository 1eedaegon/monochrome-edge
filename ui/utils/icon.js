/**
 * Icon utility functions
 * Provides helper functions for working with SVG icons using iconLoader
 */

import { iconLoader } from "@src/iconLoader";

/**
 * Creates an icon element asynchronously
 * @param {string} name - Icon name (without .svg extension)
 * @param {Object} options - Icon options (width, height, className, etc.)
 * @returns {Promise<HTMLElement>} Icon container element
 */
export async function createIcon(name, options = {}) {
  const container = document.createElement("span");
  container.className = options.className || "icon";

  try {
    const svg = await iconLoader.load(name, {
      width: options.width || 16,
      height: options.height || 16,
    });
    container.innerHTML = svg;
  } catch (error) {
    console.error(`Failed to load icon: ${name}`, error);
    container.innerHTML = iconLoader.getPlaceholder(
      options.width || 16,
      options.height || 16,
    );
  }

  return container;
}

/**
 * Creates an icon element synchronously (uses cache or placeholder)
 * @param {string} name - Icon name (without .svg extension)
 * @param {Object} options - Icon options (width, height, className, etc.)
 * @returns {HTMLElement} Icon container element
 */
export function createIconSync(name, options = {}) {
  const container = document.createElement("span");
  container.className = options.className || "icon";

  const svg = iconLoader.loadSync(name, {
    width: options.width || 16,
    height: options.height || 16,
  });
  container.innerHTML = svg;

  return container;
}

/**
 * Sets icon content for an existing element
 * @param {HTMLElement} element - Target element
 * @param {string} name - Icon name (without .svg extension)
 * @param {Object} options - Icon options (width, height, etc.)
 * @returns {Promise<void>}
 */
export async function setIcon(element, name, options = {}) {
  if (!element) {
    console.error("setIcon: element is null or undefined");
    return;
  }

  try {
    const svg = await iconLoader.load(name, {
      width: options.width || 16,
      height: options.height || 16,
    });
    element.innerHTML = svg;
  } catch (error) {
    console.error(`Failed to set icon: ${name}`, error);
    element.innerHTML = iconLoader.getPlaceholder(
      options.width || 16,
      options.height || 16,
    );
  }
}

/**
 * Creates an icon button element
 * @param {string} iconName - Icon name (without .svg extension)
 * @param {Object} options - Button options
 * @param {number} options.width - Icon width
 * @param {number} options.height - Icon height
 * @param {string} options.className - Additional button class names
 * @param {string} options.title - Button title/tooltip
 * @param {string} options.ariaLabel - Accessibility label
 * @param {Function} options.onClick - Click handler
 * @returns {Promise<HTMLButtonElement>} Icon button element
 */
export async function createIconButton(iconName, options = {}) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = options.className || "icon-btn";

  if (options.title) {
    button.title = options.title;
  }

  if (options.ariaLabel) {
    button.setAttribute("aria-label", options.ariaLabel);
  }

  if (options.onClick) {
    button.addEventListener("click", options.onClick);
  }

  try {
    const svg = await iconLoader.load(iconName, {
      width: options.width || 16,
      height: options.height || 16,
    });
    button.innerHTML = svg;
  } catch (error) {
    console.error(`Failed to create icon button: ${iconName}`, error);
    button.innerHTML = iconLoader.getPlaceholder(
      options.width || 16,
      options.height || 16,
    );
  }

  return button;
}

/**
 * Preloads multiple icons
 * @param {string[]} iconNames - Array of icon names to preload
 * @param {Object} options - Icon options (width, height, etc.)
 * @returns {Promise<void>}
 */
export async function preloadIcons(iconNames, options = {}) {
  const promises = iconNames.map((name) =>
    iconLoader
      .load(name, {
        width: options.width || 16,
        height: options.height || 16,
      })
      .catch((error) => {
        console.error(`Failed to preload icon: ${name}`, error);
      }),
  );

  await Promise.all(promises);
}

/**
 * Replaces all icon placeholders in a container with actual icons
 * Usage: Add data-icon="icon-name" to elements, then call replaceIcons(container)
 * @param {HTMLElement} container - Container element
 * @param {Object} options - Icon options (width, height, etc.)
 * @returns {Promise<void>}
 */
export async function replaceIcons(container, options = {}) {
  const elements = container.querySelectorAll("[data-icon]");

  const promises = Array.from(elements).map(async (element) => {
    const iconName = element.getAttribute("data-icon");
    if (!iconName) return;

    try {
      const svg = await iconLoader.load(iconName, {
        width: options.width || 16,
        height: options.height || 16,
      });
      element.innerHTML = svg;
      element.removeAttribute("data-icon"); // Remove attribute after replacement
    } catch (error) {
      console.error(`Failed to replace icon: ${iconName}`, error);
      element.innerHTML = iconLoader.getPlaceholder(
        options.width || 16,
        options.height || 16,
      );
    }
  });

  await Promise.all(promises);
}
