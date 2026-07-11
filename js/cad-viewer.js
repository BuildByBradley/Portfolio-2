document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById('cad-viewer-overlay');
  if (!overlay) return;

  const activeImg = document.getElementById('cad-active-img');
  const zoomSlider = document.getElementById('cad-zoom-slider');
  const nextBtn = document.getElementById('cad-next-btn');
  const thumbnailImg = document.querySelector('.proof-module-3-img');

  const assets = [
    '../../assets/projects/berkshire/cad-1.webp',
    '../../assets/projects/berkshire/cad-2.webp',
    '../../assets/projects/berkshire/cad-3.webp',
    '../../assets/projects/berkshire/cad-4.webp',
    '../../assets/projects/berkshire/cad-5.webp',
    '../../assets/projects/berkshire/cad-6.webp',
    '../../assets/projects/berkshire/cad-7.webp'
  ];
  
  let currentIndex = 0;
  let scale = 1;
  let panX = 0;
  let panY = 0;

  function updateTransform() {
    activeImg.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
  }

  // Open Viewer
  thumbnailImg.addEventListener('click', () => {
    overlay.style.display = 'block';
    // Small delay to allow display:block to apply before opacity transition
    setTimeout(() => overlay.style.opacity = '1', 50);
  });

  // Close Viewer (Reverse animation)
  activeImg.addEventListener('click', () => {
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.style.display = 'none';
      // Reset pan/zoom on close
      scale = 1; panX = 0; panY = 0;
      zoomSlider.value = 1;
      updateTransform();
    }, 500); // Matches the 0.5s CSS transition speed
  });

  // Next Button
  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent closing
    currentIndex = (currentIndex + 1) % assets.length;
    const newSrc = assets[currentIndex];
    activeImg.src = newSrc;
    // Update the thumbnail on the page so it stays on the last viewed asset
    thumbnailImg.src = newSrc;
  });

  // Zoom Slider
  zoomSlider.addEventListener('input', (e) => {
    scale = e.target.value;
    updateTransform();
  });

  // Pan via Scroll / Shift+Scroll
  overlay.addEventListener('wheel', (e) => {
    if (scale <= 1) return; // Only pan if zoomed in
    e.preventDefault();
    
    if (e.shiftKey) {
      panX -= e.deltaY; // Shift+scroll pans X
    } else {
      panY -= e.deltaY; // Normal scroll pans Y
    }
    updateTransform();
  }, { passive: false });
});
