const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const ui = {
  levelName: document.getElementById("levelName"),
  playerForm: document.getElementById("playerForm"),
  lives: document.getElementById("lives"),
  trendStatus: document.getElementById("trendStatus"),
  eventLog: document.getElementById("eventLog"),
};

const levels = [
  {
    name: "Doge Awakens",
    form: "Doge",
    style: { bg1: "#2f1f56", bg2: "#201336", accent: "#ffd166", floor: "#3d2a64" },
    speed: 4,
    jumps: 1,
    spawnRate: 85,
    obstacles: ["Such Jump", "Very Spike", "Wow"],
    hazardColor: "#ffd166",
    intro: "2013 вернулся. Skype, wow и золотой Doge.",
  },
  {
    name: "Skibidi Toilet Panic",
    form: "Унитаз на ножках",
    style: { bg1: "#2f2f2f", bg2: "#101010", accent: "#4ac3ff", floor: "#1d1d1d" },
    speed: 5.5,
    jumps: 2,
    spawnRate: 70,
    obstacles: ["Head", "Flush", "Door"],
    hazardColor: "#4ac3ff",
    intro: "PS1-хоррор ванная: двери скрипят, ритм ускоряется.",
  },
  {
    name: "Hawk Tuah Mania",
    form: "Неоновый плювок",
    style: { bg1: "#1f0a3a", bg2: "#090218", accent: "#ff4bd8", floor: "#33094f" },
    speed: 6.5,
    jumps: 2,
    spawnRate: 62,
    obstacles: ["Neon Bot", "Signal", "POV"],
    hazardColor: "#ff4bd8",
    intro: "Неоновый лабиринт: теперь надо не только прыгать, но и стрелять звуком.",
    allowAttack: true,
  },
  {
    name: "Жиза (Secret Boss)",
    form: "Пиксельный Мем",
    style: { bg1: "#560f1f", bg2: "#18090f", accent: "#57ff5a", floor: "#330d14" },
    speed: 8,
    jumps: 2,
    spawnRate: 50,
    obstacles: ["🤡", "POV", "Signal", "Она тебя любит, бро"],
    hazardColor: "#57ff5a",
    intro: "Абсолютный хаос: экран трясётся, ритм ломается.",
    glitch: true,
    allowAttack: true,
  },
];

const trendLevel = {
  name: "Trend Mode: Barbieverse",
  form: "Розовый мем",
  style: { bg1: "#ff7ac8", bg2: "#ff3eb5", accent: "#fff08d", floor: "#d63f8c" },
  speed: 7,
  jumps: 2,
  spawnRate: 56,
  obstacles: ["Ken Head", "Pink Laser", "Viral Reel"],
  hazardColor: "#fff08d",
  intro: "Недельный тренд активирован: розовый мир Барби и Кенов.",
  allowAttack: true,
};

const state = {
  running: false,
  paused: false,
  levelIndex: 0,
  activeLevel: levels[0],
  lives: 3,
  score: 0,
  frame: 0,
  obstacles: [],
  shots: [],
  trendActive: false,
  player: {
    x: 120,
    y: 0,
    width: 48,
    height: 48,
    velocityY: 0,
    grounded: true,
    jumpCount: 0,
  },
};

const gravity = 0.62;
const floorY = canvas.height - 72;

function logEvent(text) {
  const li = document.createElement("li");
  li.textContent = `${new Date().toLocaleTimeString()} — ${text}`;
  ui.eventLog.prepend(li);
  while (ui.eventLog.children.length > 8) {
    ui.eventLog.removeChild(ui.eventLog.lastChild);
  }
}

function setLevel(level) {
  state.activeLevel = level;
  ui.levelName.textContent = level.name;
  ui.playerForm.textContent = level.form;
  logEvent(level.intro);
}

function resetPlayer() {
  state.player.y = floorY - state.player.height;
  state.player.velocityY = 0;
  state.player.grounded = true;
  state.player.jumpCount = 0;
}

