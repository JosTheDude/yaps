(function () {
  'use strict';

  /* ── CONFIG ─────────────────────────────────────── */
  const SCALE      = 3;       // CSS pixels per sprite pixel
  const FPS        = 7;       // animation ticks per second
  const WALK_SPEED = 0.6;     // sprite-pixels per tick
  const MARGIN     = 32;      // px from right edge when sitting

  /* ── PALETTE ─────────────────────────────────────── */
  const _ = null;
  const B = '#1a1a2e';  // dark outline
  const O = '#c9855d';  // orange/tan body
  const W = '#f0ece0';  // white/cream belly
  const P = '#e87878';  // pink (nose, inner ears)
  const E = '#1a1525';  // eye

  /* ── SITTING SPRITES (13 × 14) ────────────────────
     Frontal-ish view. Two frames = tail wag.           */
  const SIT_BASE = [
    [_,_,B,B,_,_,_,B,B,_,_,_,_],   // 0  ear tips
    [_,B,O,O,B,_,B,O,O,B,_,_,_],   // 1  ears outer
    [_,B,O,P,O,B,O,P,O,B,_,_,_],   // 2  inner ears (pink)
    [B,O,O,O,O,O,O,O,O,O,B,_,_],   // 3  head top
    [B,O,E,O,O,O,O,O,E,O,O,B,_],   // 4  eyes
    [B,O,O,O,P,O,O,P,O,O,O,B,_],   // 5  nose
    [B,W,W,W,W,W,W,W,W,W,W,B,_],   // 6  belly start
    [_,B,W,W,W,W,W,W,W,W,B,_,_],   // 7  belly
    [_,B,O,O,O,O,O,O,O,O,B,_,_],   // 8  body
    [B,B,O,O,O,O,O,O,O,O,B,B,_],   // 9  paw base
  ];

  // Tail frame 1 — tail raised up-right
  const SIT_1 = [
    ...SIT_BASE,
    [B,O,B,_,_,_,_,_,_,B,O,B,B],   // 10 legs + tail start
    [B,B,B,_,_,_,_,_,_,B,B,B,O],   // 11 paws + tail mid
    [_,_,_,_,_,_,_,_,_,_,_,B,B],   // 12 tail tip (high)
    [_,_,_,_,_,_,_,_,_,_,_,_,_],   // 13 empty
  ];

  // Tail frame 2 — tail swept right-low (wagged down)
  const SIT_2 = [
    ...SIT_BASE,
    [B,O,B,_,_,_,_,_,_,B,O,B,_],   // 10 legs
    [B,B,B,_,_,_,_,_,_,B,B,B,B],   // 11 paws + tail starts right
    [_,_,_,_,_,_,_,_,_,_,_,_,B],   // 12 tail tip (low)
    [_,_,_,_,_,_,_,_,_,_,_,_,_],   // 13 empty
  ];

  /* ── SLEEP SPRITE (13 × 14) ──────────────────────── */
  const SLEEP_1 = [
    [_,_,B,B,_,_,_,B,B,_,_,_,_],
    [_,B,O,O,B,_,B,O,O,B,_,_,_],
    [_,B,O,P,O,B,O,P,O,B,_,_,_],
    [B,O,O,O,O,O,O,O,O,O,B,_,_],
    [B,O,B,B,O,O,O,O,B,B,O,B,_],   // closed eyes
    [B,O,O,O,P,O,O,P,O,O,O,B,_],
    [B,W,W,W,W,W,W,W,W,W,W,B,_],
    [_,B,W,W,W,W,W,W,W,W,B,_,_],
    [_,B,O,O,O,O,O,O,O,O,B,_,_],
    [B,B,O,O,O,O,O,O,O,O,B,B,_],
    [B,O,B,_,_,_,_,_,_,B,O,B,B],
    [B,B,B,_,_,_,_,_,_,B,B,B,O],
    [_,_,_,_,_,_,_,_,_,_,_,B,B],
    [_,_,_,_,_,_,_,_,_,_,_,_,_],
  ];

  // Zzz sprite: tiny 5×3 "z" dots drawn offset from the cat canvas
  const ZZZ = ['z', 'Z'];

  /* ── WALK SPRITES (12 × 11, facing RIGHT) ──────────
     Tail omitted at this scale — just body + head.
     Mirror each row for walking LEFT.                  */
  const WALK_BASE = [
    [_,_,B,B,B,B,_,_,_,_,_,_],   // 0  head top
    [_,B,O,O,O,O,B,_,_,_,_,_],   // 1  head
    [B,O,E,O,O,O,O,B,_,_,_,_],   // 2  eye
    [B,O,O,P,O,O,O,B,_,_,_,_],   // 3  nose
    [B,O,O,O,O,O,O,O,O,O,O,B],   // 4  body top
    [_,B,W,W,W,W,W,W,W,W,B,_],   // 5  belly
    [_,_,B,O,O,O,O,O,O,B,_,_],   // 6  lower body
  ];

  // Frame 1: neutral (legs side by side)
  const WALK_1 = [
    ...WALK_BASE,
    [_,_,_,B,O,B,_,B,O,B,_,_],   // 7  legs down
    [_,_,_,B,B,B,_,B,B,B,_,_],   // 8  paws
    [_,_,_,_,_,_,_,_,_,_,_,_],   // 9
    [_,_,_,_,_,_,_,_,_,_,_,_],   // 10
  ];

  // Frame 2: stride A (front-left / back-right extended)
  const WALK_2 = [
    ...WALK_BASE,
    [_,_,B,O,B,_,_,_,B,O,B,_],   // 7  legs spread
    [_,B,O,B,_,_,_,_,_,B,O,B],   // 8  paws angled out
    [_,B,B,_,_,_,_,_,_,_,B,B],   // 9  paw tips
    [_,_,_,_,_,_,_,_,_,_,_,_],   // 10
  ];

  // Frame 3: neutral (same as 1)
  const WALK_3 = WALK_1;

  // Frame 4: stride B (front-right / back-left extended)
  const WALK_4 = [
    ...WALK_BASE,
    [_,_,_,_,B,O,B,B,O,B,_,_],   // 7  legs spread other way
    [_,_,_,_,_,B,O,O,B,_,_,_],   // 8  paws
    [_,_,_,_,_,B,B,B,_,_,_,_],   // 9  paw tips
    [_,_,_,_,_,_,_,_,_,_,_,_],   // 10
  ];

  /* ── CANVAS ──────────────────────────────────────── */
  const SPR_W = 13, SPR_H = 14;   // largest sprite dimensions
  const canvas = document.createElement('canvas');
  canvas.width  = SPR_W * SCALE;
  canvas.height = SPR_H * SCALE;

  Object.assign(canvas.style, {
    position:       'fixed',
    bottom:         '0px',
    right:          MARGIN + 'px',
    zIndex:         '9998',
    imageRendering: 'pixelated',
    cursor:         'pointer',
    userSelect:     'none',
    WebkitUserSelect: 'none',
  });

  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  /* ── ZZZ LABEL ───────────────────────────────────── */
  const zLabel = document.createElement('span');
  Object.assign(zLabel.style, {
    position:   'fixed',
    bottom:     SPR_H * SCALE + 4 + 'px',
    zIndex:     '9999',
    fontSize:   '10px',
    fontFamily: 'monospace',
    color:      '#d58ef5',
    pointerEvents: 'none',
    opacity:    '0',
    transition: 'opacity 0.4s',
  });
  zLabel.textContent = 'z z z';
  document.body.appendChild(zLabel);

  /* ── DRAW ────────────────────────────────────────── */
  function drawFrame(rows) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    rows.forEach((row, y) => {
      row.forEach((color, x) => {
        if (color !== null) {
          ctx.fillStyle = color;
          ctx.fillRect(x * SCALE, y * SCALE, SCALE, SCALE);
        }
      });
    });
  }

  function mirrorFrame(rows) {
    return rows.map(row => [...row].reverse());
  }

  /* ── STATE MACHINE ───────────────────────────────── */
  const STATES = { SIT: 'sit', WALK: 'walk', SLEEP: 'sleep' };
  let state      = STATES.SIT;
  let tick       = 0;
  let stateTimer = 0;
  let walkDir    = 1;   // +1 right, -1 left

  // catX = canvas left edge in px (used while walking)
  let catX = window.innerWidth - MARGIN - SPR_W * SCALE;

  function rnd(lo, hi) { return Math.floor(Math.random() * (hi - lo + 1)) + lo; }

  function setRight(px) {
    canvas.style.left  = '';
    canvas.style.right = px + 'px';
    zLabel.style.left  = '';
    zLabel.style.right = px + 'px';
  }

  function setLeft(px) {
    canvas.style.right = '';
    canvas.style.left  = px + 'px';
    zLabel.style.right = '';
    zLabel.style.left  = (px + SPR_W * SCALE / 2 - 12) + 'px';
  }

  function startState(s) {
    state = s;
    tick  = 0;
    if (s === STATES.SIT) {
      stateTimer = rnd(60, 200);
      setRight(MARGIN);
      catX = window.innerWidth - MARGIN - SPR_W * SCALE;
      zLabel.style.opacity = '0';
    } else if (s === STATES.SLEEP) {
      stateTimer = rnd(120, 400);
      setRight(MARGIN);
      catX = window.innerWidth - MARGIN - SPR_W * SCALE;
      zLabel.style.opacity = '1';
      zLabel.style.bottom  = (SPR_H * SCALE + 2) + 'px';
    } else if (s === STATES.WALK) {
      stateTimer = rnd(80, 220);
      walkDir    = Math.random() < 0.5 ? 1 : -1;
      setLeft(catX);
      zLabel.style.opacity = '0';
    }
  }

  function pickNext() {
    const r = Math.random();
    if (r < 0.40)      startState(STATES.SIT);
    else if (r < 0.70) startState(STATES.WALK);
    else               startState(STATES.SLEEP);
  }

  startState(STATES.SIT);

  /* ── MAIN LOOP ───────────────────────────────────── */
  setInterval(function () {
    tick++;
    stateTimer--;

    if (state === STATES.SIT) {
      const frames = [SIT_1, SIT_2];
      drawFrame(frames[Math.floor(tick / 4) % 2]);
      if (stateTimer <= 0) pickNext();

    } else if (state === STATES.SLEEP) {
      drawFrame(SLEEP_1);
      // Gentle zzz bob
      const bob = Math.sin(tick * 0.12) * 2;
      zLabel.style.bottom = (SPR_H * SCALE + 4 + bob) + 'px';
      if (stateTimer <= 0) pickNext();

    } else if (state === STATES.WALK) {
      const wFrames = [WALK_1, WALK_2, WALK_3, WALK_4];
      const f = wFrames[Math.floor(tick / 2) % 4];
      drawFrame(walkDir === 1 ? f : mirrorFrame(f));

      catX += walkDir * WALK_SPEED * SCALE;

      const maxX = window.innerWidth - SPR_W * SCALE;
      if (catX <= 0)    { catX = 0;    walkDir =  1; }
      if (catX >= maxX) { catX = maxX; walkDir = -1; }
      setLeft(catX);

      if (stateTimer <= 0) pickNext();
    }
  }, 1000 / FPS);

  /* ── CLICK ───────────────────────────────────────── */
  canvas.addEventListener('click', function () {
    if (state === STATES.SLEEP) {
      zLabel.style.opacity = '0';
      startState(STATES.SIT);
      return;
    }
    canvas.style.transition = 'transform 0.12s ease-out';
    canvas.style.transform  = 'scale(1.25) translateY(-8px)';
    setTimeout(function () {
      canvas.style.transform = '';
      setTimeout(function () { canvas.style.transition = ''; }, 120);
    }, 140);
  });

})();
