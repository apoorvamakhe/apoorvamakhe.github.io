// Hover a tile: the others slide a little away from it and turn slightly,
// like carrom pieces after a soft flick, then glide back.

const tiles = [...document.querySelectorAll('.tile')];
const field = document.querySelector('.field');
const calm = matchMedia('(prefers-reduced-motion: reduce)');
const narrow = matchMedia('(max-width: 700px)');
let leaveTimer;

// Hide image slots that don't have a file yet (the grey tile shows instead)
document.querySelectorAll('.card img').forEach(img => {
  const hide = () => img.classList.add('missing');
  if (img.complete && img.naturalWidth === 0) hide();
  else img.addEventListener('error', hide);
});

// Each tile gets its own fixed "personality" so movement isn't evenly radial:
// a straight idle drift direction, and an angle/strength it slides at when nudged.
function seeded(n) { const x = Math.sin(n * 9301 + 49297) * 233280; return x - Math.floor(x); }
tiles.forEach((t, i) => {
  const driftAngle = seeded(i + 1) * Math.PI * 2;
  const driftLen = 2.5 + seeded(i + 11) * 2;               // Figma px
  t.style.setProperty('--fx', (Math.cos(driftAngle) * driftLen).toFixed(2));
  t.style.setProperty('--fy', (Math.sin(driftAngle) * driftLen).toFixed(2));
  t.style.setProperty('--fdur', `${6 + seeded(i + 21) * 4}s`);
  t._skew = (seeded(i + 31) - 0.5) * 0.9;                  // up to ±25° off the straight-away line
  t._power = 0.6 + seeded(i + 41) * 0.7;                   // 0.6 – 1.3
  t._spinDir = seeded(i + 51) > 0.5 ? 1 : -1;
});

function centre(el) {
  // use layout position (offsets) so drifting tiles don't feed back into the maths
  return { x: el.offsetLeft + el.offsetWidth / 2, y: el.offsetTop + el.offsetHeight / 2 };
}

function swayFrom(active) {
  const unit = field.clientWidth / 987;          // 1 Figma px
  const a = centre(active);

  tiles.forEach(t => {
    if (t === active) {
      t.classList.add('active');
      t.style.setProperty('--dx', '0px');
      t.style.setProperty('--dy', '0px');
      t.style.setProperty('--rot', '0deg');
      t.style.zIndex = 2;
      return;
    }
    const b = centre(t);
    const dx = b.x - a.x, dy = b.y - a.y;
    const d = Math.hypot(dx, dy) || 1;
    // closer pieces slide more; far ones barely notice
    const fall = Math.exp(-d / (450 * unit));
    const push = 40 * unit * fall * t._power;
    // slide in a straight line, but each piece glances off at its own angle
    const ang = Math.atan2(dy, dx) + t._skew;
    // only a hint of spin
    const spin = t._spinDir * 1.5 * fall;
    t.style.setProperty('--dx', `${Math.cos(ang) * push}px`);
    t.style.setProperty('--dy', `${Math.sin(ang) * push}px`);
    t.style.setProperty('--rot', `${spin}deg`);
    t.style.zIndex = '';
    t.classList.remove('active');
  });
}

function settle() {
  tiles.forEach(t => {
    ['--dx', '--dy', '--rot'].forEach(p => t.style.removeProperty(p));
    t.classList.remove('active');
    t.style.zIndex = '';
  });
}

tiles.forEach(t => {
  const on = () => {
    if (calm.matches || narrow.matches) return;
    clearTimeout(leaveTimer);
    swayFrom(t);
  };
  // small delay so moving between tiles doesn't snap everything back first
  const off = () => { leaveTimer = setTimeout(settle, 120); };
  t.addEventListener('pointerenter', on);
  t.addEventListener('pointerleave', off);
  t.addEventListener('focus', on);
  t.addEventListener('blur', off);
});
