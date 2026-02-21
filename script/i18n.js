// Többnyelvűsítési rendszer — per-language lazy load
let translationsCache = {};
let translations = {};
let currentLanguage = localStorage.getItem('language') || 'en';

async function loadTranslationsFor(lang) {
    if (translationsCache[lang]) return translationsCache[lang];
    try {
        const res = await fetch(`script/translations/${lang}.json`);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        translationsCache[lang] = data;
        return data;
    } catch (err) {
        console.error('Translation load failed for', lang, err);
        return null;
    }
}

function applyTranslations() {
    const elements = document.querySelectorAll('[data-i18n]');

    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = getNestedTranslation(key);

        if (translation) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                if (element.hasAttribute('data-i18n-placeholder')) {
                    element.placeholder = translation;
                }
            } else if (element.hasAttribute('data-i18n-alt')) {
                element.alt = translation;
            } else if (element.hasAttribute('data-i18n-title')) {
                element.title = translation;
            } else {
                if (typeof translation === 'string' && (translation.includes('<') || translation.includes('>'))) {
                    element.innerHTML = translation;
                } else {
                    element.textContent = translation;
                }
            }
        }
    });

    document.documentElement.lang = currentLanguage;
    updateLanguageFlags();
}

function getNestedTranslation(key) {
    const keys = key.split('.');
    let value = translations || {};

    for (let k of keys) {
        if (value && typeof value === 'object') {
            value = value[k];
        } else {
            return null;
        }
    }
    return value;
}

// Nyelvváltás — most async és lazy-load
async function setLanguage(lang) {
    if (lang === currentLanguage && translations && Object.keys(translations).length) return;
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    const loaded = await loadTranslationsFor(lang);
    if (loaded) {
        translations = loaded;
        applyTranslations();
    } else {
        console.warn('Could not load translations for', lang);
    }
}

function updateLanguageFlags() {
    const flags = document.querySelectorAll('.lang-flag');
    flags.forEach(flag => {
        if (flag.getAttribute('data-lang') === currentLanguage) {
            flag.classList.add('active');
        } else {
            flag.classList.remove('active');
        }
    });
}

// Init: load current language file then apply
document.addEventListener('DOMContentLoaded', async function() {
    const loaded = await loadTranslationsFor(currentLanguage);
    if (loaded) translations = loaded;
    applyTranslations();
});
