(() => {
  const carousel = document.querySelector("[data-testimonial-carousel]");

  if (!carousel) {
    return;
  }

  const slides = Array.from(carousel.querySelectorAll("[data-testimonial-slide]"));
  const dots = Array.from(carousel.querySelectorAll("[data-testimonial-dot]"));
  const countNode = carousel.querySelector("[data-testimonial-count]");
  const prevButton = carousel.querySelector("[data-testimonial-prev]");
  const nextButton = carousel.querySelector("[data-testimonial-next]");
  const slidesNode = carousel.querySelector(".testimonial-slides");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const total = slides.length;
  const formatCount = (value) => String(value).padStart(2, "0");
  let activeIndex = 0;
  let rotationTimer = 0;

  if (!total) {
    return;
  }

  carousel.classList.toggle("is-static", total < 2);

  const stopRotation = () => {
    if (!rotationTimer) {
      return;
    }

    window.clearInterval(rotationTimer);
    rotationTimer = 0;
  };

  const syncHeight = () => {
    if (!slidesNode) {
      return;
    }

    const activeSlide = slides[activeIndex];

    if (!activeSlide) {
      slidesNode.style.height = "";
      return;
    }

    slidesNode.style.height = `${activeSlide.scrollHeight}px`;
  };

  const updateSlide = (nextIndex) => {
    activeIndex = (nextIndex + total) % total;

    slides.forEach((slide, index) => {
      const isActive = index === activeIndex;
      const isPrev = total > 1 && index === (activeIndex - 1 + total) % total;
      const isNext = total > 1 && index === (activeIndex + 1) % total;

      slide.classList.toggle("is-active", isActive);
      slide.classList.toggle("is-prev", isPrev);
      slide.classList.toggle("is-next", isNext);
      slide.setAttribute("aria-hidden", isActive ? "false" : "true");
    });

    dots.forEach((dot, index) => {
      const isActive = index === activeIndex;

      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    if (countNode) {
      countNode.textContent = `${formatCount(activeIndex + 1)}/${formatCount(total)}`;
    }

    window.requestAnimationFrame(syncHeight);
  };

  const startRotation = () => {
    stopRotation();

    if (reduceMotion.matches || total < 2) {
      return;
    }

    rotationTimer = window.setInterval(() => {
      updateSlide(activeIndex + 1);
    }, 8000);
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
      updateSlide(Number(dot.dataset.testimonialIndex || "0"));
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

  window.addEventListener("resize", () => {
    window.requestAnimationFrame(syncHeight);
  });

  if (typeof reduceMotion.addEventListener === "function") {
    reduceMotion.addEventListener("change", handleMotionChange);
  } else if (typeof reduceMotion.addListener === "function") {
    reduceMotion.addListener(handleMotionChange);
  }

  updateSlide(0);
  window.requestAnimationFrame(syncHeight);
  document.fonts.ready.then(() => window.requestAnimationFrame(syncHeight));
  startRotation();
})();
