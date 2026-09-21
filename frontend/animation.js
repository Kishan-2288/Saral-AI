(() => {
  const FRAME_COUNT = 300;
  const FRAME_PATH = (frame) =>
    `/public/frames/ezgif-frame-${String(frame).padStart(3, '0')}.jpg`;

  const canvas = document.querySelector('#animation');
  const context = canvas.getContext('2d', { alpha: false });
  const track = document.querySelector('#scroll-track');
  const frames = Array.from({ length: FRAME_COUNT });
  let renderedFrame = -1;
  let raf = 0;

  function frameForScroll() {
    const availableScroll = Math.max(1, track.offsetHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, window.scrollY / availableScroll));
    return Math.round(progress * (FRAME_COUNT - 1));
  }

  function drawFrame(index) {
    const image = frames[index];
    if (!image || !image.complete || !image.naturalWidth) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.round(window.innerWidth * dpr);
    const height = Math.round(window.innerHeight * dpr);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;
    context.fillStyle = '#000';
    context.fillRect(0, 0, width, height);
    context.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
    renderedFrame = index;
  }

  function requestRender() {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const target = frameForScroll();
      if (target !== renderedFrame) drawFrame(target);
    });
  }

  function preloadFrames() {
    frames.forEach((_, index) => {
      const image = new Image();
      image.decoding = 'async';
      image.src = FRAME_PATH(index + 1);
      image.addEventListener('load', () => {
        if (index === frameForScroll() || renderedFrame === -1) requestRender();
      }, { once: true });
      frames[index] = image;
    });
  }

  preloadFrames();
  window.addEventListener('scroll', requestRender, { passive: true });
  window.addEventListener('resize', () => {
    renderedFrame = -1;
    requestRender();
  }, { passive: true });
  requestRender();
})();
