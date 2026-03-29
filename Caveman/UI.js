let hudPlaceholderTileSheet = null;
let hudTileSheet = null;
let hudTileWidth = 8;
let hudTileHeight = 8;
let hudAnimFps = 8;
let hudBgFrames = [{ x: 0, y: 0 }];
let hudFillFrames = [{ x: 1, y: 0 }];

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

function getAnimatedFrame(frames, fps) {
  const safeFrames = frames && frames.length ? frames : [{ x: 0, y: 0 }];
  const frameDuration = max(1, floor(60 / max(1, fps)));
  const frameIndex = floor(frameCount / frameDuration) % safeFrames.length;
  return safeFrames[frameIndex];
}

function drawHUD(time, uiTileSheet = null) {
  fill(0);
  textSize(24);
  text(`Time to Evolve: ${time}`, 20, 30);

  const barX = 20;
  const barY = 50;
  const barW = 200;
  const barH = 20;
  const maxTime = 30;
  const progress = constrain(time / maxTime, 0, 1);
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

  noStroke();
  fill(20);
  rect(barX, barY, barW, barH, 3);

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
