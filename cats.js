// The Directory of Cats: visitors type a name under each cat.
// Names are saved in the visitor's own browser, so they're still there
// when that person comes back. (Other visitors won't see them.)

const KEY = 'cat-names';

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}
function save(names) {
  try { localStorage.setItem(KEY, JSON.stringify(names)); } catch { /* private mode: just skip */ }
}

const names = load();

document.querySelectorAll('.name input').forEach(input => {
  const cat = input.dataset.cat;
  const note = input.parentElement.querySelector('.saved');
  if (names[cat]) input.value = names[cat];

  const commit = () => {
    const value = input.value.trim();
    if ((names[cat] || '') === value) return;
    if (value) names[cat] = value; else delete names[cat];
    save(names);
    note.textContent = value ? `hello, ${value} ♡` : '';
    note.classList.add('show');
    clearTimeout(note._t);
    note._t = setTimeout(() => note.classList.remove('show'), 2200);
  };

  input.addEventListener('keydown', e => { if (e.key === 'Enter') { commit(); input.blur(); } });
  input.addEventListener('blur', commit);
});
