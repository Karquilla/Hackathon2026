let player;
let enemy;

const BASE_WIDTH = 720;
const BASE_HEIGHT = 480;
const CANVAS_PADDING = 16;


function setup() {
  new Canvas(BASE_WIDTH, BASE_HEIGHT);
  fitCanvasDisplayToWindow();

  player = new Player(120, 260, 36, 48);
  germ = new Enemy(600, 100, {health:10, dmage:3, speed:1, color:'red', });
}

function draw() {
  background("#555555");
  player.move();
  germ.update();

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
