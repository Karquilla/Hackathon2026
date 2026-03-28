let player;
let enemiesGroup;
let enemies = []; // Array to store Enemy instances for updating

const BASE_WIDTH = 720;
const BASE_HEIGHT = 480;
const CANVAS_PADDING = 16;
const ENEMY_COUNT = 10;


function setup() {
  new Canvas(BASE_WIDTH, BASE_HEIGHT);
  fitCanvasDisplayToWindow();

  enemiesGroup = new Group();

  player = new Player(120, 260, 36, 48);

  for (let i = 0; i < ENEMY_COUNT; i++) {
    let enemyInstance = new Enemy(
      random(100, BASE_WIDTH - 100), 
      random(100, BASE_HEIGHT - 100), 
      20, 20, 
      { group: enemiesGroup, health: 10, damage: 3, speed: random(1, 3) }
    );
    enemies.push(enemyInstance);
  }
}

function draw() {
  background("#555555");
  player.move();

  // Update each enemy instance
  for (let enemy of enemies) {
    enemy.update();
  }

  camera.x = width / 2;
  camera.y = height / 2;
}

function windowResized() {
  fitCanvasDisplayToWindow();
}

function fitCanvasDisplayToWindow() {
  const availableWidth = max(320, windowWidth - CANVAS_PADDING * 2);
  const availableHeight = max(180, windowHeight - CANVAS_PADDING * 2);
  const scale = min(availableWidth / BASE_WIDTH, availableHeight / BASE_HEIGHT);
  const displayWidth = floor(BASE_WIDTH * scale);
  const displayHeight = floor(BASE_HEIGHT * scale);
  const canvasEl = document.querySelector("canvas");
  if (!canvasEl) return;

  // Keep gameplay/world units fixed and only scale visual size.
  canvasEl.style.width = `${displayWidth}px`;
  canvasEl.style.height = `${displayHeight}px`;
}