/**
 * Language Toggle Component
 * Multi-language toggle with country flag icons
 * Supports cycling through multiple languages
 */

/**
 * Initialize a language toggle button
 * @param {HTMLElement} element - The button element
 * @param {Object} options - Configuration options
 * @param {string[]} options.languages - Array of language codes (e.g., ['ko', 'en', 'ja'])
 * @param {string} options.initial - Initial language code (default: first in array)
 * @param {Function} options.onChange - Callback when language changes
 * @returns {Object} - API object with methods
 */
export function initLanguageToggle(element, options = {}) {
    const {
        languages = ['ko', 'en'],
        initial = languages[0],
        onChange = null
    } = options;

    let currentIndex = languages.indexOf(initial);
    if (currentIndex === -1) currentIndex = 0;

    let isAnimating = false;

    // Set initial state
    element.setAttribute('data-lang', languages[currentIndex]);

    // Add click handler
    element.addEventListener('click', function() {
        if (isAnimating) return;

        // Calculate next language
        const currentLang = languages[currentIndex];
        currentIndex = (currentIndex + 1) % languages.length;
        const nextLang = languages[currentIndex];

        // Lock animation
        isAnimating = true;

        // Find current and next icons
        const icons = element.querySelectorAll('.language-toggle-icon svg');
        const currentIcon = element.querySelector(`.flag-icon-${getFlagClass(currentLang)}`);
        const nextIcon = element.querySelector(`.flag-icon-${getFlagClass(nextLang)}`);

        // Mark icons for animation
        if (currentIcon) currentIcon.classList.add('flag-icon-current');
        if (nextIcon) nextIcon.classList.add('flag-icon-next');

        // Start animation
        element.classList.add('is-animating');

        // Update data attribute immediately
        element.setAttribute('data-lang', nextLang);

        // Clean up after animation
        setTimeout(() => {
            element.classList.remove('is-animating');

            // Remove animation classes
            icons.forEach(icon => {
                icon.classList.remove('flag-icon-current', 'flag-icon-next');
            });

            // Unlock
            setTimeout(() => {
                isAnimating = false;
            }, 200);
        }, 500);

        // Trigger callback
        if (onChange) {
            onChange(nextLang, currentLang);
        }
    });

    // API
    return {
        getCurrentLanguage: () => languages[currentIndex],
        setLanguage: (lang) => {
            const index = languages.indexOf(lang);
            if (index !== -1) {
                currentIndex = index;
                element.setAttribute('data-lang', lang);
            }
        },
        getLanguages: () => [...languages],
        destroy: () => {
            element.removeEventListener('click', arguments.callee);
        }
    };
}

/**
 * Get flag class name for language code
 * Maps language codes to flag icon classes
 */
function getFlagClass(lang) {
    const mapping = {
        'ko': 'kr',  // Korean → South Korea
        'en': 'us',  // English → United States
        'ja': 'jp',  // Japanese → Japan
        'zh': 'cn',  // Chinese → China
        'fr': 'fr',  // French → France
        'de': 'de',  // German → Germany
        'es': 'es',  // Spanish → Spain
        'pt': 'br',  // Portuguese → Brazil
        'ru': 'ru',  // Russian → Russia
        'ar': 'sa',  // Arabic → Saudi Arabia
        'hi': 'in',  // Hindi → India
        'it': 'it',  // Italian → Italy
    };

    return mapping[lang] || 'globe';
}

/**
 * Auto-initialize all language toggles with data-language-toggle attribute
 */
export function autoInit() {
    document.querySelectorAll('[data-language-toggle]').forEach(element => {
        const languagesAttr = element.getAttribute('data-languages');
        const languages = languagesAttr ? languagesAttr.split(',').map(l => l.trim()) : ['ko', 'en'];
        const initial = element.getAttribute('data-initial-lang') || languages[0];

        initLanguageToggle(element, {
            languages,
            initial,
            onChange: (next, prev) => {
                // Emit custom event
                element.dispatchEvent(new CustomEvent('languagechange', {
                    detail: { from: prev, to: next },
                    bubbles: true
                }));
            }
        });
    });
}

// Auto-initialize on DOMContentLoaded
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoInit);
    } else {
        autoInit();
    }
}
