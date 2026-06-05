(() => {
  const root = document.querySelector("[data-player-stats-root]");

  if (!root) {
    return;
  }

  const onlineNode = root.querySelector("[data-online-total]");
  const stateNode = root.querySelector("[data-player-stats-state]");
  const formatter = new Intl.NumberFormat("en-US");
  let displayedOnline = 0;
  let targetOnline = 0;

  const setState = (state) => {
    stateNode.textContent = state;
    stateNode.dataset.playerStatsState = state;
  };

  const animateOnline = () => {
    if (displayedOnline !== targetOnline) {
      const delta = targetOnline - displayedOnline;
      displayedOnline += Math.sign(delta) * Math.max(1, Math.ceil(Math.abs(delta) / 14));
      onlineNode.textContent = formatter.format(displayedOnline);
    }

    window.requestAnimationFrame(animateOnline);
  };

  const syncStats = async () => {
    try {
      const response = await fetch("/api/stats", {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`stats request failed: ${response.status}`);
      }

      const payload = await response.json();
      targetOnline = Number(payload.playerTracker?.totalOnline ?? 0);
      setState("live");
    } catch {
      setState("stale");
    }
  };

  animateOnline();
  syncStats();
  window.setInterval(syncStats, 30_000);
})();
