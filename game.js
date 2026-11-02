const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const menuOverlay = document.getElementById('menuOverlay');
const pauseOverlay = document.getElementById('pauseOverlay');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const gameOverTitle = document.getElementById('gameOverTitle');
const gameOverText = document.getElementById('gameOverText');
const startBtn = document.getElementById('startBtn');
const resumeBtn = document.getElementById('resumeBtn');
const restartBtn = document.getElementById('restartBtn');
const retryBtn = document.getElementById('retryBtn');

const LEVELS = [
  {
    name: 'Forest Ruins',
    theme: 'forest',
    worldWidth: 2600,
    groundY: 560,
    platforms: [
      [0, 590, 430, 130],
      [520, 560, 220, 160],
      [860, 510, 220, 210],
      [1180, 560, 250, 160],
      [1550, 500, 260, 220],
      [1860, 570, 240, 150],
      [2170, 520, 260, 200],
      [2430, 650, 160, 70]
    ],
    coins: [
      [170, 500], [340, 500], [600, 465], [720, 430],
      [910, 440], [1260, 500], [1650, 445], [1960, 500],
      [2280, 465], [2490, 420]
    ],
    enemies: [
      { x: 620, y: 0, type: 'slime', dir: 1, hp: 30, size: 28, patrol: [620, 760], speed: 80 },
      { x: 980, y: 0, type: 'slime', dir: -1, hp: 30, size: 28, patrol: [920, 1160], speed: 80 },
      { x: 1430, y: 0, type: 'bat', dir: 1, hp: 25, size: 24, patrol: [1380, 1700], speed: 100, flying: true },
      { x: 1750, y: 0, type: 'slime', dir: 1, hp: 34, size: 30, patrol: [1700, 2060], speed: 90 },
      { x: 2240, y: 0, type: 'bat', dir: -1, hp: 28, size: 26, patrol: [2160, 2420], speed: 100, flying: true }
    ]
  },
  {
    name: 'Moonlit Cavern',
    theme: 'cave',
    worldWidth: 3100,
    groundY: 560,
    platforms: [
      [0, 590, 380, 130],
      [420, 520, 220, 200],
      [710, 490, 260, 230],
      [1040, 560, 250, 160],
      [1360, 470, 260, 250],
      [1720, 540, 240, 180],
      [2050, 490, 260, 230],
      [2380, 560, 260, 160],
      [2700, 495, 220, 225],
      [2900, 650, 180, 70]
    ],
    coins: [
      [150, 500], [480, 440], [840, 420], [1100, 470], [1480, 390],
      [1760, 465], [2140, 440], [2500, 470], [2820, 420], [2980, 430]
    ],
    enemies: [
      { x: 540, y: 0, type: 'slime', dir: 1, hp: 34, size: 30, patrol: [520, 760], speed: 90 },
      { x: 1160, y: 0, type: 'bat', dir: 1, hp: 26, size: 26, patrol: [1100, 1340], speed: 110, flying: true },
      { x: 1500, y: 0, type: 'slime', dir: -1, hp: 38, size: 30, patrol: [1420, 1760], speed: 90 },
      { x: 2140, y: 0, type: 'bat', dir: -1, hp: 30, size: 28, patrol: [2100, 2420], speed: 110, flying: true },
      { x: 2610, y: 0, type: 'slime', dir: 1, hp: 42, size: 32, patrol: [2550, 2880], speed: 100 },
      { x: 2925, y: 0, type: 'slime', dir: -1, hp: 45, size: 34, patrol: [2840, 3050], speed: 100 }
    ]
  },
  {
    name: 'Castle of the Fallen',
    theme: 'castle',
    worldWidth: 3600,
    groundY: 560,
    platforms: [
      [0, 590, 350, 130],
      [420, 530, 220, 190],
      [700, 470, 250, 250],
      [1010, 540, 230, 180],
      [1370, 470, 230, 250],
      [1660, 590, 260, 130],
      [1980, 500, 240, 220],
      [2340, 540, 220, 180],
      [2680, 460, 250, 260],
      [3010, 590, 220, 130],
      [3280, 520, 230, 200],
      [3430, 650, 160, 70]
    ],
    coins: [
      [150, 500], [430, 450], [760, 390], [1110, 470], [1420, 410],
      [1750, 500], [2050, 420], [2400, 470], [2730, 380], [3070, 500], [3360, 440]
    ],
    enemies: [
      { x: 520, y: 0, type: 'slime', dir: 1, hp: 44, size: 34, patrol: [470, 700], speed: 95 },
      { x: 1150, y: 0, type: 'bat', dir: -1, hp: 32, size: 30, patrol: [1080, 1330], speed: 115, flying: true },
      { x: 1800, y: 0, type: 'slime', dir: 1, hp: 46, size: 34, patrol: [1760, 2120], speed: 100 },
      { x: 2470, y: 0, type: 'bat', dir: 1, hp: 34, size: 30, patrol: [2360, 2860], speed: 120, flying: true },
      { x: 3080, y: 0, type: 'slime', dir: -1, hp: 48, size: 36, patrol: [3020, 3215], speed: 105 }
    ],
    boss: {
      x: 3060,
      y: 300,
      w: 110,
      h: 120,
      hp: 180,
      maxHp: 180,
      dir: -1,
      speed: 110,
      attackCooldown: 1.5,
      alive: true
    }
  }
];

