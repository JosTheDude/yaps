(() => {
  const boards = Array.from(document.querySelectorAll("[data-workspace-canvas]"));

  if (!boards.length) {
    return;
  }

  const compactLayout = window.matchMedia("(max-width: 720px)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let zIndexSeed = 4;
  let dragCueShown = false;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const getNoteRotation = (note) => Number.parseFloat(note.dataset.noteRotation || note.dataset.noteRotate || "0");
  const setNoteRotation = (note, nextRotation) => {
    note.dataset.noteRotation = String(nextRotation);
    note.style.setProperty("--note-rotate", `${nextRotation}deg`);
  };

  const setNotePosition = (note, board, nextLeft, nextTop) => {
    const maxLeft = Math.max(0, board.clientWidth - note.offsetWidth);
    const maxTop = Math.max(0, board.clientHeight - note.offsetHeight);

    note.style.left = `${clamp(nextLeft, 0, maxLeft)}px`;
    note.style.top = `${clamp(nextTop, 0, maxTop)}px`;
  };

  const syncBoard = (board) => {
    const notes = Array.from(board.querySelectorAll("[data-sticky-note]"));

    if (compactLayout.matches) {
      notes.forEach((note) => {
        note.classList.remove("is-dragging");
        note.style.left = "";
        note.style.top = "";
        note.style.zIndex = "";
        delete note.dataset.noteReady;
      });
      return;
    }

    const boardRect = board.getBoundingClientRect();

    notes.forEach((note) => {
      if (!note.dataset.noteRotation) {
        setNoteRotation(note, getNoteRotation(note));
      }

      if (!note.dataset.noteReady || !note.style.left || !note.style.top) {
        const noteRect = note.getBoundingClientRect();

        note.style.left = `${noteRect.left - boardRect.left}px`;
        note.style.top = `${noteRect.top - boardRect.top}px`;
        note.dataset.noteReady = "true";
      }

      setNotePosition(
        note,
        board,
        Number.parseFloat(note.style.left || "0"),
        Number.parseFloat(note.style.top || "0")
      );
    });
  };

  const createDragCue = (board) => {
    const sourceNote = board.querySelector("[data-sticky-note]");

    if (!sourceNote || board.querySelector("[data-sticky-drag-cue]")) {
      return;
    }

    const startLeft = Number.parseFloat(sourceNote.style.left || "0");
    const startTop = Number.parseFloat(sourceNote.style.top || "0");
    const maxMoveX = board.clientWidth - sourceNote.offsetWidth - startLeft - 24;
    const moveX = clamp(Math.min(168, maxMoveX), 88, 168);
    const moveY = -clamp(Math.min(34, startTop - 12), 18, 34);
    const cue = document.createElement("div");
    const noteGhost = sourceNote.cloneNode(true);
    const hand = document.createElement("span");
    const palm = document.createElement("span");

    cue.className = "sticky-note-drag-ghost";
    cue.dataset.stickyDragCue = "true";
    cue.style.left = `${startLeft}px`;
    cue.style.top = `${startTop}px`;
    cue.style.width = `${sourceNote.offsetWidth}px`;
    cue.style.height = `${sourceNote.offsetHeight}px`;
    cue.style.setProperty("--drag-cue-x", `${moveX}px`);
    cue.style.setProperty("--drag-cue-y", `${moveY}px`);

    noteGhost.removeAttribute("data-sticky-note");
    noteGhost.classList.remove("is-dragging");
    noteGhost.classList.add("sticky-note-drag-ghost-card");
    noteGhost.style.left = "";
    noteGhost.style.top = "";
    noteGhost.style.width = "";
    noteGhost.style.zIndex = "";

    hand.className = "sticky-note-drag-hand";
    hand.setAttribute("aria-hidden", "true");
    palm.className = "sticky-note-drag-hand-palm";
    hand.append(palm);

    cue.append(noteGhost, hand);
    board.append(cue);
    board.classList.add("has-drag-cue");

    cue.addEventListener("animationend", (event) => {
      if (event.animationName !== "sticky-drag-cue-fade") {
        return;
      }

      cue.remove();
      board.classList.remove("has-drag-cue");
    });
  };

  const maybeShowDragCue = () => {
    if (window.location.hash !== "#tab-about" || compactLayout.matches || reducedMotion.matches || dragCueShown) {
      return;
    }

    dragCueShown = true;
    boards.forEach(syncBoard);

    window.setTimeout(() => {
      const board = boards[0];

      if (window.location.hash === "#tab-about" && board) {
        createDragCue(board);
      }
    }, 620);
  };

  boards.forEach((board) => {
    const notes = Array.from(board.querySelectorAll("[data-sticky-note]"));

    syncBoard(board);

    notes.forEach((note) => {
      let activePointerId = null;
      let startLeft = 0;
      let startTop = 0;
      let originX = 0;
      let originY = 0;

      note.addEventListener("pointerdown", (event) => {
        if (compactLayout.matches || event.button !== 0) {
          return;
        }

        activePointerId = event.pointerId;
        startLeft = Number.parseFloat(note.style.left || "0");
        startTop = Number.parseFloat(note.style.top || "0");
        originX = event.clientX;
        originY = event.clientY;
        zIndexSeed += 1;

        note.classList.add("is-dragging");
        note.style.zIndex = String(zIndexSeed);
        note.setPointerCapture(event.pointerId);
        event.preventDefault();
      });

      note.addEventListener("pointermove", (event) => {
        if (compactLayout.matches || activePointerId !== event.pointerId) {
          return;
        }

        const deltaX = event.clientX - originX;
        const deltaY = event.clientY - originY;

        setNotePosition(note, board, startLeft + deltaX, startTop + deltaY);
      });

      note.addEventListener("wheel", (event) => {
        if (compactLayout.matches || activePointerId === null) {
          return;
        }

        const direction = Math.sign(event.deltaY || event.deltaX);

        if (!direction) {
          return;
        }

        event.preventDefault();
        setNoteRotation(note, getNoteRotation(note) + direction * 4);
      }, { passive: false });

      const stopDragging = (event) => {
        if (activePointerId !== event.pointerId) {
          return;
        }

        note.classList.remove("is-dragging");

        if (note.hasPointerCapture(event.pointerId)) {
          note.releasePointerCapture(event.pointerId);
        }

        activePointerId = null;
      };

      note.addEventListener("pointerup", stopDragging);
      note.addEventListener("pointercancel", stopDragging);
    });
  });

  const handleResize = () => {
    boards.forEach(syncBoard);
  };

  window.addEventListener("resize", handleResize);
  window.addEventListener("hashchange", maybeShowDragCue);
  window.addEventListener("load", maybeShowDragCue);

  if (typeof compactLayout.addEventListener === "function") {
    compactLayout.addEventListener("change", handleResize);
  } else if (typeof compactLayout.addListener === "function") {
    compactLayout.addListener(handleResize);
  }

  maybeShowDragCue();
})();
