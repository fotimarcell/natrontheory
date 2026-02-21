document.addEventListener('DOMContentLoaded', function () {
    var menuHtml = `
    <div class="menufelirat">
        <div style="margin-left: 10px;"><a href="index.html" target="_top" data-i18n="main">The Natron Theory</a></div>
        <div id="language-switcher">
          <button class="lang-flag" data-lang="en" onclick="setLanguage('en')" title="English">
            <svg class="flag-svg" viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="English flag">
              <rect width="60" height="40" fill="#012169"/>
              <path d="M0 0 L60 40 M60 0 L0 40" stroke="#fff" stroke-width="6"/>
              <path d="M0 0 L60 40 M60 0 L0 40" stroke="#C8102E" stroke-width="3"/>
              <rect x="25" width="10" height="40" fill="#fff"/>
              <rect y="15" width="60" height="10" fill="#fff"/>
              <rect x="27" width="6" height="40" fill="#C8102E"/>
              <rect y="17" width="60" height="6" fill="#C8102E"/>
            </svg>
          </button>
          <button class="lang-flag" data-lang="hu" onclick="setLanguage('hu')" title="Magyar">
            <svg class="flag-svg" viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Magyar zászló">
              <rect width="60" height="13.333" fill="#CD2A3E"/>
              <rect y="13.333" width="60" height="13.334" fill="#FFFFFF"/>
              <rect y="26.667" width="60" height="13.333" fill="#436F4D"/>
            </svg>
          </button>
          <button class="lang-flag" data-lang="de" onclick="setLanguage('de')" title="Deutsch">
            <svg class="flag-svg" viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Deutsche Flagge">
              <rect width="60" height="13.333" fill="#000000"/>
              <rect y="13.333" width="60" height="13.334" fill="#DD0000"/>
              <rect y="26.667" width="60" height="13.333" fill="#FFCE00"/>
            </svg>
          </button>
          <button class="lang-flag" data-lang="es" onclick="setLanguage('es')" title="Español">
            <svg class="flag-svg" viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Bandera de España">
              <rect width="60" height="12" fill="#AA151B"/>
              <rect y="12" width="60" height="16" fill="#F1BF00"/>
              <rect y="28" width="60" height="12" fill="#AA151B"/>
            </svg>
          </button>
          <button class="lang-flag" data-lang="ja" onclick="setLanguage('ja')" title="日本語">
            <svg class="flag-svg" viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="日本の旗">
              <rect width="60" height="40" fill="#fff"/>
              <circle cx="30" cy="20" r="9" fill="#BC002D"/>
            </svg>
          </button>
          <button class="lang-flag" data-lang="zh" onclick="setLanguage('zh')" title="中文">
            <svg class="flag-svg" viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="中国の旗">
              <rect width="60" height="40" fill="#DE2910"/>
              <g fill="#FFDE00">
                <polygon points="8,8 10.6,13.3 6,9.3 11.2,9.3 7.6,13.3" />
                <polygon points="17,5 18.6,8.3 15,6.1 19,6.1 15.4,8.3" />
                <polygon points="19,10 20.6,13.3 16,9.3 21.2,9.3 17.6,13.3" />
                <polygon points="17,15 18.6,18.3 15,16.1 19,16.1 15.4,18.3" />
              </g>
            </svg>
          </button>
          <button class="lang-flag" data-lang="ru" onclick="setLanguage('ru')" title="Русский">
            <svg class="flag-svg" viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Русский флаг">
              <rect width="60" height="13.333" fill="#ffffff"/>
              <rect y="13.333" width="60" height="13.334" fill="#0039A6"/>
              <rect y="26.667" width="60" height="13.333" fill="#D52B1E"/>
            </svg>
          </button>
          <button class="lang-more-button" id="lang-more" title="Languages" onclick="toggleLangDropdown()">⋯</button>
          <div id="lang-dropdown" style="display:none; position:absolute; right:10px; top:44px;">
            <div class="lang-dropdown-inner">
              <!-- Dropdown contains all language buttons for small screens -->
              <button class="lang-flag" data-lang="en" onclick="(function(){setLanguage('en'); document.getElementById('lang-dropdown').style.display='none';})()" title="English">
                <svg class="flag-svg" viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="English flag">
                  <rect width="60" height="40" fill="#012169"/>
                  <path d="M0 0 L60 40 M60 0 L0 40" stroke="#fff" stroke-width="6"/>
                  <path d="M0 0 L60 40 M60 0 L0 40" stroke="#C8102E" stroke-width="3"/>
                  <rect x="25" width="10" height="40" fill="#fff"/>
                  <rect y="15" width="60" height="10" fill="#fff"/>
                  <rect x="27" width="6" height="40" fill="#C8102E"/>
                  <rect y="17" width="60" height="6" fill="#C8102E"/>
                </svg>
              </button>
              <button class="lang-flag" data-lang="hu" onclick="(function(){setLanguage('hu'); document.getElementById('lang-dropdown').style.display='none';})()" title="Magyar">
                <svg class="flag-svg" viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Magyar zászló">
                  <rect width="60" height="13.333" fill="#CD2A3E"/>
                  <rect y="13.333" width="60" height="13.334" fill="#FFFFFF"/>
                  <rect y="26.667" width="60" height="13.333" fill="#436F4D"/>
                </svg>
              </button>
              <button class="lang-flag" data-lang="de" onclick="(function(){setLanguage('de'); document.getElementById('lang-dropdown').style.display='none';})()" title="Deutsch">
                <svg class="flag-svg" viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Deutsche Flagge">
                  <rect width="60" height="13.333" fill="#000000"/>
                  <rect y="13.333" width="60" height="13.334" fill="#DD0000"/>
                  <rect y="26.667" width="60" height="13.333" fill="#FFCE00"/>
                </svg>
              </button>
              <button class="lang-flag" data-lang="es" onclick="(function(){setLanguage('es'); document.getElementById('lang-dropdown').style.display='none';})()" title="Español">
                <svg class="flag-svg" viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Bandera de España">
                  <rect width="60" height="12" fill="#AA151B"/>
                  <rect y="12" width="60" height="16" fill="#F1BF00"/>
                  <rect y="28" width="60" height="12" fill="#AA151B"/>
                </svg>
              </button>
              <button class="lang-flag" data-lang="ja" onclick="(function(){setLanguage('ja'); document.getElementById('lang-dropdown').style.display='none';})()" title="日本語">
                <svg class="flag-svg" viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="日本の旗">
                  <rect width="60" height="40" fill="#fff"/>
                  <circle cx="30" cy="20" r="9" fill="#BC002D"/>
                </svg>
              </button>
              <button class="lang-flag" data-lang="zh" onclick="(function(){setLanguage('zh'); document.getElementById('lang-dropdown').style.display='none';})()" title="中文">
                <svg class="flag-svg" viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="中国の旗">
                  <rect width="60" height="40" fill="#DE2910"/>
                  <g fill="#FFDE00">
                    <polygon points="8,8 10.6,13.3 6,9.3 11.2,9.3 7.6,13.3" />
                    <polygon points="17,5 18.6,8.3 15,6.1 19,6.1 15.4,8.3" />
                    <polygon points="19,10 20.6,13.3 16,9.3 21.2,9.3 17.6,13.3" />
                    <polygon points="17,15 18.6,18.3 15,16.1 19,16.1 15.4,18.3" />
                  </g>
                </svg>
              </button>
              <button class="lang-flag" data-lang="ru" onclick="(function(){setLanguage('ru'); document.getElementById('lang-dropdown').style.display='none';})()" title="Русский">
                <svg class="flag-svg" viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Русский флаг">
                  <rect width="60" height="13.333" fill="#ffffff"/>
                  <rect y="13.333" width="60" height="13.334" fill="#0039A6"/>
                  <rect y="26.667" width="60" height="13.333" fill="#D52B1E"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div id="hamburger-menu">
            <img src="img/hamburger.png" class="hambuci" alt="Menu" />
            <div id="dropdown-content" style="display: none;">
            <a href="/" data-i18n="home">Home</a>
            <a href="case_splittrap.html" data-i18n="splittrap">The Split Trap</a>
            <a href="recipe_potassium.html" data-i18n="recipe1">Recipe: Potassium Waterglass</a>
            <a href="img/fake/Artificial granite secret recipe v3.0.pdf" target="_blank" data-i18n="recipe2">Recipe: Fake granite (pdf)</a>
            </div>
        </div>
    </div>
    `;

    function loadMenu(callback) {
        // A menü betöltése...
        document.getElementById('menu-placeholder').innerHTML = menuHtml;
        
        // Callback hívása, ha van
        if (callback && typeof(callback) === "function") {
          callback();
        }
      }
      
      // A menü betöltésének indítása, callback függvénnyel
      loadMenu(function() {
        console.log("A menü betöltődött. Most már biztonságosan hozzáadhatjuk az eseménykezelőket.");
        attachEventHandlers(); // Itt hozzáadjuk az eseménykezelőket
      });
      function attachEventHandlers() {
        var hamburgerMenu = document.getElementById("hamburger-menu");
        var menu = document.getElementById("dropdown-content");
      
        if (hamburgerMenu) {
          hamburgerMenu.addEventListener("click", function(event) {
            event.stopPropagation();
            menu.style.display = menu.style.display === "block" ? "none" : "block";
          });
      
          document.addEventListener("click", function(event) {
            if (event.target.closest("#hamburger-menu") === null) {
              menu.style.display = "none";
            }
          });
        } else {
          console.error("A hamburger-menu elem nem található.");
        }
      }
      // Nyelv lenyíló kezelése
      window.toggleLangDropdown = function() {
        var dd = document.getElementById('lang-dropdown');
        if (!dd) return;
        dd.style.display = (dd.style.display === 'block') ? 'none' : 'block';
      }

      // Bezárja a nyelv lenyílót kattintáson kívüli helyre
      document.addEventListener('click', function(e) {
        var dd = document.getElementById('lang-dropdown');
        var moreBtn = document.getElementById('lang-more');
        if (!dd || !moreBtn) return;
        if (moreBtn.contains(e.target)) return; // a gombra kattintva ne zárja
        if (dd.style.display === 'block' && !dd.contains(e.target)) {
          dd.style.display = 'none';
        }
      });

});
