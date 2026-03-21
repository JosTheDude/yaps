(() => {
  const mobileBreakpoint = window.matchMedia("(max-width: 720px)");
  const homeGrid = document.querySelector(".home-grid");

  if (!homeGrid) {
    return;
  }

  const mainStack = homeGrid.querySelector(".main-stack");
  const sidebarStack = homeGrid.querySelector(".sidebar-stack");
  const badgesCard = homeGrid.querySelector(".badges-card");

  if (!mainStack || !sidebarStack || !badgesCard) {
    return;
  }

  const moveBadgesCard = () => {
    if (mobileBreakpoint.matches) {
      if (badgesCard.parentElement !== homeGrid) {
        homeGrid.insertBefore(badgesCard, sidebarStack.nextSibling);
      }

      return;
    }

    if (badgesCard.parentElement !== mainStack) {
      mainStack.appendChild(badgesCard);
    }
  };

  moveBadgesCard();

  if (typeof mobileBreakpoint.addEventListener === "function") {
    mobileBreakpoint.addEventListener("change", moveBadgesCard);
    return;
  }

  mobileBreakpoint.addListener(moveBadgesCard);
})();
