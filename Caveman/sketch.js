let player;
let enemiesGroup;
let enemies = []; // Array to store Enemy instances for updating
let enemyImage;
let timer;
let stageEnded = false;
let stageResultText = "";

const BASE_WIDTH = 720;
const BASE_HEIGHT = 480;
const CANVAS_PADDING = 16;
const ENEMY_COUNT = 10;

function preload() {
  // Load the image directly. We'll define the frame size in the Enemy class.
  enemyImage = loadImage("assets/spriteSheet-export.png");
}

function setup() {
  new Canvas(BASE_WIDTH, BASE_HEIGHT);
  fitCanvasDisplayToWindow();
  timer = new CountdownTimer(30000); // 30 seconds in milliseconds
  timer.start();

  enemiesGroup = new Group();

  player = new Player(120, 260, 36, 48);

  for (let i = 0; i < ENEMY_COUNT; i++) {
    let enemyInstance = new Enemy(
      random(100, BASE_WIDTH - 100), 
      random(100, BASE_HEIGHT - 100), 
      16, 16, 
      { 
        group: enemiesGroup, 
        health: 10, 
        damage: 3, 
        speed: random(1, 3),
        spriteSheetImage: enemyImage
      }
    );
    enemies.push(enemyInstance);
  }
}

function draw() {
  background("#555555");

  if (!stageEnded && timer.isFinished()) {
    endStage();
  }

  camera.on();

  if (!stageEnded) {
    player.update(enemiesGroup);

    // Update each enemy instance
    for (let enemy of enemies) {
      enemy.update();
    }
  }

  camera.off();

  drawHUD(timer.getRemainingTime() / 1000);

  if (stageEnded) {
    drawStageEndOverlay();
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

function endStage() {
  stageEnded = true;
  timer.pause();

  const evolutionResult = player.evolveFromConsumedTypes();
  if (!evolutionResult.evolved) {
    stageResultText = "Stage Over: no evolution (nothing consumed)";
    return;
  }

  const typeSummary = Object.entries(evolutionResult.counts)
    .map(([type, count]) => `${type}:${count}`)
    .join(" ");
  const bonusSummary = `+${evolutionResult.bonuses.health} HP  +${evolutionResult.bonuses.rangeShots} RangeShots  +${evolutionResult.bonuses.speed} Speed`;

  stageResultText = `Stage Over | ${typeSummary} | ${bonusSummary}`;
}

function drawStageEndOverlay() {
  push();
  noStroke();
  fill(0, 0, 0, 170);
  rect(0, 0, width, height);

  textAlign(CENTER, CENTER);
  textSize(28);
  fill(255);
  text(stageResultText, width / 2, height / 2);
  pop();
}
