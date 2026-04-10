(() => {
  const carousel = document.querySelector("[data-project-carousel]");

  if (!carousel) {
    return;
  }

  const slides = Array.from(carousel.querySelectorAll("[data-project-carousel-slide]"));
  const slidesFrame = carousel.querySelector(".project-carousel-slides");
  const dots = Array.from(carousel.querySelectorAll("[data-project-carousel-dot]"));
  const countNode = carousel.querySelector("[data-project-carousel-count]");
  const prevButton = carousel.querySelector("[data-project-carousel-prev]");
  const nextButton = carousel.querySelector("[data-project-carousel-next]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const total = slides.length;
  const formatCount = (value) => String(value).padStart(2, "0");
  let activeIndex = 0;
  let rotationTimer = 0;
  let heightFrame = 0;
  let activeSlideObserver = null;
  let isInView = true;
  let isHovered = false;
  let isFocusedWithin = false;

  const stopRotation = () => {
    if (!rotationTimer) {
      return;
    }

    window.clearInterval(rotationTimer);
    rotationTimer = 0;
  };

  const canRotate = () => {
    return !reduceMotion.matches
      && total >= 2
      && isInView
      && !document.hidden
      && !isHovered
      && !isFocusedWithin;
  };

  const syncHeight = () => {
    if (!slidesFrame) {
      return;
    }

    const activeSlide = slides[activeIndex];

    if (!activeSlide) {
      return;
    }

    if (heightFrame) {
      window.cancelAnimationFrame(heightFrame);
    }

    heightFrame = window.requestAnimationFrame(() => {
      slidesFrame.style.height = `${Math.ceil(activeSlide.offsetHeight + 20)}px`;
      heightFrame = 0;
    });
  };

  const observeActiveSlide = () => {
    if (typeof ResizeObserver !== "function") {
      return;
    }

    if (!activeSlideObserver) {
      activeSlideObserver = new ResizeObserver(() => {
        syncHeight();
      });
    }

    activeSlideObserver.disconnect();

    const activeSlide = slides[activeIndex];

    if (activeSlide) {
      activeSlideObserver.observe(activeSlide);
    }
  };

  const updateSlide = (nextIndex) => {
    activeIndex = (nextIndex + total) % total;

    slides.forEach((slide, index) => {
      const isActive = index === activeIndex;
      const isPrev = index === (activeIndex - 1 + total) % total;
      const isNext = index === (activeIndex + 1) % total;
      const isVisible = isActive || isPrev || isNext;

      slide.classList.toggle("is-active", isActive);
      slide.classList.toggle("is-prev", isPrev);
      slide.classList.toggle("is-next", isNext);
      slide.setAttribute("aria-hidden", isVisible ? "false" : "true");
    });

    dots.forEach((dot, index) => {
      const isActive = index === activeIndex;

      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    if (countNode) {
      countNode.textContent = `${formatCount(activeIndex + 1)}/${formatCount(total)}`;
    }

    observeActiveSlide();
    syncHeight();
  };

  const startRotation = () => {
    stopRotation();

    if (!canRotate()) {
      return;
    }

    rotationTimer = window.setInterval(() => {
      updateSlide(activeIndex + 1);
    }, 5200);
  };

  prevButton?.addEventListener("click", () => {
    updateSlide(activeIndex - 1);
    startRotation();
  });

  nextButton?.addEventListener("click", () => {
    updateSlide(activeIndex + 1);
    startRotation();
  });

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      updateSlide(Number(dot.dataset.projectCarouselIndex || "0"));
      startRotation();
    });
  });

  slides.forEach((slide, index) => {
    slide.addEventListener("click", (event) => {
      if (event.target.closest("[data-project-open]")) {
        return;
      }

      if (index === activeIndex) {
        return;
      }

      updateSlide(index);
      startRotation();
    });
  });

  carousel.addEventListener("pointerenter", () => {
    isHovered = true;
    stopRotation();
  });
  carousel.addEventListener("pointerleave", () => {
    isHovered = false;
    startRotation();
  });
  carousel.addEventListener("focusin", () => {
    isFocusedWithin = true;
    stopRotation();
  });
  carousel.addEventListener("focusout", (event) => {
    if (!carousel.contains(event.relatedTarget)) {
      isFocusedWithin = false;
      startRotation();
    }
  });

  const handleMotionChange = () => {
    startRotation();
  };

  const handleVisibilityChange = () => {
    startRotation();
  };

  window.addEventListener("resize", syncHeight);

  if (document.fonts?.ready) {
    document.fonts.ready.then(() => {
      syncHeight();
    });
  }

  if (typeof reduceMotion.addEventListener === "function") {
    reduceMotion.addEventListener("change", handleMotionChange);
  } else if (typeof reduceMotion.addListener === "function") {
    reduceMotion.addListener(handleMotionChange);
  }

  document.addEventListener("visibilitychange", handleVisibilityChange);

  if (typeof IntersectionObserver === "function") {
    const observer = new IntersectionObserver(([entry]) => {
      isInView = Boolean(entry?.isIntersecting && entry.intersectionRatio >= 0.35);
      startRotation();
    }, {
      threshold: [0.35]
    });

    observer.observe(carousel);
  }

  updateSlide(0);
  startRotation();
})();
