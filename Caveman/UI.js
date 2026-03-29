let hudPlaceholderTileSheet = null;
let hudTileSheet = null;
let hudTileWidth = 8;
let hudTileHeight = 8;
let hudAnimFps = 8;
let hudBgFrames = [{ x: 0, y: 0 }];
let hudFillFrames = [{ x: 1, y: 0 }];
let hudBorderSheet = null;
let hudBorderConfig = {
  tileWidth: 16,
  tileHeight: 16,
  coordMode: "pixel",
  scale: 1.35,
  midRepeats: 6,
  left: { x: 160, y: 304 },
  mid: { x: 176, y: 304 },
  right: { x: 190, y: 304 }
};

function setHUDTileSheet(sheet, options = {}) {
  hudTileSheet = sheet;
  hudTileWidth = options.tileWidth ?? hudTileWidth;
  hudTileHeight = options.tileHeight ?? hudTileHeight;
  hudAnimFps = options.animFps ?? hudAnimFps;
  hudBgFrames = options.bgFrames ?? hudBgFrames;
  hudFillFrames = options.fillFrames ?? hudFillFrames;
}

function setHUDAnimation(options = {}) {
  hudAnimFps = options.animFps ?? hudAnimFps;
  hudBgFrames = options.bgFrames ?? hudBgFrames;
  hudFillFrames = options.fillFrames ?? hudFillFrames;
}

function setHUDBorderTiles(sheet, options = {}) {
  hudBorderSheet = sheet;
  hudBorderConfig.tileWidth = options.tileWidth ?? hudBorderConfig.tileWidth;
  hudBorderConfig.tileHeight = options.tileHeight ?? hudBorderConfig.tileHeight;
  hudBorderConfig.coordMode = options.coordMode ?? hudBorderConfig.coordMode;
  hudBorderConfig.scale = options.scale ?? hudBorderConfig.scale;
  hudBorderConfig.midRepeats = options.midRepeats ?? hudBorderConfig.midRepeats;
  hudBorderConfig.left = options.left ?? hudBorderConfig.left;
  hudBorderConfig.mid = options.mid ?? hudBorderConfig.mid;
  hudBorderConfig.right = options.right ?? hudBorderConfig.right;
}

function getAnimatedFrame(frames, fps) {
  const safeFrames = frames && frames.length ? frames : [{ x: 0, y: 0 }];
  const frameDuration = max(1, floor(60 / max(1, fps)));
  const frameIndex = floor(frameCount / frameDuration) % safeFrames.length;
  return safeFrames[frameIndex];
}

function drawHUD(time, maxTime, uiTileSheet = null, borderSheet = null, player = null) {
  fill(0);
  textSize(24);
  text(`Time to Evolve: ${time}`, 20, 30);

  const barX = 20;
  const barY = 50;
  const barW = 200;
  const barH = 20;
  const safeMaxTime = max(0.001, maxTime);
  const progress = constrain(time / safeMaxTime, 0, 1);
  const innerPadding = 2;
  const innerX = barX + innerPadding;
  const innerY = barY + innerPadding;
  const innerW = barW - innerPadding * 2;
  const innerH = barH - innerPadding * 2;
  const fillW = innerW * progress;
  const tileSheet = uiTileSheet ?? hudTileSheet ?? getPlaceholderHudTileSheet();
  const tileW = hudTileWidth;
  const tileH = hudTileHeight;
  const bgFrame = getAnimatedFrame(hudBgFrames, hudAnimFps);
  const fillFrame = getAnimatedFrame(hudFillFrames, hudAnimFps);
  const bgSourceX = bgFrame.x * tileW;
  const bgSourceY = bgFrame.y * tileH;
  const fillSourceX = fillFrame.x * tileW;
  const fillSourceY = fillFrame.y * tileH;
  const tilesAcross = ceil(innerW / tileW);

  for (let i = 0; i < tilesAcross; i++) {
    const dx = innerX + i * tileW;
    const drawW = min(tileW, innerW - i * tileW);
    if (drawW <= 0) break;

    image(tileSheet, dx, innerY, drawW, innerH, bgSourceX, bgSourceY, drawW, tileH);
  }

  for (let i = 0; i < tilesAcross; i++) {
    const dx = innerX + i * tileW;
    const drawnBefore = i * tileW;
    const drawW = min(tileW, fillW - drawnBefore);
    if (drawW <= 0) break;

    image(tileSheet, dx, innerY, drawW, innerH, fillSourceX, fillSourceY, drawW, tileH);
  }

  const activeBorderSheet = borderSheet ?? hudBorderSheet;
  drawHUDBorder(barX, barY, barW, barH, activeBorderSheet);

  if (player) {
    drawPlayerStats(player, barX, barY + barH + 28);
  }
}