const input = {
  left: false,
  right: false,
  jump: false,
  attack: false
};

const camera = { x: 0 };

const state = {
  mode: 'menu',
  score: 0,
  coins: 0,
  levelIndex: 0,
  time: 0,
  started: false
};

const player = {
  x: 80,
  y: 0,
  w: 42,
  h: 64,
  vx: 0,
  vy: 0,
  speed: 290,
  jumpForce: 630,
  onGround: false,
  face: 1,
  health: 100,
  maxHealth: 100,
  attackTimer: 0,
  attackCooldown: 0,
  invuln: 0,
  alive: true
};

const world = {
  width: 0,
  height: 720,
  groundY: 560,
  theme: 'forest',
  platforms: [],
  coins: [],
  enemies: [],
  boss: null
};

const audio = {
  ctx: null,
  gain: null,
  musicTimer: null,
  enabled: true
};

function initAudio() {
  if (!window.AudioContext && !window.webkitAudioContext) return;
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  audio.ctx = new AudioCtor();
  audio.gain = audio.ctx.createGain();
  audio.gain.gain.value = 0.08;
  audio.gain.connect(audio.ctx.destination);
}

function ensureAudio() {
  if (!audio.ctx) initAudio();
  if (audio.ctx && audio.ctx.state === 'suspended') {
    audio.ctx.resume();
  }
}

function playTone(freq, duration, type = 'square', volume = 0.12) {
  if (!audio.ctx || !audio.enabled) return;
  const osc = audio.ctx.createOscillator();
  const gain = audio.ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = volume;
  osc.connect(gain);
  gain.connect(audio.gain);
  const start = audio.ctx.currentTime;
  osc.start(start);
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.stop(start + duration);
}

function playSfx(type) {
  if (!audio.ctx) return;
  if (type === 'jump') {
    playTone(240, 0.08, 'triangle', 0.12);
    playTone(420, 0.09, 'square', 0.06);
  }
  if (type === 'coin') {
    playTone(740, 0.08, 'square', 0.12);
    playTone(980, 0.10, 'triangle', 0.09);
  }
  if (type === 'attack') {
    playTone(150, 0.06, 'sawtooth', 0.08);
    playTone(90, 0.08, 'square', 0.08);
  }
  if (type === 'hit') {
    playTone(80, 0.12, 'square', 0.12);
  }
  if (type === 'enemy') {
    playTone(220, 0.08, 'square', 0.08);
    playTone(120, 0.12, 'triangle', 0.07);
  }
  if (type === 'loss') {
    playTone(150, 0.2, 'sawtooth', 0.12);
    playTone(110, 0.35, 'square', 0.08);
  }
}

function startMusic() {
  if (!audio.ctx || audio.musicTimer) return;
  const loop = [220, 247, 293, 329, 293, 247, 220, 196];
  let i = 0;
  audio.musicTimer = setInterval(() => {
    if (state.mode !== 'playing') return;
    const freq = loop[i % loop.length];
    playTone(freq, 0.18, 'triangle', 0.06);
    playTone(freq / 2, 0.15, 'sine', 0.04);
    i += 1;
  }, 220);
}

