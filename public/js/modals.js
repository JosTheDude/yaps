(() => {
  const openButtons = Array.from(document.querySelectorAll("[data-project-open]"));
  const dialogs = Array.from(document.querySelectorAll("[data-project-modal]"));

  if (!openButtons.length || !dialogs.length) {
    return;
  }

  const dialogMap = new Map(dialogs.map((dialog) => [dialog.dataset.projectModal, dialog]));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const getModalDuration = () => reduceMotion.matches ? 20 : 230;
  let activeTrigger = null;

  const syncBodyState = () => {
    document.body.classList.toggle("has-project-modal", dialogs.some((dialog) => dialog.open));
  };

  const openDialog = (dialog) => {
    dialog.classList.remove("is-closing");

    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }

    dialog.classList.remove("is-open");

    window.requestAnimationFrame(() => {
      dialog.classList.add("is-open");
    });

    syncBodyState();
  };

  const closeDialog = (dialog) => {
    if (!dialog.open || dialog.classList.contains("is-closing")) {
      return;
    }

    dialog.classList.add("is-closing");
    dialog.classList.remove("is-open");

    window.setTimeout(() => {
      if (!dialog.open) {
        return;
      }

      dialog.classList.remove("is-closing");
      dialog.close();
    }, getModalDuration());
  };

  openButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const dialog = dialogMap.get(button.dataset.projectOpen);

      if (!dialog) {
        return;
      }

      activeTrigger = button;
      openDialog(dialog);
    });
  });

  dialogs.forEach((dialog) => {
    const closeButtons = Array.from(dialog.querySelectorAll("[data-project-close]"));

    closeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        closeDialog(dialog);
      });
    });

    dialog.addEventListener("click", (event) => {
      const bounds = dialog.getBoundingClientRect();
      const clickedBackdrop = event.clientX < bounds.left
        || event.clientX > bounds.right
        || event.clientY < bounds.top
        || event.clientY > bounds.bottom;

      if (clickedBackdrop) {
        closeDialog(dialog);
      }
    });

    dialog.addEventListener("close", () => {
      dialog.classList.remove("is-open", "is-closing");
      syncBodyState();

      if (activeTrigger) {
        activeTrigger.focus();
        activeTrigger = null;
      }
    });

    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeDialog(dialog);
    });
  });
})();
