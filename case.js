// Case study pages: things rise in as you scroll, and images open large on click.

const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// stagger the title letters
document.querySelectorAll('.intro h1 span').forEach((s, i) => { s.style.animationDelay = `${i * 45}ms`; });

const viewer = document.querySelector('.viewer');
const big = viewer.querySelector('img');
let opener = null;

document.querySelectorAll('.figs figure').forEach(fig => {
  fig.tabIndex = 0;
  const open = () => {
    const img = fig.querySelector('img');
    big.src = img.src; big.alt = img.alt;
    opener = fig; viewer.hidden = false;
  };
  fig.addEventListener('click', open);
  fig.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
});

function close() { if (!viewer.hidden) { viewer.hidden = true; opener?.focus(); } }
viewer.addEventListener('click', close);
document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