function stopMusic() {
  if (audio.musicTimer) {
    clearInterval(audio.musicTimer);
    audio.musicTimer = null;
  }
}

function setMode(mode) {
  state.mode = mode;
  menuOverlay.classList.toggle('hidden', mode !== 'menu');
  pauseOverlay.classList.toggle('hidden', mode !== 'paused');
  gameOverOverlay.classList.toggle('hidden', mode !== 'gameover');
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function rectsIntersect(a, b) {
  return a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y;
}

function resetPlayer() {
  player.x = 80;
  player.y = world.groundY - player.h;
  player.vx = 0;
  player.vy = 0;
  player.onGround = true;
  player.face = 1;
  player.health = player.maxHealth;
  player.attackTimer = 0;
  player.attackCooldown = 0;
  player.invuln = 0;
  player.alive = true;
}

function loadLevel(index) {
  const level = LEVELS[index];
  state.levelIndex = index;
  world.width = level.worldWidth;
  world.groundY = level.groundY;
  world.theme = level.theme;
  world.platforms = level.platforms.map(([x, y, w, h]) => ({ x, y, w, h }));
  world.coins = level.coins.map(([x, y]) => ({ x, y, r: 11, collected: false }));
  world.enemies = (level.enemies || []).map((enemy) => ({
    x: enemy.x,
    y: enemy.flying ? enemy.y : world.groundY - (enemy.size || 28),
    w: enemy.size || 28,
    h: enemy.size || 28,
    type: enemy.type,
    dir: enemy.dir,
    patrol: enemy.patrol,
    speed: enemy.speed || 90,
    hp: enemy.hp,
    maxHp: enemy.hp,
    flying: !!enemy.flying,
    vx: 0,
    vy: 0,
    alive: true,
    baseY: enemy.flying ? enemy.y : world.groundY - (enemy.size || 28)
  }));

  if (level.boss) {
    world.boss = {
      x: level.boss.x,
      y: level.boss.y,
      w: level.boss.w,
      h: level.boss.h,
      hp: level.boss.hp,
      maxHp: level.boss.maxHp,
      dir: level.boss.dir,
      speed: level.boss.speed || 110,
      attackCooldown: level.boss.attackCooldown || 1.5,
      alive: true,
      vx: 0,
      vy: 0
    };
  } else {
    world.boss = null;
  }

  resetPlayer();
  camera.x = 0;
}

function startGame() {
  ensureAudio();
  startMusic();
  state.score = 0;
  state.coins = 0;
  state.levelIndex = 0;
  loadLevel(0);
  setMode('playing');
}

function togglePause() {
  if (state.mode === 'playing') {
    setMode('paused');
    stopMusic();
  } else if (state.mode === 'paused') {
    setMode('playing');
    startMusic();
  }
}

function showGameOver(victory) {
  ensureAudio();
  stopMusic();
  setMode('gameover');
  gameOverTitle.textContent = victory ? 'Victory!' : 'Game Over';
  gameOverText.textContent = victory
    ? `You defeated the Shadow Lord and scored ${state.score} points.`
    : 'The shadows were too strong this time.';
  playSfx(victory ? 'enemy' : 'loss');
}

function nextLevel() {
  if (state.levelIndex < LEVELS.length - 1) {
    const nextIndex = state.levelIndex + 1;
    loadLevel(nextIndex);
    setMode('playing');
    startMusic();
  } else {
    showGameOver(true);
  }
}

function damagePlayer(amount) {
  if (player.invuln > 0 || !player.alive) return;
  player.health -= amount;
  player.invuln = 0.7;
  playSfx('hit');
  if (player.health <= 0) {
    player.health = 0;
    player.alive = false;
    showGameOver(false);
  }
}

function handleInput() {
  if (state.mode !== 'playing') return;

  const move = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  player.vx = move * player.speed;
  if (move !== 0) player.face = move;

  if (input.jump && player.onGround) {
    player.vy = -player.jumpForce;
    player.onGround = false;
    playSfx('jump');
  }

  if (input.attack && player.attackCooldown <= 0) {
    player.attackTimer = 0.18;
    player.attackCooldown = 0.45;
    playSfx('attack');
  }
}

function updatePlayer(dt) {
  const prevX = player.x;
  const prevY = player.y;

  player.attackTimer = Math.max(0, player.attackTimer - dt);
  player.attackCooldown = Math.max(0, player.attackCooldown - dt);
  player.invuln = Math.max(0, player.invuln - dt);

  player.vy += 1600 * dt;
  player.x += player.vx * dt;
  player.y += player.vy * dt;
  player.onGround = false;

  for (const plat of world.platforms) {
    const pBox = { x: player.x, y: player.y, w: player.w, h: player.h };
    if (!rectsIntersect(pBox, plat)) continue;

    const prevBox = { x: prevX, y: prevY, w: player.w, h: player.h };
    const prevBottom = prevBox.y + prevBox.h;
    const prevTop = prevBox.y;

    if (prevBottom <= plat.y + 8 && prevY + player.h <= plat.y + 8) {
      player.y = plat.y - player.h;
      player.vy = 0;
      player.onGround = true;
    } else if (prevTop >= plat.y + plat.h - 8 && prevY >= plat.y + plat.h - 8) {
      player.y = plat.y + plat.h;
      player.vy = Math.max(0, player.vy);
    } else if (prevX + player.w <= plat.x + 12) {
      player.x = plat.x - player.w;
    } else if (prevX >= plat.x + plat.w - 12) {
      player.x = plat.x + plat.w;
    }
  }

  if (player.y >= world.groundY - player.h) {
    player.y = world.groundY - player.h;
    player.vy = 0;
    player.onGround = true;
  }

  player.x = clamp(player.x, 0, world.width - player.w);
  if (player.y > canvas.height + 250) {
    player.health = 0;
    showGameOver(false);
  }
}

function updateCoins() {
  for (const coin of world.coins) {
    if (coin.collected) continue;
    const dx = Math.abs(player.x + player.w * 0.5 - coin.x);
    const dy = Math.abs(player.y + player.h * 0.5 - coin.y);
    if (dx < 22 && dy < 22) {
      coin.collected = true;
      state.score += 10;
      state.coins += 1;
      playSfx('coin');
    }
  }
}

function updateEnemy(enemy, dt) {
  if (!enemy.alive) return;

  if (enemy.flying) {
    enemy.x += enemy.dir * enemy.speed * dt;
    enemy.y = enemy.baseY + Math.sin(state.time * 4 + enemy.x * 0.03) * 35;
    if (enemy.x < enemy.patrol[0] || enemy.x > enemy.patrol[1]) {
      enemy.dir *= -1;
    }
  } else {
    enemy.vy += 1600 * dt;
    enemy.x += enemy.dir * enemy.speed * dt;
    enemy.y += enemy.vy * dt;

    if (enemy.x < enemy.patrol[0] || enemy.x > enemy.patrol[1]) {
      enemy.dir *= -1;
    }

    if (enemy.y > world.groundY - enemy.h) {
      enemy.y = world.groundY - enemy.h;
      enemy.vy = 0;
    }
  }

  const enemyBox = { x: enemy.x, y: enemy.y, w: enemy.w, h: enemy.h };
  const playerBox = { x: player.x, y: player.y, w: player.w, h: player.h };

  if (player.attackTimer > 0) {
    const attackBox = {
      x: player.face === 1 ? player.x + player.w : player.x - 42,
      y: player.y + 10,
      w: 42,
      h: 24
    };
    if (rectsIntersect(enemyBox, attackBox)) {
      enemy.hp -= 28;
      if (enemy.hp <= 0) {
        enemy.alive = false;
        state.score += 40;
        playSfx('enemy');
      }
    }
  }

  if (rectsIntersect(enemyBox, playerBox)) {
    if (player.attackTimer > 0) {
      enemy.hp -= 12;
      if (enemy.hp <= 0) {
        enemy.alive = false;
        state.score += 40;
        playSfx('enemy');
      }
    } else {
      damagePlayer(12);
    }
  }
}

function updateBoss(dt) {
  if (!world.boss || !world.boss.alive) return;

  const boss = world.boss;
  boss.x += boss.dir * boss.speed * dt;
  if (boss.x < 2860 || boss.x > 3350) boss.dir *= -1;

  boss.attackCooldown -= dt;
  if (boss.attackCooldown <= 0) {
    boss.attackCooldown = 1.8 + Math.random() * 0.9;
    if (Math.abs(player.x - boss.x) < 520) {
      damagePlayer(18);
    }
  }

  const bossBox = { x: boss.x, y: boss.y, w: boss.w, h: boss.h };
  const playerBox = { x: player.x, y: player.y, w: player.w, h: player.h };

  if (player.attackTimer > 0) {
    const attackBox = {
      x: player.face === 1 ? player.x + player.w : player.x - 42,
      y: player.y + 10,
      w: 42,
      h: 24
    };
    if (rectsIntersect(bossBox, attackBox)) {
      boss.hp -= 18;
      if (boss.hp <= 0) {
        boss.alive = false;
        state.score += 250;
        playSfx('enemy');
        showGameOver(true);
      }
    }
  }

  if (rectsIntersect(bossBox, playerBox)) {
    if (player.attackTimer <= 0) {
      damagePlayer(18);
    }
  }
}

function updateCamera() {
  const desired = clamp(player.x - canvas.width * 0.38, 0, Math.max(0, world.width - canvas.width));
  camera.x += (desired - camera.x) * 0.14;
}

function updateWinCheck() {
  if (world.boss && !world.boss.alive) {
    return;
  }

  if (!world.boss && player.x + player.w >= world.width - 20) {
    nextLevel();
  }
}

function update(dt) {
  state.time += dt;

  if (state.mode !== 'playing') return;

  handleInput();
  updatePlayer(dt);
  updateCoins();

  for (const enemy of world.enemies) {
    updateEnemy(enemy, dt);
  }

  updateBoss(dt);
  updateCamera();
  updateWinCheck();

  if (player.health <= 0 && player.alive === false) {
    showGameOver(false);
  }
}

function drawBackground() {
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);

  if (world.theme === 'forest') {
    grad.addColorStop(0, '#76a8d6');
    grad.addColorStop(0.55, '#4a6886');
    grad.addColorStop(1, '#1b2738');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 30; i++) {
      const x = ((i * 180) - camera.x * 0.18) % (canvas.width + 200);
      const y = 35 + ((i * 73) % 120);
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.fillRect(x, y, 2, 2);
    }

    for (let i = 0; i < 16; i++) {
      const x = ((i * 200) - camera.x * 0.35) % (canvas.width + 260);
      ctx.fillStyle = '#213b4d';
      ctx.fillRect(x, 420 + (i % 4) * 20, 70, 220);
      ctx.fillStyle = '#173149';
      ctx.fillRect(x - 10, 390, 88, 26);
    }

    ctx.fillStyle = '#1a2526';
    ctx.fillRect(0, 560, canvas.width, 160);
  }

  if (world.theme === 'cave') {
    grad.addColorStop(0, '#0e1730');
    grad.addColorStop(0.45, '#1d2237');
    grad.addColorStop(1, '#090d18');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 30; i++) {
      const x = ((i * 140) - camera.x * 0.2) % (canvas.width + 200);
      const y = 36 + (i % 7) * 36;
      ctx.fillStyle = 'rgba(170, 220, 255, 0.1)';
      ctx.fillRect(x, y, 3, 3);
    }

    for (let i = 0; i < 18; i++) {
      const x = ((i * 220) - camera.x * 0.4) % (canvas.width + 260);
      ctx.fillStyle = '#121d32';
      ctx.beginPath();
      ctx.moveTo(x, 720);
      ctx.lineTo(x + 70, 350);
      ctx.lineTo(x + 140, 720);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = '#0c101b';
    ctx.fillRect(0, 560, canvas.width, 160);
  }

  if (world.theme === 'castle') {
    grad.addColorStop(0, '#4e586c');
    grad.addColorStop(0.5, '#2b2e3a');
    grad.addColorStop(1, '#171922');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 18; i++) {
      const x = ((i * 200) - camera.x * 0.15) % (canvas.width + 260);
      ctx.fillStyle = '#20212d';
      ctx.fillRect(x, 190 + (i % 3) * 30, 90, 260);
      ctx.fillStyle = '#34394a';
      ctx.fillRect(x + 16, 150, 58, 40);
      ctx.fillStyle = '#131720';
      ctx.fillRect(x + 38, 220, 12, 180);
    }

    ctx.fillStyle = '#1a1d22';
    ctx.fillRect(0, 560, canvas.width, 160);
  }
}

