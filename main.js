 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/main.js b/main.js
new file mode 100644
index 0000000000000000000000000000000000000000..fd9e65cc86ad13112cdf22ddff7faeb705b05bd1
--- /dev/null
+++ b/main.js
@@ -0,0 +1,258 @@
+const canvas = document.getElementById("game");
+const ctx = canvas.getContext("2d");
+
+const ui = {
+  lives: document.getElementById("lives"),
+  score: document.getElementById("score"),
+  status: document.getElementById("status"),
+  restart: document.getElementById("restart"),
+};
+
+const WIDTH = canvas.width;
+const HEIGHT = canvas.height;
+
+const player = {
+  x: WIDTH / 2,
+  y: HEIGHT - 70,
+  w: 42,
+  h: 52,
+  speed: 320,
+  cooldown: 0,
+};
+
+let bullets = [];
+let enemies = [];
+let stars = [];
+let score = 0;
+let lives = 3;
+let playing = true;
+let lastTime = performance.now();
+
+const input = { left: false, right: false, shoot: false };
+
+function createStars() {
+  stars = Array.from({ length: 120 }, () => ({
+    x: Math.random() * WIDTH,
+    y: Math.random() * HEIGHT,
+    size: Math.random() * 2 + 1,
+    speed: Math.random() * 40 + 20,
+  }));
+}
+
+function spawnEnemy() {
+  const size = Math.random() * 20 + 26;
+  enemies.push({
+    x: Math.random() * (WIDTH - size * 2) + size,
+    y: -size,
+    size,
+    speed: Math.random() * 40 + 60,
+    hp: 2,
+    wobbleOffset: Math.random() * Math.PI * 2,
+  });
+}
+
+function resetGame() {
+  bullets = [];
+  enemies = [];
+  score = 0;
+  lives = 3;
+  playing = true;
+  player.x = WIDTH / 2;
+  player.cooldown = 0;
+  createStars();
+  ui.status.textContent = "Hazır";
+}
+
+function handleInput(delta) {
+  const direction = (input.right ? 1 : 0) - (input.left ? 1 : 0);
+  player.x += direction * player.speed * delta;
+  player.x = Math.max(player.w / 2 + 8, Math.min(WIDTH - player.w / 2 - 8, player.x));
+
+  if (input.shoot && player.cooldown <= 0 && playing) {
+    bullets.push({ x: player.x, y: player.y - player.h / 2, speed: 520, active: true });
+    player.cooldown = 0.25;
+  }
+}
+
+function updateBullets(delta) {
+  bullets.forEach((b) => {
+    b.y -= b.speed * delta;
+    if (b.y < -20) b.active = false;
+  });
+  bullets = bullets.filter((b) => b.active);
+}
+
+function updateEnemies(delta) {
+  enemies.forEach((e, i) => {
+    e.y += e.speed * delta;
+    e.x += Math.sin(performance.now() / 500 + e.wobbleOffset) * 40 * delta;
+    if (e.y - e.size > HEIGHT) {
+      enemies.splice(i, 1);
+      loseLife();
+    }
+  });
+}
+
+function updateStars(delta) {
+  stars.forEach((s) => {
+    s.y += s.speed * delta;
+    if (s.y > HEIGHT) s.y = 0;
+  });
+}
+
+function collisionDetection() {
+  enemies.forEach((enemy) => {
+    bullets.forEach((bullet) => {
+      if (
+        bullet.active &&
+        enemy.hp > 0 &&
+        bullet.x > enemy.x - enemy.size &&
+        bullet.x < enemy.x + enemy.size &&
+        bullet.y > enemy.y - enemy.size &&
+        bullet.y < enemy.y + enemy.size
+      ) {
+        bullet.active = false;
+        enemy.hp -= 1;
+        score += 50;
+      }
+    });
+  });
+
+  enemies = enemies.filter((e) => e.hp > 0);
+}
+
+function loseLife() {
+  if (!playing) return;
+  lives -= 1;
+  ui.status.textContent = lives > 0 ? "Çarpışma!" : "Oyun bitti";
+  if (lives <= 0) {
+    playing = false;
+  }
+}
+
+function enemyHitsPlayer() {
+  enemies.forEach((e) => {
+    const dx = Math.abs(e.x - player.x);
+    const dy = Math.abs(e.y - player.y);
+    if (dx < e.size + player.w / 2 && dy < e.size + player.h / 2) {
+      e.hp = 0;
+      loseLife();
+    }
+  });
+  enemies = enemies.filter((e) => e.hp > 0);
+}
+
+function drawStars() {
+  ctx.fillStyle = "white";
+  stars.forEach((s) => {
+    ctx.globalAlpha = 0.4 + s.size * 0.1;
+    ctx.beginPath();
+    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
+    ctx.fill();
+  });
+  ctx.globalAlpha = 1;
+}
+
+function drawPlayer() {
+  ctx.save();
+  ctx.translate(player.x, player.y);
+  ctx.fillStyle = "#4fd1c5";
+  ctx.beginPath();
+  ctx.moveTo(0, -player.h / 2);
+  ctx.lineTo(player.w / 2, player.h / 2);
+  ctx.lineTo(0, player.h / 4);
+  ctx.lineTo(-player.w / 2, player.h / 2);
+  ctx.closePath();
+  ctx.fill();
+
+  ctx.fillStyle = "#0b1b2f";
+  ctx.fillRect(-6, -2, 12, 8);
+  ctx.restore();
+}
+
+function drawBullets() {
+  ctx.fillStyle = "#fbd38d";
+  bullets.forEach((b) => {
+    ctx.beginPath();
+    ctx.roundRect(b.x - 3, b.y - 10, 6, 18, 3);
+    ctx.fill();
+  });
+}
+
+function drawEnemies() {
+  enemies.forEach((e) => {
+    ctx.save();
+    ctx.translate(e.x, e.y);
+    ctx.fillStyle = "#f56565";
+    ctx.beginPath();
+    ctx.arc(0, 0, e.size, 0, Math.PI * 2);
+    ctx.fill();
+
+    ctx.strokeStyle = "rgba(255,255,255,0.2)";
+    ctx.lineWidth = 2;
+    ctx.beginPath();
+    ctx.arc(0, 0, e.size + 6, 0, Math.PI * 2);
+    ctx.stroke();
+    ctx.restore();
+  });
+}
+
+function drawHUD() {
+  ui.lives.textContent = lives.toString();
+  ui.score.textContent = score.toString();
+  ui.status.textContent = playing ? ui.status.textContent : "Oyun bitti";
+}
+
+function draw() {
+  ctx.clearRect(0, 0, WIDTH, HEIGHT);
+  drawStars();
+  drawEnemies();
+  drawPlayer();
+  drawBullets();
+}
+
+function update(delta) {
+  if (playing) {
+    handleInput(delta);
+    updateBullets(delta);
+    updateEnemies(delta);
+    updateStars(delta);
+    collisionDetection();
+    enemyHitsPlayer();
+
+    if (Math.random() < 0.02) {
+      spawnEnemy();
+    }
+
+    player.cooldown = Math.max(0, player.cooldown - delta);
+  }
+
+  draw();
+  drawHUD();
+}
+
+function loop(timestamp) {
+  const delta = Math.min((timestamp - lastTime) / 1000, 0.033);
+  lastTime = timestamp;
+  update(delta);
+  requestAnimationFrame(loop);
+}
+
+function keyHandler(key, isDown) {
+  if (key === "ArrowLeft" || key === "a") input.left = isDown;
+  if (key === "ArrowRight" || key === "d") input.right = isDown;
+  if (key === " ") input.shoot = isDown;
+}
+
+window.addEventListener("keydown", (e) => {
+  keyHandler(e.key.toLowerCase(), true);
+});
+
+window.addEventListener("keyup", (e) => {
+  keyHandler(e.key.toLowerCase(), false);
+});
+
+ui.restart.addEventListener("click", resetGame);
+
+resetGame();
+requestAnimationFrame(loop);
 
EOF
)
