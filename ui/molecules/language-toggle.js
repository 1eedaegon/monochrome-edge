/**
 * Language Toggle Component
 * Text-based language toggle using icon-btn-toggle CSS structure
 *
 * Usage:
 * <button class="icon-btn-toggle icon-btn-toggle-language"
 *         data-lang-first="korean"
 *         data-lang-second="english">
 * </button>
 *
 * The component extracts first 2 characters from language names:
 * "korean" -> "KO", "english" -> "EN", "japanese" -> "JA"
 */

class LanguageToggle {
  constructor(element) {
    this.element = element;
    this.langFirst = element.getAttribute("data-lang-first") || "korean";
    this.langSecond = element.getAttribute("data-lang-second") || "english";
    this.currentLang = this.langFirst;

    this.init();
  }

  init() {
    // Create toggle icon structure
    const toggleIcon = document.createElement("div");
    toggleIcon.className = "icon-btn-toggle-icon";

    const firstCode = document.createElement("span");
    firstCode.className = "lang-code lang-code-first";
    firstCode.textContent = this.getLangCode(this.langFirst);

    const separator = document.createElement("span");
    separator.className = "lang-separator";
    separator.textContent = "/";

    const secondCode = document.createElement("span");
    secondCode.className = "lang-code lang-code-second";
    secondCode.textContent = this.getLangCode(this.langSecond);

    toggleIcon.appendChild(firstCode);
    toggleIcon.appendChild(separator);
    toggleIcon.appendChild(secondCode);

    this.element.innerHTML = "";
    this.element.appendChild(toggleIcon);

    // Add click handler
    this.element.addEventListener("click", () => this.toggle());

    // Set initial state
    this.updateState();
  }

  /**
   * Extracts language code (first 2 characters, uppercase)
   * @param {string} langName - Language name
   * @returns {string} Language code (e.g., "KO", "EN")
   */
  getLangCode(langName) {
    return langName.substring(0, 2).toUpperCase();
  }

  toggle() {
    if (this.currentLang === this.langFirst) {
      this.currentLang = this.langSecond;
    } else {
      this.currentLang = this.langFirst;
    }

    this.updateState();
    this.dispatchChangeEvent();
  }

  updateState() {
    if (this.currentLang === this.langSecond) {
      this.element.classList.add("active");
    } else {
      this.element.classList.remove("active");
    }

    this.element.setAttribute("data-current-lang", this.currentLang);
  }

  dispatchChangeEvent() {
    const event = new CustomEvent("language-change", {
      detail: {
        language: this.currentLang,
        langFirst: this.langFirst,
        langSecond: this.langSecond,
      },
      bubbles: true,
    });

    this.element.dispatchEvent(event);
  }

  /**
   * Gets current language
   * @returns {string} Current language name
   */
  getCurrentLanguage() {
    return this.currentLang;
  }

  /**
   * Sets language programmatically
   * @param {string} lang - Language name (langFirst or langSecond)
   */
  setLanguage(lang) {
    if (lang === this.langFirst || lang === this.langSecond) {
      this.currentLang = lang;
      this.updateState();
      this.dispatchChangeEvent();
    } else {
      console.warn(
        `Invalid language: ${lang}. Must be "${this.langFirst}" or "${this.langSecond}"`,
      );
    }
  }
}

/**
 * Initialize all language toggle components on the page
 */
export function initLanguageToggles() {
  const toggles = document.querySelectorAll(".icon-btn-toggle-language");

  toggles.forEach((element) => {
    if (!element._languageToggle) {
      element._languageToggle = new LanguageToggle(element);
    }
  });
}

/**
 * Create a language toggle programmatically
 * @param {Object} options - Toggle options
 * @param {string} options.langFirst - First language name (default: "korean")
 * @param {string} options.langSecond - Second language name (default: "english")
 * @param {string} options.className - Additional class names
 * @param {Function} options.onChange - Change event handler
 * @returns {HTMLButtonElement} Language toggle button element
 */
export function createLanguageToggle(options = {}) {
  const button = document.createElement("button");
  button.type = "button";
  button.className =
    `icon-btn-toggle icon-btn-toggle-language ${options.className || ""}`.trim();
  button.setAttribute("data-lang-first", options.langFirst || "korean");
  button.setAttribute("data-lang-second", options.langSecond || "english");

  const toggle = new LanguageToggle(button);

  if (options.onChange) {
    button.addEventListener("language-change", options.onChange);
  }

  return button;
}

// Auto-initialize on DOM content loaded
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLanguageToggles);
  } else {
    initLanguageToggles();
  }
}

export default LanguageToggle;