function startGame() {
  state.running = true;
  state.paused = false;
  state.levelIndex = 0;
  state.lives = 3;
  state.score = 0;
  state.frame = 0;
  state.obstacles = [];
  state.shots = [];
  state.trendActive = false;
  setLevel(levels[state.levelIndex]);
  resetPlayer();
  ui.lives.textContent = state.lives;
  ui.trendStatus.textContent = "Не активен";
  logEvent("MEMETRIC запущен. So hype!");
}

function togglePause() {
  if (!state.running) return;
  state.paused = !state.paused;
  logEvent(state.paused ? "Пауза: мем отдыхает." : "Возврат в ритм.");
}

function activateTrendMode() {
  if (!state.running) return;
  state.trendActive = true;
  state.obstacles = [];
  setLevel(trendLevel);
  ui.trendStatus.textContent = "Активен: Barbieverse";
}

function nextLevel() {
  state.levelIndex += 1;
  if (state.levelIndex >= levels.length) {
    logEvent("Все основные уровни завершены. Ты абсолютный мем-мастер!");
    state.running = false;
    return;
  }
  state.obstacles = [];
  setLevel(levels[state.levelIndex]);
}

function spawnObstacle() {
  const level = state.activeLevel;
  state.obstacles.push({
    x: canvas.width + 20,
    y: floorY - 36,
    width: 36,
    height: 36,
    label: level.obstacles[Math.floor(Math.random() * level.obstacles.length)],
    speed: level.speed,
  });
}

function shootWave() {
  if (!state.running || state.paused) return;
  if (!state.activeLevel.allowAttack) {
    logEvent("На этом уровне атака недоступна: только ритм и прыжки.");
    return;
  }

  state.shots.push({
    x: state.player.x + state.player.width,
    y: state.player.y + state.player.height / 2,
    width: 16,
    height: 8,
    speed: 9,
  });
  logEvent('Hawk Tuah! Выпущена звуковая волна.');
}

function hitPlayer(text) {
  state.lives -= 1;
  ui.lives.textContent = state.lives;
  logEvent(`Столкновение: ${text}. So Fail.`);
  state.obstacles = [];
  resetPlayer();

  if (state.lives <= 0) {
    logEvent("Игра окончена. Нажми Старт для новой попытки.");
    state.running = false;
  }
}

function update() {
  if (!state.running || state.paused) return;

  const level = state.activeLevel;
  state.frame += 1;
  state.score += 1;

  if (state.frame % level.spawnRate === 0) {
    spawnObstacle();
  }

  if (state.frame % 1600 === 0 && !state.trendActive) {
    nextLevel();
  }

  state.player.velocityY += gravity;
  state.player.y += state.player.velocityY;

  if (state.player.y >= floorY - state.player.height) {
    state.player.y = floorY - state.player.height;
    state.player.velocityY = 0;
    state.player.grounded = true;
    state.player.jumpCount = 0;
  }

  state.obstacles.forEach((ob) => {
    ob.x -= ob.speed;
  });

  state.shots.forEach((shot) => {
    shot.x += shot.speed;
  });

  state.obstacles = state.obstacles.filter((ob) => ob.x + ob.width > -20);
  state.shots = state.shots.filter((shot) => shot.x < canvas.width + 30);

  for (const ob of state.obstacles) {
    if (
      state.player.x < ob.x + ob.width &&
      state.player.x + state.player.width > ob.x &&
      state.player.y < ob.y + ob.height &&
      state.player.y + state.player.height > ob.y
    ) {
      hitPlayer(ob.label);
      break;
    }
  }

  for (const shot of state.shots) {
    for (const ob of state.obstacles) {
      if (
        shot.x < ob.x + ob.width &&
        shot.x + shot.width > ob.x &&
        shot.y < ob.y + ob.height &&
        shot.y + shot.height > ob.y
      ) {
        ob.hit = true;
      }
    }
  }

  const removed = state.obstacles.filter((ob) => ob.hit).length;
  if (removed > 0) {
    state.score += removed * 25;
  }
  state.obstacles = state.obstacles.filter((ob) => !ob.hit);
}