function drawPlayerStats(player, x, y) {
  const currentHealth = max(0, ceil(player.health ?? 0));
  const maxHealth = max(1, ceil(player.maxHealth ?? 1));
  const grappleShots = max(0, player.rangeShots ?? 0);

  push();
  fill(0);
  textAlign(LEFT, TOP);
  textSize(20);
  text(`Health: ${currentHealth}/${maxHealth}`, x, y);
  text(`Grapple Shots: ${grappleShots}`, x, y + 24);
  pop();
}

function drawHUDBorder(x, y, w, h, sheet) {
  if (!sheet) {
    noStroke();
    fill(20);
    rect(x, y, w, h, 3);
    return;
  }

  const tw = hudBorderConfig.tileWidth;
  const th = hudBorderConfig.tileHeight;
  const left = hudBorderConfig.left;
  const mid = hudBorderConfig.mid;
  const right = hudBorderConfig.right;
  const scale = hudBorderConfig.scale ?? 1;
  const drawH = h * scale;
  const drawY = y - (drawH - h) * 0.5;
  const capW = drawH;

  const leftSX = resolveSourceCoord(left.x, tw, sheet.width, hudBorderConfig.coordMode);
  const leftSY = resolveSourceCoord(left.y, th, sheet.height, hudBorderConfig.coordMode);
  const midSX = resolveSourceCoord(mid.x, tw, sheet.width, hudBorderConfig.coordMode);
  const midSY = resolveSourceCoord(mid.y, th, sheet.height, hudBorderConfig.coordMode);
  const rightSX = resolveSourceCoord(right.x, tw, sheet.width, hudBorderConfig.coordMode);
  const rightSY = resolveSourceCoord(right.y, th, sheet.height, hudBorderConfig.coordMode);

  push();
  imageMode(CORNER);
  noTint();

  image(sheet, x, drawY, capW, drawH, leftSX, leftSY, tw, th);

  const centerX = x + capW;
  const centerW = max(0, w - capW * 2);
  const repeats = max(1, floor(hudBorderConfig.midRepeats ?? 6));
  for (let i = 0; i < repeats; i++) {
    const segX = centerX + (centerW * i) / repeats;
    const segW = centerW / repeats;
    image(sheet, floor(segX), floor(drawY), ceil(segW), ceil(drawH), midSX, midSY, tw, th);
  }

  image(sheet, x + w - capW, drawY, capW, drawH, rightSX, rightSY, tw, th);
  pop();
}

function resolveSourceCoord(value, tileSize, sheetSize, coordMode) {
  if (coordMode === "pixel") {
    return constrain(value, 0, max(0, sheetSize - tileSize));
  }
  return constrain(value * tileSize, 0, max(0, sheetSize - tileSize));
}

function getPlaceholderHudTileSheet() {
  if (hudPlaceholderTileSheet) return hudPlaceholderTileSheet;

  hudPlaceholderTileSheet = createGraphics(16, 8);
  hudTileWidth = 8;
  hudTileHeight = 8;
  hudBgFrames = [{ x: 0, y: 0 }];
  hudFillFrames = [{ x: 1, y: 0 }];

  // Tile 0: bar background placeholder.
  hudPlaceholderTileSheet.noStroke();
  hudPlaceholderTileSheet.fill(55);
  hudPlaceholderTileSheet.rect(0, 0, 8, 8);
  hudPlaceholderTileSheet.fill(75);
  hudPlaceholderTileSheet.rect(0, 0, 8, 2);

  // Tile 1: bar fill placeholder.
  hudPlaceholderTileSheet.fill(80, 200, 140);
  hudPlaceholderTileSheet.rect(8, 0, 8, 8);
  hudPlaceholderTileSheet.fill(150, 250, 200);
  hudPlaceholderTileSheet.rect(8, 0, 8, 2);

  return hudPlaceholderTileSheet;
}
