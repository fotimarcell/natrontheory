const image = document.getElementById('media');
const container = document.getElementById('image-container');
let isZoomed = false;
let isDragging = false;
let startX, startY;
let currentX = 0, currentY = 0;
let wasDragged = false;

image.addEventListener('click', (e) => {
    if (wasDragged) {
        console.log('Click ignored due to drag');
        wasDragged = false; // Reset after drag
        return; // Prevent zoom in/out after drag
    }

    if (isZoomed) {
        console.log('Zoom out triggered');
        image.style.transform = 'scale(1)';
        container.style.cursor = 'grab';
        image.style.cursor = 'grab';
        isZoomed = false;
        currentX = 0;
        currentY = 0;
    } else {
        console.log('Zoom in triggered');

        const rect = image.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;

        const zoomLevel = 4;
        
        // Calculate translation, centering on the click point with zoom scaling
        currentX = -((offsetX - rect.width / 2) * (zoomLevel - 1)) / zoomLevel;
        currentY = -((offsetY - rect.height / 2) * (zoomLevel - 1)) / zoomLevel;

        image.style.transform = `scale(${zoomLevel}) translate(${currentX}px, ${currentY}px)`;
        container.style.cursor = 'move';
        image.style.cursor = 'move';
        isZoomed = true;
    }
});

function startDrag(e) {
    if (isZoomed) {
        isDragging = true;
        wasDragged = false; // Reset at the start of a new drag
        const event = e.touches ? e.touches[0] : e;
        startX = event.clientX - currentX;
        startY = event.clientY - currentY;
        container.style.cursor = 'grabbing';
        image.style.cursor = 'grabbing';
        window.addEventListener('mousemove', drag);
    }
}

function endDrag() {
    if (isDragging) {
        console.log('Drag ended');
        isDragging = false;
        container.style.cursor = 'move';
        image.style.cursor = 'move';
        window.removeEventListener('mousemove', drag);
    }
}

function drag(e) {
    if (isDragging && isZoomed) {
        e.preventDefault();
        wasDragged = true; // Mark as dragged during actual movement
        const event = e.touches ? e.touches[0] : e;
        currentX = event.clientX - startX;
        currentY = event.clientY - startY;
        console.log(`Dragging - currentX: ${currentX}, currentY: ${currentY}`);
        image.style.transform = `scale(4) translate(${currentX}px, ${currentY}px)`;
    }
}

image.addEventListener('mousedown', (e) => {
    wasDragged = false; // Reset at mousedown
    startDrag(e);
});
window.addEventListener('mouseup', (e) => {
    if (isDragging) {
        endDrag();
    } else if (!wasDragged && isZoomed) {
        console.log('Zoom out triggered by mouseup');
        image.style.transform = 'scale(1)';
        container.style.cursor = 'grab';
        image.style.cursor = 'grab';
        isZoomed = false;
        currentX = 0;
        currentY = 0;
    }
});

image.addEventListener('touchstart', startDrag);
image.addEventListener('touchend', endDrag);
window.addEventListener('touchmove', drag);
