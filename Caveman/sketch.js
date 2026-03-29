let player;
let enemiesGroup;
let enemies = []; // Array to store Enemy instances for updating
let enemyImage;
let uiHudSheet = null;
let backgroundImages = {};
let currentStageBackgroundLayers = [];
let timer;
let floorManager;
let stageEnded = false;
let gameOver = false;
let stageResultText = "";
let stageNumber = 1;
let startStage2Button;
let restartButton;
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
const DEBUG_START_STAGE = null; // Set to 1, 2, 3, or 4 to jump directly into that stage.
const STAGE1_ENEMY_TYPE_KEYS = ["cell_green", "cell_blue", "cell_red", "cell_orange", "cell_purple"];
const STAGE2_ENEMY_TYPE_KEYS = ["org_green", "org_blue", "org_red", "org_orange", "org_purple"];
const STAGE3_ENEMY_TYPE_KEYS = ["fsh_green", "fsh_blue", "fsh_red", "fsh_orange", "fsh_purple"];
const STAGE4_ENEMY_TYPE_KEYS = ["rat", "rabbit", "fox", "panda", "bear"];
const PLAYER_STAGE_APPEARANCES = {
  1: { x: 0, y: 32, w: 16, h: 16 },
  2: { x: 192, y: 16, w: 16, h: 16 },
  3: { x: 256, y: 48, w: 32, h: 16 },
  4: { x: 112, y: 144, w: 32, h: 16 },
  default: { x: 0, y: 32, w: 16, h: 16 }
};
const PLAYER_STAGE_SIZE_RETAIN = 0.8;
const ENEMY_SIZE_VARIANCE = {
  1: { min: 0.8, max: 1.25 },
  2: { min: 0.85, max: 1.3 },
  3: { min: 0.7, max: 1.55 },
  4: { min: 0.65, max: 1.6 }
};

function preload() {
  // Load the image directly. We'll define the frame size in the Enemy class.
  enemyImage = loadImage("assets/primalAscentAnimations.png");
  backgroundImages = {
    3: [
      loadImage("assets/backLevelOne.png"),
      loadImage("assets/backLevelOneP2.png")
    ],
    4: [
      loadImage("assets/backLevelTwo.png"),
      loadImage("assets/backLevelTwoP2.png")
    ]
  };
  // Uncomment when your HUD sheet is ready:
  // uiHudSheet = loadImage("assets/ui-hud-sheet.png");
}

function setup() {
  new Canvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  fitCanvasDisplayToWindow();
  timer = new CountdownTimer(10000); // 10 seconds in milliseconds
  timer.start();

  enemiesGroup = new Group();
  floorManager = new Floor({ spriteSheetImage: enemyImage, platformTiles: {
    left:   { x: 0,  y: 304, w: 16, h: 16 },
    center: { x: 32,  y: 336, w: 16, h: 16 },
    right:  { x: 32, y: 304, w: 16, h: 16 }
  } });

  player = createPlayerForStage(stageNumber);
  setStageBackground(stageNumber);
  camera.zoom = CAMERA_ZOOM;
  camera.x = player.body.x;
  camera.y = player.body.y;
  createStageButtons();
  createRestartButton();

  setHUDBorderTiles(enemyImage);

  spawnEnemies(STAGE1_ENEMY_TYPE_KEYS);
  applyDebugStartStage();
}

