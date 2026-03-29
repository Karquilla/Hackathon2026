let player;
let enemiesGroup;
let enemies = []; // Array to store Enemy instances for updating
let enemyImage;
let uiHudSheet = null;
let timer;
let stageEnded = false;
let stageResultText = "";
let stageNumber = 1;
let startStage2Button;
let stageAdvanceLabel = "";

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;
const WORLD_WIDTH = 2800;
const WORLD_HEIGHT = 1800;
const CANVAS_PADDING = 16;
const ENEMY_COUNT = 40;
const CAMERA_ZOOM = 1.8;
const CAMERA_EDGE_BUFFER_X = 170;
const CAMERA_EDGE_BUFFER_Y = 110;
const STAGE1_ENEMY_TYPE_KEYS = ["cell_green", "cell_blue", "cell_red", "cell_orange", "cell_purple"];
const STAGE2_ENEMY_TYPE_KEYS = ["org_green", "org_blue", "org_red", "org_orange", "org_purple"];
const STAGE3_ENEMY_TYPE_KEYS = ["fsh_green", "fsh_blue", "fsh_red", "fsh_orange", "fsh_purple"];

function preload() {
  // Load the image directly. We'll define the frame size in the Enemy class.
  enemyImage = loadImage("assets/spriteSheet.png");
  // Uncomment when your HUD sheet is ready:
  // uiHudSheet = loadImage("assets/ui-hud-sheet.png");
}

function setup() {
  new Canvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  fitCanvasDisplayToWindow();
  timer = new CountdownTimer(10000); // 10 seconds in milliseconds
  timer.start();

  enemiesGroup = new Group();

  player = new Player(120, 260, 16, 24);
  player.configureForStage(stageNumber);
  camera.zoom = CAMERA_ZOOM;
  camera.x = player.body.x;
  camera.y = player.body.y;
  createStageButtons();

  // Uncomment and set frame coordinates when your HUD sheet is ready.
  // setHUDTileSheet(uiHudSheet, {
  //   tileWidth: 16,
  //   tileHeight: 16,
  //   animFps: 8,
  //   bgFrames: [{ x: 0, y: 0 }, { x: 1, y: 0 }],
  //   fillFrames: [{ x: 0, y: 1 }, { x: 1, y: 1 }]
  // });
  // Use border tile coordinates configured in UI.js.
  setHUDBorderTiles(enemyImage);

  spawnEnemies(STAGE1_ENEMY_TYPE_KEYS);
}

function draw() {
  background("#555555");

  if (!stageEnded && timer.isFinished()) {
    endStage();
  }

  camera.on();

  drawWorldBounds();

  if (!stageEnded) {
    player.update(enemiesGroup, { minX: 0, minY: 0, maxX: WORLD_WIDTH, maxY: WORLD_HEIGHT });

    // Update each enemy instance
    for (let enemy of enemies) {
      enemy.update({ minX: 0, minY: 0, maxX: WORLD_WIDTH, maxY: WORLD_HEIGHT });
    }
  }

  updateCameraBounds();

  camera.off();

  drawHUD(timer.getRemainingTime() / 1000, timer.duration / 1000, uiHudSheet, enemyImage);

  if (stageEnded) {
    drawStageEndOverlay();
    drawStageButtons();
    checkStageButtonPresses();
  }

}

function windowResized() {
  fitCanvasDisplayToWindow();
}

function fitCanvasDisplayToWindow() {
  const availableWidth = max(320, windowWidth - CANVAS_PADDING * 2);
  const availableHeight = max(180, windowHeight - CANVAS_PADDING * 2);
  const scale = min(availableWidth / width, availableHeight / height);
  const displayWidth = floor(width * scale);
  const displayHeight = floor(height * scale);
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
    stageResultText = `Stage ${stageNumber} Over |\n no evolution (nothing consumed)`;
  } else {
    const typeSummary = Object.entries(evolutionResult.counts)
      .map(([type, count]) => `${type}:${count}`)
      .join(" ");
    const bonusSummary = formatEvolutionBonuses(evolutionResult.bonuses);

    stageResultText = `Stage ${stageNumber} Over |\n ${typeSummary} |\n ${bonusSummary}`;
  }

  if ((stageNumber === 1 || stageNumber === 2) && startStage2Button) {
    stageAdvanceLabel = stageNumber === 1 ? "Enter Stage 2" : "Enter Stage 3";
    startStage2Button.visible = true;
    startStage2Button.label = stageAdvanceLabel;
  }
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

function spawnEnemies(typeKeys) {
  clearEnemies();

  for (let i = 0; i < ENEMY_COUNT; i++) {
    const selectedType = random(typeKeys);
    const enemyInstance = new Enemy(
      random(100, WORLD_WIDTH - 100),
      random(100, WORLD_HEIGHT - 100),
      16, 16,
      {
        group: enemiesGroup,
        type: selectedType,
        spriteSheetImage: enemyImage
      }
    );
    enemies.push(enemyInstance);
  }
}

function clearEnemies() {
  for (const enemy of enemies) {
    if (enemy?.body && !enemy.body.removed) {
      enemy.body.remove();
    }
  }
  enemies = [];
}

