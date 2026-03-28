let player;

const BASE_WIDTH = 720;
const BASE_HEIGHT = 480;
const CANVAS_PADDING = 16;

function setup() {
  new Canvas(BASE_WIDTH, BASE_HEIGHT);
  fitCanvasToWindow();

  player = new Sprite(120, 260, 36, 48);
  player.color = "#00ef00";
  player.rotationLock = true;
}

function draw() {
  background("#555555");

  if (kb.pressing("left") || kb.pressing("a")) {
    player.vel.x = -5;
  } else if (kb.pressing("right") || kb.pressing("d")) {
    player.vel.x = 5;
  } else {
    player.vel.x = 0;
  }

  camera.x = width / 2;
  camera.y = height / 2;
}

function windowResized() {
  fitCanvasToWindow();
}

function fitCanvasToWindow() {
  const availableWidth = max(320, windowWidth - CANVAS_PADDING * 2);
  const availableHeight = max(180, windowHeight - CANVAS_PADDING * 2);
  const scale = min(availableWidth / BASE_WIDTH, availableHeight / BASE_HEIGHT);

  resizeCanvas(floor(BASE_WIDTH * scale), floor(BASE_HEIGHT * scale));
}
