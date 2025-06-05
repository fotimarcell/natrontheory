const image = document.getElementById('media');
const wrapper = document.getElementById('image-wrapper');
const container = document.getElementById('image-container');

let isZoomed = false;
let isDragging = false;
let startX, startY;
let currentX = 0, currentY = 0;
let wasDragged = false;

const ZOOM_LEVEL = 4;
const DRAG_SENSITIVITY = 0.5;

image.addEventListener('click', (e) => {
    if (wasDragged) {
        wasDragged = false;
        return;
    }

    if (isZoomed) {
        wrapper.style.transform = 'scale(1) translate(0px, 0px)';
        container.style.cursor = 'grab';
        isZoomed = false;
        currentX = 0;
        currentY = 0;
    } else {
        const rect = wrapper.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;

        currentX = -((offsetX - rect.width / 2) * (ZOOM_LEVEL - 1)) / ZOOM_LEVEL;
        currentY = -((offsetY - rect.height / 2) * (ZOOM_LEVEL - 1)) / ZOOM_LEVEL;

        const clamped = clampDragLimits(currentX, currentY);
        currentX = clamped.x;
        currentY = clamped.y;

        wrapper.style.transform = `scale(${ZOOM_LEVEL}) translate(${currentX}px, ${currentY}px)`;
        container.style.cursor = 'move';
        isZoomed = true;
    }
});

function startDrag(e) {
    if (isZoomed) {
        isDragging = true;
        wasDragged = false;
        const event = e.touches ? e.touches[0] : e;
        startX = event.clientX;
        startY = event.clientY;
        container.style.cursor = 'grabbing';
        window.addEventListener('mousemove', drag);
    }
}

function endDrag() {
    if (isDragging) {
        isDragging = false;
        container.style.cursor = 'move';
        window.removeEventListener('mousemove', drag);

        const clamped = clampDragLimits(currentX, currentY);
        if (clamped.x !== currentX || clamped.y !== currentY) {
            currentX = clamped.x;
            currentY = clamped.y;
            wrapper.style.transform = `scale(${ZOOM_LEVEL}) translate(${currentX}px, ${currentY}px)`;
        }
    }
}

function drag(e) {
    if (isDragging && isZoomed) {
        e.preventDefault();
        wasDragged = true;
        const event = e.touches ? e.touches[0] : e;

        const deltaX = (event.clientX - startX) * DRAG_SENSITIVITY;
        const deltaY = (event.clientY - startY) * DRAG_SENSITIVITY;

        const nextX = currentX + deltaX;
        const nextY = currentY + deltaY;

        const clamped = clampDragLimits(nextX, nextY);
        currentX = clamped.x;
        currentY = clamped.y;

        wrapper.style.transform = `scale(${ZOOM_LEVEL}) translate(${currentX}px, ${currentY}px)`;

        startX = event.clientX;
        startY = event.clientY;
    }
}

function clampDragLimits(x, y) {
    const containerRect = container.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();

    const VISIBLE_MARGIN = 20;

    const scaledWidth = wrapper.offsetWidth * ZOOM_LEVEL;
    const scaledHeight = wrapper.offsetHeight * ZOOM_LEVEL;

    const maxOffsetX = ((scaledWidth - containerRect.width) / 2 - VISIBLE_MARGIN) / ZOOM_LEVEL;
    const maxOffsetY = ((scaledHeight - containerRect.height) / 2 - VISIBLE_MARGIN) / ZOOM_LEVEL;

    const clampedX = Math.min(Math.max(x, -maxOffsetX), maxOffsetX);
    const clampedY = Math.min(Math.max(y, -maxOffsetY), maxOffsetY);

    return { x: clampedX, y: clampedY };
}

image.addEventListener('mousedown', (e) => {
    wasDragged = false;
    startDrag(e);
});
window.addEventListener('mouseup', (e) => {
    if (isDragging) {
        endDrag();
    } else if (!wasDragged && isZoomed) {
        wrapper.style.transform = 'scale(1) translate(0px, 0px)';
        container.style.cursor = 'grab';
        isZoomed = false;
        currentX = 0;
        currentY = 0;
    }
});

image.addEventListener('touchstart', startDrag);
image.addEventListener('touchend', endDrag);
window.addEventListener('touchmove', drag);

document.body.addEventListener('touchmove', function(e) {
    if (isZoomed) e.preventDefault();
  }, { passive: false });
  

document.addEventListener('DOMContentLoaded', function() {
    var overlayMessage = document.getElementById('overlayMessage');
    var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    overlayMessage.textContent = isMobile ? 'Tap anywhere to zoom in' : 'Click anywhere to zoom in';

    setTimeout(function() {
        overlayMessage.style.opacity = '0';
    }, 1000);

    overlayMessage.addEventListener('transitionend', function() {
        overlayMessage.parentNode.removeChild(overlayMessage);
    });
});