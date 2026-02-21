# Többnyelvűségi Rendszer (i18n)

## Áttekintés

A projekt most támogatja a 4 nyelvű fordítást:
- 🇬🇧 **English** (Angol)
- 🇭🇺 **Magyar** (Magyar)
- 🇩🇪 **Deutsch** (Német)
- 🇪🇸 **Español** (Spanyol)

A nyelvváltó gomb a fejlécben található - kis zászlók emoji gombokként.

## Hogyan működik?

### 1. Fájlszerkezet — nyelvenkénti fordítások
Mostantól nyelvenként külön fájlokban tároljuk a fordításokat a `script/translations/` mappában. Példa:

```
script/translations/en.json
script/translations/hu.json
script/translations/de.json
script/translations/es.json
script/translations/ja.json
script/translations/zh.json
```

Minden fájl egy objektumot tartalmaz (az oldal `menu` és `index` kulcsaival), például:

```json
{
  "menu": { "home": "Home", ... },
  "index": { "title": "The Natron Theory", ... }
}
```

### 2. **i18n Engine** (`script/i18n.js`)
Ez a JavaScript fájl lazy-load módban tölti be a nyelvi fájlokat (`script/translations/{lang}.json`).

Funkciók:
- Betölt egy adott nyelvi fájlt, csak amikor szükséges (cache-eli az eredményt)
- Kicseréli az oldalon minden `data-i18n` attribútummal jelölt elemet
- Az aktív nyelvet a `localStorage`-ban tárolja

### 3. **HTML Jelölés**
Az olyan elemekhez, amelyeket fordítani szeretnél, add hozzá a `data-i18n` attribútumot:

```html
<!-- Egyszerű szöveg -->
<button data-i18n="index.intro_button">Next</button>

<!-- list item -->
<li data-i18n="index.natron_uses_1">Washing clothes...</li>
```

### 4. **Nyelvváltó Gombok**
A fejlécben automatikusan megjelenik 4 zászló gomb:
```html
<button class="lang-flag" data-lang="en" onclick="setLanguage('en')">🇬🇧</button>
<button class="lang-flag" data-lang="hu" onclick="setLanguage('hu')">🇭🇺</button>
<button class="lang-flag" data-lang="de" onclick="setLanguage('de')">🇩🇪</button>
<button class="lang-flag" data-lang="es" onclick="setLanguage('es')">🇪🇸</button>
```

Az aktív nyelv gomb felerősítés stílust kap (`.active` class).

## Új Fordítás Hozzáadása

### 3. Új fordítás hozzáadása (nyelvenként)

1. Hozz létre/nyisd meg `script/translations/{lang}.json` (például `hu.json`) és add meg a szövegeket a meglévő mintának megfelelően.

```json
{
  "menu": { "home": "Kezdőlap" },
  "index": { "title": "A natrón-elmélet", "intro_text": "..." }
}
```

2. A HTML elemeket ne módosítsd: marad a `data-i18n` attribútum (pl. `data-i18n="index.title"`).

3. Az `i18n.js` automatikusan betölti a kiválasztott `lang.json` fájlt és alkalmazza a fordítást.

### 2. **Jelöld meg a HTML elemeket**

Az HTML fájladban add hozzá a `data-i18n` attribútumot:

```html
<h1 data-i18n="newSection.title">My Title</h1>
<p data-i18n="newSection.description">My Description</p>
```

### 3. **Frissítés Automatikus**

Az oldal betöltésekor az i18n engine automatikusan kicseréli a szöveget a jelenlegi nyelvvel.

## LocalStorage Memória

A felhasználó által választott nyelv a `localStorage`-ben tárolódik a `language` kulcs alatt. Ez azt jelenti, hogy az utolsó kiválasztott nyelv megtartódik még a böngésző bezárása után.

## CSS Stílus a Nyelvzászlókhoz

A zászógombok stílusa a `css/style.css`-ben definiálva van:

```css
.lang-flag {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    padding: 5px 8px;
    opacity: 0.6;
    transition: opacity 0.3s ease;
    border-radius: 4px;
}

.lang-flag:hover {
    opacity: 1;
}

.lang-flag.active {
    opacity: 1;
    background-color: rgba(255, 255, 255, 0.2);
}
```

## Debugolás

Nyiss meg egy böngészőkonzolt (F12), és a `setLanguage('hu')` paranccsal tesztelhetted a nyelvváltást.

## Fájlok módosítva

- ✅ `script/i18n.js` - most per-language lazy-load megoldást használ
- ✅ `script/translations/` - nyelvenkénti JSON fájlok (en, hu, de, es, ja, zh)
- ✅ `script/loadmenu.js` - nyelvzászló gombok a fejlécben
- ✅ `css/style.css` - zászló stílusok

## Megjegyzések

- Az `index.html` már tartalmazza az első fordítási szövegeket (index szekció).
- Más HTML oldalak szövegei még nem fordítottak, de az infrastruktúra készen áll rájuk.
- A fordítások a beépített gerincének korlátozzák magukat, a külső API nélkül.
- Nincsenek külső betöltések vagy pluginek szükségesek!
