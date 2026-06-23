import "./style.css";

const CELLS = 20; // grid is CELLS x CELLS
const BASE_SPEED_MS = 130; // tick interval at start
const MIN_SPEED_MS = 65; // fastest it gets
const SPEEDUP_PER_FOOD = 3; // ms shaved per food eaten

type Point = { x: number; y: number };
type Dir = "up" | "down" | "left" | "right";

const canvas = document.getElementById("game") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
const scoreEl = document.getElementById("score")!;
const bestEl = document.getElementById("best")!;
const overlay = document.getElementById("overlay")!;
const overlayTitle = document.getElementById("overlay-title")!;
const overlaySub = document.getElementById("overlay-sub")!;
const restartBtn = document.getElementById("restart")!;

const cell = canvas.width / CELLS;

const OPPOSITE: Record<Dir, Dir> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};
const DELTA: Record<Dir, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

type State = "idle" | "running" | "paused" | "over";

let snake: Point[];
let dir: Dir;
let queuedDir: Dir;
let food: Point;
let score: number;
let speed: number;
let state: State = "idle";
let timer: number | undefined;
let best = Number(localStorage.getItem("vibe-snake-best") ?? 0);

bestEl.textContent = String(best);

function reset() {
  const mid = Math.floor(CELLS / 2);
  snake = [
    { x: mid, y: mid },
    { x: mid - 1, y: mid },
    { x: mid - 2, y: mid },
  ];
  dir = "right";
  queuedDir = "right";
  score = 0;
  speed = BASE_SPEED_MS;
  scoreEl.textContent = "0";
  placeFood();
  draw();
}

function placeFood() {
  while (true) {
    const p = {
      x: Math.floor(Math.random() * CELLS),
      y: Math.floor(Math.random() * CELLS),
    };
    if (!snake.some((s) => s.x === p.x && s.y === p.y)) {
      food = p;
      return;
    }
  }
}

function start() {
  if (state === "running") return;
  if (state === "over" || state === "idle") reset();
  state = "running";
  hideOverlay();
  schedule();
}

function schedule() {
  if (timer) clearTimeout(timer);
  timer = window.setTimeout(tick, speed);
}

function pause() {
  if (state !== "running") return;
  state = "paused";
  if (timer) clearTimeout(timer);
  showOverlay("paused", "press space or tap to resume");
}

function gameOver() {
  state = "over";
  if (timer) clearTimeout(timer);
  if (score > best) {
    best = score;
    localStorage.setItem("vibe-snake-best", String(best));
    bestEl.textContent = String(best);
  }
  showOverlay("game over", "score " + score + " · space or tap to retry");
}

function tick() {
  dir = queuedDir;
  const head = snake[0];
  const next = { x: head.x + DELTA[dir].x, y: head.y + DELTA[dir].y };

  const hitWall =
    next.x < 0 || next.y < 0 || next.x >= CELLS || next.y >= CELLS;
  const hitSelf = snake.some((s) => s.x === next.x && s.y === next.y);
  if (hitWall || hitSelf) {
    gameOver();
    return;
  }

  snake.unshift(next);

  if (next.x === food.x && next.y === food.y) {
    score += 1;
    scoreEl.textContent = String(score);
    speed = Math.max(MIN_SPEED_MS, speed - SPEEDUP_PER_FOOD);
    placeFood();
  } else {
    snake.pop();
  }

  draw();
  schedule();
}

function roundRect(x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // food
  ctx.fillStyle = getCss("--food");
  roundRect(food.x * cell + 3, food.y * cell + 3, cell - 6, cell - 6, 4);

  // snake
  snake.forEach((s, i) => {
    ctx.fillStyle = i === 0 ? getCss("--snake-head") : getCss("--snake");
    roundRect(s.x * cell + 1.5, s.y * cell + 1.5, cell - 3, cell - 3, 4);
  });
}

function getCss(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function showOverlay(title: string, sub: string) {
  overlayTitle.textContent = title;
  overlaySub.textContent = sub;
  overlay.removeAttribute("hidden");
}
function hideOverlay() {
  overlay.setAttribute("hidden", "");
}

function setDir(d: Dir) {
  // ignore reversals into self
  if (d === OPPOSITE[dir]) return;
  queuedDir = d;
}

const KEYS: Record<string, Dir> = {
  ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
  w: "up", s: "down", a: "left", d: "right",
  W: "up", S: "down", A: "left", D: "right",
};

window.addEventListener("keydown", (e) => {
  if (e.key === " " || e.key === "Enter") {
    e.preventDefault();
    if (state === "running") pause();
    else start();
    return;
  }
  const d = KEYS[e.key];
  if (d) {
    e.preventDefault();
    if (state !== "running") start();
    setDir(d);
  }
});

// touch / swipe
let touchStart: Point | null = null;
canvas.addEventListener("touchstart", (e) => {
  const t = e.changedTouches[0];
  touchStart = { x: t.clientX, y: t.clientY };
}, { passive: true });
canvas.addEventListener("touchend", (e) => {
  if (!touchStart) return;
  const t = e.changedTouches[0];
  const dx = t.clientX - touchStart.x;
  const dy = t.clientY - touchStart.y;
  touchStart = null;
  if (Math.abs(dx) < 20 && Math.abs(dy) < 20) {
    // treat as a tap: start/pause
    if (state === "running") pause();
    else start();
    return;
  }
  if (state !== "running") start();
  if (Math.abs(dx) > Math.abs(dy)) setDir(dx > 0 ? "right" : "left");
  else setDir(dy > 0 ? "down" : "up");
}, { passive: true });

overlay.addEventListener("click", () => {
  if (state === "running") pause();
  else start();
});
restartBtn.addEventListener("click", () => {
  reset();
  start();
});

reset();
showOverlay("snake", "press space or tap to start");
