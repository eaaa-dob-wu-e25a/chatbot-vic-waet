/* SECTION - Cursor dot */
const dot = document.getElementById("dot");
const pos = { x: 0, y: 0 };
const view = { x: 0, y: 0 }; // for easing

window.addEventListener("pointermove", (e) => {
  pos.x = e.clientX;
  pos.y = e.clientY;
});

function tick() {
  // ease towards the pointer (0.15 = smoothing factor)
  view.x += (pos.x - view.x) * 0.15;
  view.y += (pos.y - view.y) * 0.15;

  dot.style.transform = `translate(${view.x}px, ${view.y}px)`;
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

/* SECTION - Actions */
function navigateTo() {
  console.log("Button got a click!")
}