function drawBackground(level) {
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, level.style.bg1);
  grad.addColorStop(1, level.style.bg2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (level.glitch) {
    const shakeX = (Math.random() - 0.5) * 12;
    const shakeY = (Math.random() - 0.5) * 10;
    ctx.translate(shakeX, shakeY);
  }

  ctx.fillStyle = level.style.floor;
  ctx.fillRect(0, floorY, canvas.width, canvas.height - floorY);
}

function drawPlayer() {
  ctx.fillStyle = "#fff";
  ctx.fillRect(state.player.x, state.player.y, state.player.width, state.player.height);
  ctx.fillStyle = "#1b1238";
  ctx.fillRect(state.player.x + 8, state.player.y + 14, 8, 8);
  ctx.fillRect(state.player.x + 30, state.player.y + 14, 8, 8);
}

function drawObstacles(level) {
  ctx.font = "12px monospace";
  state.obstacles.forEach((ob) => {
    ctx.fillStyle = level.hazardColor;
    ctx.fillRect(ob.x, ob.y, ob.width, ob.height);
    ctx.fillStyle = "#12091f";
    ctx.fillText(ob.label, ob.x - 6, ob.y - 6);
  });
}

function drawShots() {
  ctx.fillStyle = "#8ff7ff";
  state.shots.forEach((shot) => {
    ctx.fillRect(shot.x, shot.y, shot.width, shot.height);
  });
}

function drawOverlay() {
  ctx.fillStyle = "rgba(10, 5, 25, 0.65)";
  ctx.fillRect(14, 14, 240, 78);

  ctx.fillStyle = "#fff";
  ctx.font = "15px Segoe UI";
  ctx.fillText(`Очки: ${state.score}`, 24, 40);
  ctx.fillText(`Скорость: ${state.activeLevel.speed.toFixed(1)}`, 24, 62);
  ctx.fillText(`Фаза: ${state.running ? "В эфире" : "Ожидание"}`, 24, 84);

  if (!state.running) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "36px Segoe UI";
    ctx.fillText("Нажми Старт", canvas.width / 2 - 120, canvas.height / 2 - 10);
    ctx.font = "20px Segoe UI";
    ctx.fillText("MEMETRIC ждёт новый вирусный забег", canvas.width / 2 - 180, canvas.height / 2 + 25);
  }

  if (state.paused) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffdd57";
    ctx.font = "40px Segoe UI";
    ctx.fillText("ПАУЗА", canvas.width / 2 - 85, canvas.height / 2);
  }
}

function render() {
  ctx.save();
  drawBackground(state.activeLevel);
  drawPlayer();
  drawObstacles(state.activeLevel);
  drawShots();
  drawOverlay();
  ctx.restore();
  requestAnimationFrame(gameLoop);
}

function gameLoop() {
  update();
  render();
}

function jump() {
  if (!state.running || state.paused) return;
  const maxJumps = state.activeLevel.jumps;
  if (state.player.jumpCount >= maxJumps) return;

  state.player.velocityY = -12;
  state.player.jumpCount += 1;
  state.player.grounded = false;
}

document.getElementById("startBtn").addEventListener("click", startGame);
document.getElementById("pauseBtn").addEventListener("click", togglePause);
document.getElementById("trendBtn").addEventListener("click", activateTrendMode);

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (key === " " || key === "w") {
    event.preventDefault();
    jump();
  }
  if (key === "k") {
    shootWave();
  }
  if (key === "t") {
    activateTrendMode();
  }
});

setLevel(levels[0]);
resetPlayer();
logEvent("Добро пожаловать в MEMETRIC. Готовься к биту.");
requestAnimationFrame(gameLoop);
