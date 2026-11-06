// Sat-Sangeet videos
// - Hover a video: it plays (with sound), and pauses when you move away.
// - Click: it keeps playing after you move away.
// - Click again: it pauses.
// - The round button on each video does the same: play / pause.
// Only one video plays at a time. Esc pauses everything.
// Browsers only allow sound after the visitor has clicked the page once,
// so before that first click, hovering plays the video silently.

const vids = [...document.querySelectorAll('.tile.vid')].map(tile => ({
  tile, video: tile.querySelector('video'), pinned: false,
}));

// Hide the broken-image icon if a photo file is missing
document.querySelectorAll('.card img').forEach(img => {
  const hide = () => img.classList.add('missing');
  if (img.complete && img.naturalWidth === 0) hide(); else img.addEventListener('error', hide);
});

const canSound = () => !navigator.userActivation || navigator.userActivation.hasBeenActive;

function fadeVolume(v, to, ms, done) {
  cancelAnimationFrame(v._f);
  const from = v.volume, start = performance.now();
  const step = now => {
    const t = Math.min(1, (now - start) / ms);
    v.volume = from + (to - from) * t;
    if (t < 1) v._f = requestAnimationFrame(step); else done && done();
  };
  v._f = requestAnimationFrame(step);
}

function play(entry) {
  const v = entry.video;
  vids.forEach(o => { if (o !== entry) pause(o); });   // one at a time
  cancelAnimationFrame(v._f);
  if (canSound()) { v.muted = false; v.volume = v.paused ? 0 : v.volume; }
  else v.muted = true;
  v.play()
    .then(() => {
      if (!v.muted) { fadeVolume(v, 1, 350); entry.tile.classList.add('loud'); }   // ♪ only when there's sound
    })
    .catch(() => { v.muted = true; v.play().catch(() => {}); });   // fall back to silent
}

function pause(entry) {
  const v = entry.video;
  entry.pinned = false;
  entry.tile.classList.remove('loud', 'pinned');
  if (v.paused) return;
  if (v.muted) { v.pause(); return; }
  fadeVolume(v, 0, 250, () => v.pause());
}

vids.forEach(entry => {
  const { tile, video } = entry;
  const btn = tile.querySelector('.pp');

  // keep the button icon in sync with the video
  const sync = () => {
    const on = !video.paused;
    tile.classList.toggle('playing', on);
    btn.setAttribute('aria-label', on ? 'Pause' : 'Play');
  };
  video.addEventListener('play', sync);
  video.addEventListener('pause', sync);

  // button: play (and keep playing) / pause
  btn.addEventListener('click', e => {
    e.stopPropagation();
    if (!video.paused && entry.pinned) { pause(entry); return; }
    play(entry);
    entry.pinned = true;
    tile.classList.add('pinned');
  });

  tile.addEventListener('pointerenter', () => { if (!entry.pinned) play(entry); });

  tile.addEventListener('pointerleave', () => { if (!entry.pinned) pause(entry); });

  tile.addEventListener('click', () => {
    if (entry.pinned) { pause(entry); return; }   // second click: pause
    play(entry);
    entry.pinned = true;
    tile.classList.add('pinned');
  });
});

document.addEventListener('keydown', e => { if (e.key === 'Escape') vids.forEach(pause); });
