document.addEventListener('DOMContentLoaded', function () {
    var menuHtml = `
    <div class="menufelirat">
        <div style="margin-left: 10px;"><a href="index.html" target="_top">The Natron Theory</a></div>
        <div id="hamburger-menu">
            <img src="img/hamburger.png" class="hambuci" alt="Menu" />
            <div id="dropdown-content" style="display: none;">
            <a href="/">Home</a>
            <a href="geopolymer_calculator.html">Geopolymer Calculator</a>
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
            
});
