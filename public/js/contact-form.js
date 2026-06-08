(() => {
  const form = document.getElementById("contact-form");
  const submitBtn = document.getElementById("cf-submit");
  const status = document.getElementById("cf-status");
  const verifyModal = document.getElementById("contact-verify-modal");
  const turnstileMount = document.getElementById("contact-turnstile");

  let pendingPayload = null;
  let turnstileWidgetId = null;

  if (!form) return;

  const setStatus = (message, state = "") => {
    status.textContent = message;
    status.dataset.state = state;
  };

  const getPayload = () => {
    const name = form.elements["name"].value.trim();
    const email = form.elements["email"].value.trim();
    const discord = form.elements["discord"].value.trim();
    const subject = form.elements["subject"].value.trim();
    const message = form.elements["message"].value.trim();

    return { name, email, discord, subject, message };
  };

  const validatePayload = ({ name, email, subject, message }) => {
    if (!name || !email || !subject || !message) {
      setStatus("please fill in all fields.", "error");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("please enter a valid email address.", "error");
      return false;
    }

    return true;
  };

  const openVerification = () => {
    if (!verifyModal || !turnstileMount || !window.turnstile) {
      setStatus("verification is still loading. try again in a moment.", "error");
      return;
    }

    verifyModal.classList.add("is-open");
    verifyModal.setAttribute("aria-hidden", "false");

    if (turnstileWidgetId === null) {
      turnstileWidgetId = window.turnstile.render(turnstileMount, {
        sitekey: "0x4AAAAAADg1ydBwnn4zCnPg",
        theme: "dark",
        callback: submitContact,
        "error-callback": () => {
          setStatus("verification failed. please try again.", "error");
          closeVerification();
        },
        "expired-callback": () => {
          setStatus("verification expired. please try again.", "error");
          closeVerification();
        },
      });
    } else {
      window.turnstile.reset(turnstileWidgetId);
    }
  };

  const closeVerification = () => {
    verifyModal?.classList.remove("is-open");
    verifyModal?.setAttribute("aria-hidden", "true");
    if (turnstileWidgetId !== null) {
      window.turnstile?.reset(turnstileWidgetId);
    }
  };

  const submitContact = async (turnstileToken) => {
    if (!pendingPayload) return;

    submitBtn.disabled = true;
    submitBtn.textContent = "sending...";
    setStatus("");
    closeVerification();

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...pendingPayload, turnstileToken }),
      });

      if (res.ok) {
        setStatus("message sent! i'll get back to you soon 🐾", "success");
        form.reset();
        pendingPayload = null;
      } else {
        const errorMessage = (await res.text()).trim();
        throw new Error(errorMessage || `http ${res.status}`);
      }
    } catch (error) {
      setStatus(error.message || "something went wrong. try emailing me directly!", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "send message";
    }
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    pendingPayload = getPayload();

    if (!validatePayload(pendingPayload)) {
      pendingPayload = null;
      return;
    }

    setStatus("");
    openVerification();
  });

  verifyModal?.addEventListener("click", (e) => {
    if (e.target.closest("[data-contact-verify-close]")) {
      pendingPayload = null;
      closeVerification();
    }
  });
})();
