(() => {
  const root = document.querySelector("[data-lanyard-root]");

  if (!root) {
    return;
  }

  const userId = "481933134858944512";
  const lineNode = root.querySelector("[data-lanyard-line]");
  const nameNode = root.querySelector("[data-lanyard-name]");
  const handleNode = root.querySelector("[data-lanyard-handle]");
  const avatarNode = root.querySelector("[data-lanyard-avatar]");
  const dotNode = root.querySelector("[data-lanyard-dot]");

  const statusLabels = {
    online: "online",
    idle: "idle",
    dnd: "dnd",
    offline: "offline"
  };

  const getDevice = (data) => {
    if (data.active_on_discord_desktop) {
      return "desktop";
    }

    if (data.active_on_discord_web) {
      return "web";
    }

    if (data.active_on_discord_mobile) {
      return "mobile";
    }

    return "n/a";
  };

  const getActivity = (data) => {
    if (data.listening_to_spotify && data.spotify?.song) {
      return `spotify: ${data.spotify.song}`;
    }

    const [activity] = data.activities ?? [];

    if (!activity) {
      return "none";
    }

    return activity.name || "custom status";
  };

  const getHeadline = (data) => {
    if ((data.discord_status || "offline") === "offline") {
      return "currently offline";
    }

    if (data.listening_to_spotify && data.spotify?.song && data.spotify?.artist) {
      return `listening to ${data.spotify.song} by ${data.spotify.artist}`;
    }

    const [activity] = data.activities ?? [];

    if (activity?.details) {
      return activity.details;
    }

    if (activity?.state) {
      return activity.state;
    }

    return statusLabels[data.discord_status] || "online";
  };

  const applyPresence = (data) => {
    const user = data.discord_user ?? {};
    const displayName = user.display_name || user.global_name || user.username || "discord user";
    const username = user.username || "unknown";
    const avatar = user.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
      : "https://cdn.discordapp.com/embed/avatars/0.png";

    nameNode.textContent = displayName.toLowerCase();
    handleNode.textContent = `@${username}`;
    lineNode.textContent = getHeadline(data).toLowerCase();
    avatarNode.src = avatar;
    avatarNode.alt = `${displayName} Discord avatar`;
    dotNode.dataset.lanyardDot = data.discord_status || "offline";
  };

  const applyError = () => {
    lineNode.textContent = "lanyard unavailable right now.";
    dotNode.dataset.lanyardDot = "offline";
  };

  const syncPresence = async () => {
    try {
      const response = await fetch(`https://api.lanyard.rest/v1/users/${userId}`);

      if (!response.ok) {
        throw new Error(`lanyard request failed: ${response.status}`);
      }

      const payload = await response.json();

      if (!payload.success || !payload.data) {
        throw new Error("lanyard payload missing data");
      }

      applyPresence(payload.data);
    } catch (error) {
      applyError();
    }
  };

  syncPresence();
  window.setInterval(syncPresence, 30000);
})();