function drawPlatforms() {
  for (const plat of world.platforms) {
    const x = plat.x - camera.x;
    ctx.fillStyle = world.theme === 'forest' ? '#4a5a3c' : world.theme === 'cave' ? '#677b8c' : '#727780';
    ctx.fillRect(x, plat.y, plat.w, plat.h);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(x, plat.y, plat.w, 7);
  }
}

function drawCoins() {
  for (const coin of world.coins) {
    if (coin.collected) continue;
    const x = coin.x - camera.x;
    const y = coin.y;
    ctx.fillStyle = '#f5d66d';
    ctx.beginPath();
    ctx.arc(x, y, coin.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f9e9a5';
    ctx.beginPath();
    ctx.arc(x, y, coin.r * 0.55, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawEnemy(enemy) {
  if (!enemy.alive) return;
  const x = enemy.x - camera.x;

  if (enemy.flying) {
    ctx.fillStyle = '#7f8bff';
    ctx.fillRect(x, enemy.y, enemy.w, enemy.h);
    ctx.fillStyle = '#ccd2ff';
    ctx.fillRect(x + 5, enemy.y + 7, enemy.w - 10, enemy.h - 12);
    ctx.fillStyle = '#273145';
    ctx.fillRect(x + 6, enemy.y + 14, 6, 6);
    ctx.fillRect(x + enemy.w - 12, enemy.y + 14, 6, 6);
  } else {
    ctx.fillStyle = '#7b6459';
    ctx.fillRect(x, enemy.y, enemy.w, enemy.h);
    ctx.fillStyle = '#9a7d6a';
    ctx.fillRect(x + 4, enemy.y + 8, enemy.w - 8, enemy.h - 10);
    ctx.fillStyle = '#2d1f1a';
    ctx.fillRect(x + 7, enemy.y + 12, 6, 6);
    ctx.fillRect(x + enemy.w - 13, enemy.y + 12, 6, 6);
  }

  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(x - 2, enemy.y - 8, enemy.w + 4, 5);
  ctx.fillStyle = '#ff5d5d';
  ctx.fillRect(x, enemy.y - 8, enemy.w * (enemy.hp / enemy.maxHp), 5);
}

function drawBoss() {
  if (!world.boss || !world.boss.alive) return;
  const boss = world.boss;
  const x = boss.x - camera.x;

  ctx.fillStyle = '#3a2b42';
  ctx.fillRect(x, boss.y, boss.w, boss.h);
  ctx.fillStyle = '#74577d';
  ctx.fillRect(x + 14, boss.y + 18, boss.w - 28, boss.h - 30);
  ctx.fillStyle = '#1b1320';
  ctx.fillRect(x + 20, boss.y + 28, 18, 18);
  ctx.fillRect(x + boss.w - 38, boss.y + 28, 18, 18);
  ctx.fillStyle = '#f0a4b0';
  ctx.fillRect(x + 18, boss.y + 72, boss.w - 36, 14);

  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(x - 8, boss.y - 12, boss.w + 16, 6);
  ctx.fillStyle = '#ff5d5d';
  ctx.fillRect(x, boss.y - 12, boss.w * (boss.hp / boss.maxHp), 6);
}

function drawPlayer() {
  const x = player.x - camera.x;
  const y = player.y;

  const alpha = player.invuln > 0 && Math.floor(player.invuln * 12) % 2 === 0 ? 0.45 : 1;
  ctx.globalAlpha = alpha;

  ctx.fillStyle = '#1d294d';
  ctx.fillRect(x + 8, y + 8, 26, 18);
  ctx.fillStyle = '#ffd788';
  ctx.fillRect(x + 8, y + 1, 24, 15);
  ctx.fillStyle = '#1a2137';
  ctx.fillRect(x + 6, y + 20, 30, 32);

  const leftLegX = player.face === 1 ? x + 18 : x + 10;
  const rightLegX = player.face === 1 ? x + 10 : x + 18;
  ctx.fillStyle = '#0d1427';
  ctx.fillRect(leftLegX, y + 49, 8, 16);
  ctx.fillRect(rightLegX, y + 49, 8, 16);

  if (player.attackTimer > 0) {
    ctx.strokeStyle = '#f9f1bf';
    ctx.lineWidth = 6;
    ctx.beginPath();
    const pivot = player.face === 1 ? x + 32 : x + 8;
    ctx.moveTo(pivot, y + 18);
    ctx.lineTo(pivot + player.face * 24, y + 8);
    ctx.stroke();
  }

  ctx.fillStyle = '#d24f4f';
  ctx.fillRect(x - 6, y - 18, 52, 8);
  ctx.fillStyle = '#5fe29c';
  ctx.fillRect(x - 6, y - 18, 52 * (player.health / player.maxHealth), 8);

  ctx.globalAlpha = 1;
}

function drawHud() {
  ctx.fillStyle = 'rgba(17, 22, 30, 0.7)';
  ctx.fillRect(18, 18, 280, 82);

  ctx.fillStyle = '#eaf5ff';
  ctx.font = 'bold 22px Arial';
  ctx.fillText('Health', 32, 46);

  ctx.fillStyle = '#27313c';
  ctx.fillRect(32, 56, 170, 12);
  ctx.fillStyle = '#66e09a';
  ctx.fillRect(32, 56, 170 * (player.health / player.maxHealth), 12);

  ctx.fillStyle = '#f9d76d';
  ctx.font = 'bold 20px Arial';
  ctx.fillText(`Score: ${state.score}`, 220, 46);
  ctx.fillText(`Coins: ${state.coins}`, 220, 72);

  const levelInfo = `Level ${state.levelIndex + 1} / ${LEVELS.length}`;
  ctx.fillStyle = '#dfe9ff';
  ctx.fillText(levelInfo, 28, 92);
}

function draw() {
  drawBackground();
  drawPlatforms();
  drawCoins();

  for (const enemy of world.enemies) {
    drawEnemy(enemy);
  }

  drawBoss();
  drawPlayer();
  drawHud();
}

function loop(ts) {
  const dt = Math.min(0.033, (ts - (loop.lastTime || ts)) / 1000 || 0.016);
  loop.lastTime = ts;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

function bindControls() {
  window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (key === 'a' || key === 'arrowleft') input.left = true;
    if (key === 'd' || key === 'arrowright') input.right = true;
    if (key === 'w' || key === 'arrowup' || key === ' ') input.jump = true;
    if (key === 'j' || key === 'k' || key === 'enter') input.attack = true;
    if (key === 'p' && state.mode !== 'menu' && state.mode !== 'gameover') togglePause();
    if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) event.preventDefault();
  });

  window.addEventListener('keyup', (event) => {
    const key = event.key.toLowerCase();
    if (key === 'a' || key === 'arrowleft') input.left = false;
    if (key === 'd' || key === 'arrowright') input.right = false;
    if (key === 'w' || key === 'arrowup' || key === ' ') input.jump = false;
    if (key === 'j' || key === 'k' || key === 'enter') input.attack = false;
  });

  document.querySelectorAll('.btn').forEach((btn) => {
    const action = btn.dataset.action;
    const setPressed = (pressed) => {
      btn.classList.toggle('pressed', pressed);
      input[action] = pressed;
    };

    btn.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      setPressed(true);
    });

    ['pointerup', 'pointerleave', 'pointercancel'].forEach((type) => {
      btn.addEventListener(type, (event) => {
        event.preventDefault();
        setPressed(false);
      });
    });
  });

  startBtn.addEventListener('click', () => {
    ensureAudio();
    startGame();
  });

  resumeBtn.addEventListener('click', () => {
    ensureAudio();
    setMode('playing');
    startMusic();
  });

  restartBtn.addEventListener('click', () => {
    ensureAudio();
    startGame();
  });

  retryBtn.addEventListener('click', () => {
    ensureAudio();
    startGame();
  });

  window.addEventListener('pointerdown', () => {
    ensureAudio();
    startMusic();
  }, { once: true });
}

function init() {
  bindControls();
  loadLevel(0);
  setMode('menu');
  requestAnimationFrame(loop);
}

init();
