(() => {
  const carousel = document.querySelector("[data-client-carousel]");
  const track = carousel?.querySelector(".client-carousel-track");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!carousel || !track) {
    return;
  }

  const autoScrollSpeed = 0.065;
  let isDragging = false;
  let pointerId = null;
  let startX = 0;
  let startScrollLeft = 0;
  let lastFrameTime = 0;
  let animationFrame = 0;
  let currentScrollLeft = 0;
  let manualPauseUntil = 0;
  let isInView = true;
  let isHovered = false;

  const canAutoScroll = (timestamp) => {
    return !isDragging
      && !reduceMotion.matches
      && isInView
      && !document.hidden
      && !isHovered
      && timestamp >= manualPauseUntil;
  };

  const getLoopWidth = () => track.scrollWidth / 2;

  const wrapScrollLeft = (value) => {
    const loopWidth = getLoopWidth();

    if (!loopWidth) {
      return 0;
    }

    return ((value % loopWidth) + loopWidth) % loopWidth;
  };

  const syncScrollLeft = (value) => {
    currentScrollLeft = wrapScrollLeft(value);
    carousel.scrollLeft = currentScrollLeft;
  };

  const pauseAutoScroll = (duration = 900) => {
    manualPauseUntil = window.performance.now() + duration;
  };

  const normalizeWheelDelta = (event) => {
    if (event.deltaMode === 1) {
      return (event.deltaX + event.deltaY) * 18;
    }

    if (event.deltaMode === 2) {
      return (event.deltaX + event.deltaY) * carousel.clientWidth;
    }

    return event.deltaX + event.deltaY;
  };

  const stopDragging = () => {
    if (!isDragging) {
      return;
    }

    isDragging = false;
    pointerId = null;
    carousel.classList.remove("is-dragging");
  };

  const tick = (timestamp) => {
    if (!lastFrameTime) {
      lastFrameTime = timestamp;
    }

    const elapsed = timestamp - lastFrameTime;
    lastFrameTime = timestamp;

    if (canAutoScroll(timestamp)) {
      syncScrollLeft(currentScrollLeft + elapsed * autoScrollSpeed);
    }

    animationFrame = window.requestAnimationFrame(tick);
  };

  carousel.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    isDragging = true;
    pointerId = event.pointerId;
    startX = event.clientX;
    startScrollLeft = currentScrollLeft;
    pauseAutoScroll();
    carousel.classList.add("is-dragging");
    carousel.setPointerCapture(event.pointerId);
  });

  carousel.addEventListener("pointerenter", () => {
    isHovered = true;
  });

  carousel.addEventListener("pointerleave", () => {
    isHovered = false;
  });

  carousel.addEventListener("pointermove", (event) => {
    if (!isDragging || event.pointerId !== pointerId) {
      return;
    }

    event.preventDefault();
    syncScrollLeft(startScrollLeft - (event.clientX - startX));
  });

  carousel.addEventListener("pointerup", (event) => {
    if (event.pointerId === pointerId && carousel.hasPointerCapture(event.pointerId)) {
      carousel.releasePointerCapture(event.pointerId);
    }

    stopDragging();
  });

  carousel.addEventListener("lostpointercapture", stopDragging);
  carousel.addEventListener("pointercancel", stopDragging);
  carousel.addEventListener("dragstart", (event) => event.preventDefault());
  carousel.addEventListener("wheel", (event) => {
    const delta = normalizeWheelDelta(event);

    if (!delta) {
      return;
    }

    event.preventDefault();
    pauseAutoScroll();
    syncScrollLeft(currentScrollLeft + delta);
  }, { passive: false });
  syncScrollLeft(0);
  animationFrame = window.requestAnimationFrame(tick);

  if (typeof IntersectionObserver === "function") {
    const observer = new IntersectionObserver(([entry]) => {
      isInView = Boolean(entry?.isIntersecting && entry.intersectionRatio >= 0.35);
    }, {
      threshold: [0.35]
    });

    observer.observe(carousel);
  }

  window.addEventListener("beforeunload", () => {
    window.cancelAnimationFrame(animationFrame);
  });
})();
