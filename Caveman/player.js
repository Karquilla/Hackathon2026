class Player {
  constructor(x, y, w, h) {
    this.body = new Sprite(x, y, w, h);
    this.body.color = "#00ef00";
    this.body.rotationLock = true;
    this.typesConsumed = [];
    this.foodConsumed = 0;
    this.currentSize = 0;
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

  update(enemies) {
    this.move();
    if (!enemies) return;

    this.body.overlaps(enemies, (_playerCollider, enemyCollider) => {
      const enemyType = enemyCollider.enemyType ?? enemyCollider.type ?? "unknown";
      const enemySize = enemyCollider.d ?? max(enemyCollider.w ?? 0, enemyCollider.h ?? 0);

      this.typesConsumed.push(enemyType);
      this.foodConsumed += 1;
      this.currentSize = max(this.currentSize, enemySize);
      this.grow();

      enemyCollider.remove();
    });
  }

  grow() {
    if (this.foodConsumed % 5 !== 0) return;
    this.currentSize += 1;
    this.body.width += 4;
    this.body.height += 4;
  }
}
