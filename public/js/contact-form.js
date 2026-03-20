(() => {
  const form = document.getElementById("contact-form");
  const submitBtn = document.getElementById("cf-submit");
  const status = document.getElementById("cf-status");
  const WEBHOOK = "https://discord.com/api/webhooks/1484348773718298704/HRnANTCC8Hpn3J_zAJ7uQiKU4ST4O8-L4zPS7mc95Qt9cIEgR0vBZC-K3d6B35DMhC7m";

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = form.elements["name"].value.trim();
    const email = form.elements["email"].value.trim();
    const discord = form.elements["discord"].value.trim();
    const subject = form.elements["subject"].value.trim();
    const message = form.elements["message"].value.trim();

    if (!name || !email || !subject || !message) {
      status.textContent = "please fill in all fields.";
      status.dataset.state = "error";
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "sending...";
    status.textContent = "";
    status.dataset.state = "";

    const now = new Date();
    const timestamp = now.toLocaleString("en-US", {
      month: "numeric", day: "numeric", year: "2-digit",
      hour: "numeric", minute: "2-digit", hour12: true
    });

    const payload = {
      content: "@everyone",
      embeds: [{
        title: "📢 New Contact Form Submission",
        color: 0xd58ef5,
        fields: [
          { name: "🧑 Name", value: name, inline: true },
          { name: "📧 Email", value: email, inline: true },
          { name: "💬 Discord", value: discord || "not provided", inline: true },
          { name: "📝 Subject", value: subject },
          { name: "✉️ Message", value: message }
        ],
        footer: { text: `jos.gg Contact Form • ${timestamp}` }
      }]
    };

    try {
      const res = await fetch(WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        status.textContent = "message sent! i'll get back to you soon 🐾";
        status.dataset.state = "success";
        form.reset();
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch {
      status.textContent = "something went wrong — try emailing me directly!";
      status.dataset.state = "error";
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "send message";
    }
  });
})();
