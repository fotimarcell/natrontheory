function ugrasDivre(celDivId) {
    const elem = document.getElementById(celDivId);
    if (elem) {
        const elemY = elem.getBoundingClientRect().top + window.scrollY;
        // figyelembe vesszük a sticky menü magasságát (ha van)
        const menu = document.querySelector('.menuframe');
        const menuHeight = menu ? Math.ceil(menu.getBoundingClientRect().height) : 0;
        const targetY = Math.max(0, elemY - menuHeight);

        window.scrollTo({
            top: targetY,
            behavior: 'smooth'
        });
    } else {
        console.error('A megadott div nem található.');
    }
}


