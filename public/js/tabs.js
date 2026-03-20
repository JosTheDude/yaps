(() => {
  const tabStage = document.querySelector(".tab-stage");
  const tabPanels = Array.from(document.querySelectorAll(".tab-panel"));

  if (!tabStage || !tabPanels.length) {
    return;
  }

  const getTabIndex = (hash = window.location.hash) => {
    switch (hash) {
      case "#tab-about":
        return 1;
      case "#tab-projects":
        return 2;
      case "#tab-contact":
        return 3;
      default:
        return 0;
    }
  };

  const syncTabStageHeight = () => {
    const activePanel = tabPanels[getTabIndex()];

    if (!activePanel) {
      return;
    }

    tabStage.style.height = `${activePanel.offsetHeight}px`;
  };

  const queueTabStageHeightSync = () => {
    window.requestAnimationFrame(syncTabStageHeight);
  };

  window.addEventListener("hashchange", queueTabStageHeightSync);
  window.addEventListener("resize", queueTabStageHeightSync);
  window.addEventListener("load", queueTabStageHeightSync);

  if (typeof ResizeObserver === "function") {
    const resizeObserver = new ResizeObserver(queueTabStageHeightSync);

    tabPanels.forEach((panel) => {
      resizeObserver.observe(panel);
    });
  }

  queueTabStageHeightSync();
})();
