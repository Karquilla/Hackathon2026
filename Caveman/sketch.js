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

const BASE_WIDTH = 720;
const BASE_HEIGHT = 480;
const CANVAS_PADDING = 16;
const ENEMY_COUNT = 10;
const STAGE1_ENEMY_TYPE_KEYS = ["cell_green", "cell_blue", "cell_red", "cell_orange", "cell_purple"];
const STAGE2_ENEMY_TYPE_KEYS = ["org_green", "org_blue", "org_red", "org_orange", "org_purple"];

function preload() {
  // Load the image directly. We'll define the frame size in the Enemy class.
  enemyImage = loadImage("assets/spriteSheet.png");
  // Uncomment when your HUD sheet is ready:
  // uiHudSheet = loadImage("assets/ui-hud-sheet.png");
}

function setup() {
  new Canvas(BASE_WIDTH, BASE_HEIGHT);
  fitCanvasDisplayToWindow();
  timer = new CountdownTimer(10000); // 10 seconds in milliseconds
  timer.start();

  enemiesGroup = new Group();

  player = new Player(120, 260, 36, 48);
  createStageButtons();

  // Uncomment and set frame coordinates when your HUD sheet is ready.
  // setHUDTileSheet(uiHudSheet, {
  //   tileWidth: 16,
  //   tileHeight: 16,
  //   animFps: 8,
  //   bgFrames: [{ x: 0, y: 0 }, { x: 1, y: 0 }],
  //   fillFrames: [{ x: 0, y: 1 }, { x: 1, y: 1 }]
  // });

  spawnEnemies(STAGE1_ENEMY_TYPE_KEYS);
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

  drawHUD(timer.getRemainingTime() / 1000, uiHudSheet);

  if (stageEnded) {
    drawStageEndOverlay();
    drawStageButtons();
    checkStageButtonPresses();
  }

  camera.x = width / 2;
  camera.y = height / 2;
  //console.log(player.typesConsumedd);
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

  stageResultText = `Stage ${stageNumber} Over |\n ${typeSummary} |\n ${bonusSummary}`;

  if (stageNumber === 1 && startStage2Button) {
    startStage2Button.visible = true;
    startStage2Button.collider = "static";
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
      random(100, BASE_WIDTH - 100),
      random(100, BASE_HEIGHT - 100),
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
  startStage2Button = new Sprite(width / 2, height - 42, 220, 40, "static");
  startStage2Button.color = "#2a9d8f";
  startStage2Button.stroke = "#d9fff8";
  startStage2Button.visible = false;
  startStage2Button.collider = "none";
  startStage2Button.layer = 1000;
  startStage2Button.text = "Enter Stage 2";

}

function startStage2() {
  stageNumber = 2;
  stageEnded = false;
  stageResultText = "";
  player.typesConsumed = [];
  timer.reset(30000);
  timer.start();
  spawnEnemies(STAGE2_ENEMY_TYPE_KEYS);
  if (startStage2Button) {
    startStage2Button.visible = false;
    startStage2Button.collider = "none";
  }
}

function drawStageButtons() {
  if (!startStage2Button || !startStage2Button.visible) return;

  push();
  textAlign(CENTER, CENTER);
  textSize(18);
  fill(255);
  text("Enter Stage 2", startStage2Button.x, startStage2Button.y + 1);
  pop();
}

function checkStageButtonPresses() {
  if (!startStage2Button || !startStage2Button.visible) return;
  if (stageNumber !== 1) return;

  // p5play input check on sprite button.
  if (startStage2Button.mouse.pressed("left")) {
    startStage2();
  }
}
