function ugrasDivre(celDivId) {
    const elem = document.getElementById(celDivId);
    if (elem) {
        const elemY = elem.getBoundingClientRect().top + window.scrollY;
        const duration = 1000; // Az animáció időtartama 1 másodperc (1000 milliszekundum)

        window.scrollTo({
            top: elemY,
            behavior: 'smooth',
            duration: duration
        });
    } else {
        console.error('A megadott div nem található.');
    }
}