function draw() {
  drawStageBackground();

  if (!stageEnded && !gameOver && timer.isFinished()) {
    endStage();
  }

  camera.on();

  drawWorldBounds();

  if (!stageEnded && !gameOver) {
    const activeEnemies = enemiesGroup;
    const activeFloors = stageNumber >= 4 ? floorManager?.group : null;

    player.update(activeEnemies, { minX: 0, minY: 0, maxX: WORLD_WIDTH, maxY: WORLD_HEIGHT }, activeFloors);
    checkGameOver();

    // Update each enemy instance
    if (!gameOver) {
      for (let enemy of enemies) {
        enemy.update(
          { minX: 0, minY: 0, maxX: WORLD_WIDTH, maxY: WORLD_HEIGHT },
          activeFloors
        );
      }
    }
  }

  updateCameraBounds();

  camera.off();

  drawHUD(timer.getRemainingTime() / 1000, timer.duration / 1000, uiHudSheet, enemyImage, player);

  if (gameOver) {
    drawGameOverOverlay();
    drawRestartButton();
    checkRestartButtonPresses();
  } else if (stageEnded) {
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

  if ((stageNumber === 1 || stageNumber === 2 || stageNumber === 3) && startStage2Button) {
    stageAdvanceLabel = stageNumber === 1
      ? "Enter Stage 2"
      : stageNumber === 2
        ? "Enter Stage 3"
        : "Enter Stage 4";
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

  const isStage4 = (stageNumber === 4);

  for (let i = 0; i < ENEMY_COUNT; i++) {
    const selectedType = random(typeKeys);
    const sizeVariance = getEnemySizeVariance(stageNumber);
    const sizeMultiplier = random(sizeVariance.min, sizeVariance.max);

    let ew = 16;
    let eh = 16;

    if (isStage4) {
      ew = 32;
    }

    ew = max(12, round(ew * sizeMultiplier));
    eh = max(12, round(eh * sizeMultiplier));

    let x, y;

    if (isStage4) {
      const spawnPlatforms = [
        floorManager.group[0],
        floorManager.group[1],
        floorManager.group[2],
        floorManager.group[3],
        floorManager.group[4],
      ].filter(Boolean);

      const platform = random(spawnPlatforms);
      const margin = 24;

      x = random(
        platform.x - platform.w / 2 + margin,
        platform.x + platform.w / 2 - margin
      );

      y = platform.y - platform.h / 2 - eh / 2;
    } else {
      x = random(100, WORLD_WIDTH - 100);
      y = random(100, WORLD_HEIGHT - 100);
    }

    const enemyInstance = new Enemy(x, y, ew, eh, {
      group: enemiesGroup,
      type: selectedType,
      spriteSheetImage: enemyImage,
      movementMode: isStage4 ? "platformer" : "topdown"
    });

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

function createRestartButton() {
  restartButton = {
    x: width / 2,
    y: height - 96,
    w: 220,
    h: 40,
    visible: false,
    label: "Restart Run",
    fill: "#bf4343",
    stroke: "#ffe0e0"
  };
}

function startStage2() {
  stageNumber = 2;
  setStageBackground(stageNumber);
  stageEnded = false;
  gameOver = false;
  stageResultText = "";
  clearStageFloors();
  player.reduceSizeBetweenStages(PLAYER_STAGE_SIZE_RETAIN);
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
  setStageBackground(stageNumber);
  stageEnded = false;
  gameOver = false;
  stageResultText = "";
  clearStageFloors();
  player.reduceSizeBetweenStages(PLAYER_STAGE_SIZE_RETAIN);
  player.configureForStage(stageNumber);
  player.typesConsumed = [];
  timer.reset(30000);
  timer.start();
  spawnEnemies(STAGE3_ENEMY_TYPE_KEYS);
  if (startStage2Button) {
    startStage2Button.visible = false;
  }
}

function startStage4() {
  stageNumber = 4;
  setStageBackground(stageNumber);
  stageEnded = false;
  gameOver = false;
  stageResultText = "";
  clearEnemies();
  clearStageFloors();
  buildStage4Platforms();
  player.reduceSizeBetweenStages(PLAYER_STAGE_SIZE_RETAIN);
  player.configureForStage(stageNumber);
  player.typesConsumed = [];
  player.body.x = 120;
  player.body.y = WORLD_HEIGHT - 180;
  player.body.vel.x = 0;
  player.body.vel.y = 0;
  camera.x = player.body.x;
  camera.y = player.body.y;
  timer.reset(45000);
  timer.start();
  spawnEnemies(STAGE4_ENEMY_TYPE_KEYS);
  if (startStage2Button) {
    startStage2Button.visible = false;
  }
}

function applyDebugStartStage() {
  if (DEBUG_START_STAGE == null || DEBUG_START_STAGE === 1) return;

  if (DEBUG_START_STAGE === 2) {
    startStage2();
    return;
  }

  if (DEBUG_START_STAGE === 3) {
    startStage3();
    return;
  }

  if (DEBUG_START_STAGE === 4) {
    startStage4();
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

function drawRestartButton() {
  if (!restartButton || !restartButton.visible) return;

  push();
  restartButton.x = width / 2;
  restartButton.y = height - 96;

  rectMode(CENTER);
  stroke(restartButton.stroke);
  strokeWeight(2);
  fill(isRestartButtonHovered() ? "#d45454" : restartButton.fill);
  rect(restartButton.x, restartButton.y, restartButton.w, restartButton.h, 10);

  noStroke();
  textAlign(CENTER, CENTER);
  textSize(18);
  fill(255);
  text(restartButton.label, restartButton.x, restartButton.y + 1);
  pop();
}

function checkStageButtonPresses() {
  if (!startStage2Button || !startStage2Button.visible) return;
  if (stageNumber !== 1 && stageNumber !== 2 && stageNumber !== 3) return;

  if (mouse.presses() && isStageButtonHovered()) {
    if (stageNumber === 1) startStage2();
    else if (stageNumber === 2) startStage3();
    else if (stageNumber === 3) startStage4();
  }
}

function checkRestartButtonPresses() {
  if (!restartButton || !restartButton.visible) return;

  if (mouse.presses() && isRestartButtonHovered()) {
    restartGame();
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

function isRestartButtonHovered() {
  if (!restartButton?.visible) return false;

  const halfW = restartButton.w / 2;
  const halfH = restartButton.h / 2;
  return (
    mouseX >= restartButton.x - halfW &&
    mouseX <= restartButton.x + halfW &&
    mouseY >= restartButton.y - halfH &&
    mouseY <= restartButton.y + halfH
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

function clearStageFloors() {
  if (!floorManager?.group) return;

  for (const platform of floorManager.group) {
    if (platform && !platform.removed) {
      platform.remove();
    }
  }
}

function buildStage4Platforms() {
  if (!floorManager) return;
  const platformDrop = 90;

  floorManager.add(WORLD_WIDTH / 2, WORLD_HEIGHT - 18, WORLD_WIDTH, 36);
  floorManager.add(330, WORLD_HEIGHT - 150 + platformDrop, 220, 20);
  floorManager.add(620, WORLD_HEIGHT - 260 + platformDrop, 180, 20);
  floorManager.add(960, WORLD_HEIGHT - 360 + platformDrop, 240, 20);
  floorManager.add(1320, WORLD_HEIGHT - 250 + platformDrop, 170, 20);
  floorManager.add(1620, WORLD_HEIGHT - 140 + platformDrop, 260, 20);
  floorManager.add(1940, WORLD_HEIGHT - 300 + platformDrop, 180, 20);
  floorManager.add(2260, WORLD_HEIGHT - 420 + platformDrop, 240, 20);
  floorManager.add(2580, WORLD_HEIGHT - 220 + platformDrop, 220, 20);
}

function setStageBackground(stage) {
  currentStageBackgroundLayers = backgroundImages[stage] ?? [];
}

function drawStageBackground() {
  background("#555555");

  if (!currentStageBackgroundLayers.length) return;

  push();
  imageMode(CORNER);
  noSmooth();

  for (const layer of currentStageBackgroundLayers) {
    if (!layer) continue;
    image(layer, 0, 0, width, height);
  }

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

function getEnemySizeVariance(stage) {
  return ENEMY_SIZE_VARIANCE[stage] ?? { min: 0.9, max: 1.1 };
}

function createPlayerForStage(stage) {
  const nextPlayer = new Player(120, 260, 16, 24, {
    spriteSheetImage: enemyImage,
    stageAppearances: PLAYER_STAGE_APPEARANCES
  });
  nextPlayer.configureForStage(stage);
  return nextPlayer;
}

function checkGameOver() {
  if (!player || gameOver || player.health > 0) return;

  gameOver = true;
  stageEnded = false;
  timer.pause();
  stageResultText = `Game Over |\n Stage ${stageNumber} failed |\n Click restart to try again`;

  if (startStage2Button) {
    startStage2Button.visible = false;
  }

  if (restartButton) {
    restartButton.visible = true;
  }
}

function drawGameOverOverlay() {
  push();
  noStroke();
  fill(40, 0, 0, 185);
  rect(0, 0, width, height);

  textAlign(CENTER, CENTER);
  fill(255);
  textSize(36);
  text("Game Over", width / 2, height / 2 - 44);

  textSize(22);
  text(`Reached 0 HP on Stage ${stageNumber}`, width / 2, height / 2);

  textSize(18);
  text("Press restart to begin again", width / 2, height / 2 + 36);
  pop();
}

function restartGame() {
  gameOver = false;
  stageEnded = false;
  stageResultText = "";
  stageNumber = 1;
  setStageBackground(stageNumber);
  clearEnemies();
  clearStageFloors();

  if (player?.body && !player.body.removed) {
    player.body.remove();
  }

  player = createPlayerForStage(stageNumber);
  camera.x = player.body.x;
  camera.y = player.body.y;
  timer.reset(10000);
  timer.start();
  spawnEnemies(STAGE1_ENEMY_TYPE_KEYS);

  if (startStage2Button) {
    startStage2Button.visible = false;
    startStage2Button.label = "Enter Stage 2";
  }

  if (restartButton) {
    restartButton.visible = false;
  }
}
