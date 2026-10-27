const words = [
  "systems",
  "machines",
  "illustrations",
  "brand identities",
  "services",
  "prototypes",
  "technology",
];

const el = document.getElementById("word");
let i = 0;
let timer;

function next() {
  el.classList.add("out");
  setTimeout(() => {
    i = (i + 1) % words.length;
    el.textContent = words[i];
    el.classList.remove("out");
  }, 180);
}

function autoplay() {
  clearInterval(timer);
  timer = setInterval(next, 2600);
}

el.addEventListener("click", () => {
  next();
  autoplay(); // restart the timer so it doesn't change right after a click
});

autoplay();
