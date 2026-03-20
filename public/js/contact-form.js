(() => {
  const form = document.getElementById("contact-form");
  const submitBtn = document.getElementById("cf-submit");
  const status = document.getElementById("cf-status");

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

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      status.textContent = "please enter a valid email address.";
      status.dataset.state = "error";
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "sending...";
    status.textContent = "";
    status.dataset.state = "";

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, discord, subject, message }),
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
