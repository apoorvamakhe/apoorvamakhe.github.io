// Click a sketchbook photo to see it big; click anywhere or press Esc to close.

const viewer = document.querySelector('.viewer');
const big = viewer.querySelector('img');
let opener = null;

document.querySelectorAll('.tile').forEach(tile => {
  tile.addEventListener('click', e => {
    e.preventDefault();
    const img = tile.querySelector('img');
    big.src = img.src;
    big.alt = img.alt;
    opener = tile;
    viewer.hidden = false;
  });
});

function close() {
  if (viewer.hidden) return;
  viewer.hidden = true;
  opener?.focus();
}
viewer.addEventListener('click', close);
document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
