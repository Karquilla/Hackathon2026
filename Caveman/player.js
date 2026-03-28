class Player {
  constructor(x, y, w, h) {
    this.body = new Sprite(x, y, w, h);
    this.body.color = "#00ef00";
    this.body.rotationLock = true;
    this.consumed = [];
  }

  move() {
    if (kb.pressing("left") || kb.pressing("a")) {
      this.body.vel.x = -5;
    }
    if (kb.pressing("right") || kb.pressing("d")) {
      this.body.vel.x = 5;
    }
    if (kb.pressing("down") || kb.pressing("s")) {
      this.body.vel.y = 5;
    }
    if (kb.pressing("up") || kb.pressing("w")) {
      this.body.vel.y = -5;
    }
    if (!(kb.pressing("left") || kb.pressing("a") || kb.pressing("right") || kb.pressing("d"))) {
      this.body.vel.x = 0;
    }
    if (!(kb.pressing("down") || kb.pressing("s") || kb.pressing("up") || kb.pressing("w"))) {
      this.body.vel.y = 0;
    }
  }
}