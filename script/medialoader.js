// URL paraméter kiolvasása
function getParameterByName(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
}

// Kép és leírás betöltése az URL paraméter alapján
function loadImageAndDescription() {
    const param = getParameterByName('id');
    if (param) {
        const akarmi = imageData.find(img => img.id === param);
        if (akarmi) {
            document.getElementById('media').src = akarmi.src;
            document.getElementById('image-description').innerText = akarmi.description;
        } else {
            console.error('Image not found for the provided ID');
        }
    } else {
        console.error('No ID parameter found in the URL');
    }
}

// Meghívás
loadImageAndDescription();