function createStageButtons() {
  startStage2Button = {
    x: width / 2,
    y: height - 42,
    w: 220,
    h: 40,
    visible: false,
    label: "Enter Stage 2",
    fill: "#2a9d8f",
    stroke: "#d9fff8"
  };
}

function startStage2() {
  stageNumber = 2;
  stageEnded = false;
  stageResultText = "";
  player.configureForStage(stageNumber);
  player.typesConsumed = [];
  timer.reset(30000);
  timer.start();
  spawnEnemies(STAGE2_ENEMY_TYPE_KEYS);
  if (startStage2Button) {
    startStage2Button.visible = false;
  }
}

function startStage3() {
  stageNumber = 3;
  stageEnded = false;
  stageResultText = "";
  player.configureForStage(stageNumber);
  player.typesConsumed = [];
  timer.reset(30000);
  timer.start();
  spawnEnemies(STAGE3_ENEMY_TYPE_KEYS);
  if (startStage2Button) {
    startStage2Button.visible = false;
  }
}

function drawStageButtons() {
  if (!startStage2Button || !startStage2Button.visible) return;

  push();
  startStage2Button.x = width / 2;
  startStage2Button.y = height - 42;

  rectMode(CENTER);
  stroke(startStage2Button.stroke);
  strokeWeight(2);
  fill(isStageButtonHovered() ? "#33b8a7" : startStage2Button.fill);
  rect(startStage2Button.x, startStage2Button.y, startStage2Button.w, startStage2Button.h, 10);

  noStroke();
  textAlign(CENTER, CENTER);
  textSize(18);
  fill(255);
  text(startStage2Button.label || stageAdvanceLabel || "Enter Stage", startStage2Button.x, startStage2Button.y + 1);
  pop();
}

function checkStageButtonPresses() {
  if (!startStage2Button || !startStage2Button.visible) return;
  if (stageNumber !== 1 && stageNumber !== 2) return;

  if (mouse.presses() && isStageButtonHovered()) {
    if (stageNumber === 1) startStage2();
    else if (stageNumber === 2) startStage3();
  }
}

function isStageButtonHovered() {
  if (!startStage2Button?.visible) return false;

  const halfW = startStage2Button.w / 2;
  const halfH = startStage2Button.h / 2;
  return (
    mouseX >= startStage2Button.x - halfW &&
    mouseX <= startStage2Button.x + halfW &&
    mouseY >= startStage2Button.y - halfH &&
    mouseY <= startStage2Button.y + halfH
  );
}

function updateCameraBounds() {
  if (!player?.body) return;

  const halfViewWidth = width / (2 * camera.zoom);
  const halfViewHeight = height / (2 * camera.zoom);
  const minCameraX = halfViewWidth;
  const maxCameraX = max(halfViewWidth, WORLD_WIDTH - halfViewWidth);
  const minCameraY = halfViewHeight;
  const maxCameraY = max(halfViewHeight, WORLD_HEIGHT - halfViewHeight);
  const edgeBufferX = min(CAMERA_EDGE_BUFFER_X, halfViewWidth - 16);
  const edgeBufferY = min(CAMERA_EDGE_BUFFER_Y, halfViewHeight - 16);

  let nextCameraX = camera.x;
  let nextCameraY = camera.y;
  const playerX = player.body.x;
  const playerY = player.body.y;

  const leftEdge = camera.x - halfViewWidth + edgeBufferX;
  const rightEdge = camera.x + halfViewWidth - edgeBufferX;
  const topEdge = camera.y - halfViewHeight + edgeBufferY;
  const bottomEdge = camera.y + halfViewHeight - edgeBufferY;

  if (playerX < leftEdge) nextCameraX -= leftEdge - playerX;
  if (playerX > rightEdge) nextCameraX += playerX - rightEdge;
  if (playerY < topEdge) nextCameraY -= topEdge - playerY;
  if (playerY > bottomEdge) nextCameraY += playerY - bottomEdge;

  camera.x = constrain(nextCameraX, minCameraX, maxCameraX);
  camera.y = constrain(nextCameraY, minCameraY, maxCameraY);
}

function drawWorldBounds() {
  push();
  rectMode(CORNER);
  noFill();
  stroke("#2a2016");
  strokeWeight(8);
  rect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  pop();
}

function formatEvolutionBonuses(bonuses) {
  const summary = [];

  if (bonuses.health) summary.push(`+${formatBonusValue(bonuses.health)} HP`);
  if (bonuses.rangeShots) summary.push(`+${formatBonusValue(bonuses.rangeShots)} RangeShots`);
  if (bonuses.speed) summary.push(`+${formatBonusValue(bonuses.speed)} Speed`);
  if (bonuses.grapplePull) summary.push(`+${formatBonusValue(bonuses.grapplePull)} GrapplePull`);
  if (bonuses.cooldownReductionMs) summary.push(`-${formatBonusValue(bonuses.cooldownReductionMs)}ms Cooldown`);

  return summary.length ? summary.join("  ") : "No bonuses gained";
}

function formatBonusValue(value) {
  return Number.isInteger(value) ? value : value.toFixed(2);
}
