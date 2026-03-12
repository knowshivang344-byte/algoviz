// utils.js — shared helpers

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function speedToDelay(s) {
  return {1:200, 2:80, 3:30, 4:8, 5:1}[s] || 30;
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArr(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Resize canvas to its CSS display size (call before drawing)
function fitCanvas(canvas) {
  const r = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width  = r.width  * dpr;
  canvas.height = r.height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return { w: r.width, h: r.height };
}

// Get logical canvas size
function cSize(canvas) {
  const dpr = window.devicePixelRatio || 1;
  return { w: canvas.width / dpr, h: canvas.height / dpr };
}
