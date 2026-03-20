(() => {
  const carousel = document.querySelector("[data-project-carousel]");

  if (!carousel) {
    return;
  }

  const slides = Array.from(carousel.querySelectorAll("[data-project-carousel-slide]"));
  const dots = Array.from(carousel.querySelectorAll("[data-project-carousel-dot]"));
  const countNode = carousel.querySelector("[data-project-carousel-count]");
  const prevButton = carousel.querySelector("[data-project-carousel-prev]");
  const nextButton = carousel.querySelector("[data-project-carousel-next]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const total = slides.length;
  const formatCount = (value) => String(value).padStart(2, "0");
  let activeIndex = 0;
  let rotationTimer = 0;

  const stopRotation = () => {
    if (!rotationTimer) {
      return;
    }

    window.clearInterval(rotationTimer);
    rotationTimer = 0;
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
  };

  const startRotation = () => {
    stopRotation();

    if (reduceMotion.matches || total < 2) {
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

  carousel.addEventListener("pointerenter", stopRotation);
  carousel.addEventListener("pointerleave", startRotation);
  carousel.addEventListener("focusin", stopRotation);
  carousel.addEventListener("focusout", (event) => {
    if (!carousel.contains(event.relatedTarget)) {
      startRotation();
    }
  });

  const handleMotionChange = () => {
    startRotation();
  };

  if (typeof reduceMotion.addEventListener === "function") {
    reduceMotion.addEventListener("change", handleMotionChange);
  } else if (typeof reduceMotion.addListener === "function") {
    reduceMotion.addListener(handleMotionChange);
  }

  updateSlide(0);
  startRotation();
})();
