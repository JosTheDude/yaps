(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const spawnConfetti = (event) => {
    if (reduceMotion.matches) {
      return;
    }

    const originX = event.clientX ?? window.innerWidth / 2;
    const originY = event.clientY ?? window.innerHeight / 2;
    const palette = ["", " confetti-bit-alt", " confetti-bit-deep"];

    for (let index = 0; index < 10; index += 1) {
      const bit = document.createElement("span");
      const angle = (Math.PI * 2 * index) / 10 + Math.random() * 0.35;
      const distance = 22 + Math.random() * 30;
      const offsetX = `${originX}px`;
      const offsetY = `${originY}px`;
      const deltaX = `${Math.cos(angle) * distance}px`;
      const deltaY = `${Math.sin(angle) * distance - 12}px`;

      bit.className = `confetti-bit${palette[index % palette.length]}`;
      bit.style.setProperty("--confetti-x", offsetX);
      bit.style.setProperty("--confetti-y", offsetY);
      bit.style.setProperty("--confetti-dx", deltaX);
      bit.style.setProperty("--confetti-dy", deltaY);
      bit.style.setProperty("--confetti-rot", `${(Math.random() * 180 - 90).toFixed(2)}deg`);
      document.body.append(bit);
      window.setTimeout(() => bit.remove(), 700);
    }
  };

  document.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) {
      return;
    }

    if (event.target.closest("[data-sticky-note]")) {
      return;
    }

    spawnConfetti(event);
  });
})();
