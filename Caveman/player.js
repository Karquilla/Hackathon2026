class Player {
  constructor(x, y, w, h) {
    this.body = new Sprite(x, y, w, h);
    this.body.color = "#00ef00";
    this.body.rotationLock = true;
    this.speed = 5;
    this.maxHealth = 10;
    this.health = 10;
    this.rangeShots = 5;
    this.grappleMaxDistance = 220;
    this.grapplePullSpeed = 8;
    this.grappleDurationFrames = 20;
    this.grappleTarget = null;
    this.grappleFramesLeft = 0;
    this.lastGrappleAt = -99999;
    this.grappleCooldownMs = 250;
    this.evolutionType = "base";
    this.typesConsumed = [];
    this.foodConsumed = 0;
    this.currentSize = 0;
  }

  move() {
    if (kb.pressing("left") || kb.pressing("a")) {
      this.body.vel.x = -this.speed;
    }
    if (kb.pressing("right") || kb.pressing("d")) {
      this.body.vel.x = this.speed;
    }
    if (kb.pressing("down") || kb.pressing("s")) {
      this.body.vel.y = this.speed;
    }
    if (kb.pressing("up") || kb.pressing("w")) {
      this.body.vel.y = -this.speed;
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

    this.tryFireGrapple(enemies);
    this.updateGrapplePull();

    this.body.overlaps(enemies, (_playerCollider, enemyCollider) => {
      const enemyType = String(enemyCollider.enemyType ?? enemyCollider.type ?? "unknown").toLowerCase();
      const enemySize = enemyCollider.d ?? max(enemyCollider.w ?? 0, enemyCollider.h ?? 0);

      this.typesConsumed.push(enemyType);
      this.foodConsumed += 1;
      this.currentSize = max(this.currentSize, enemySize);
      this.grow();

      enemyCollider.remove();

      if (this.grappleTarget === enemyCollider) {
        this.grappleTarget = null;
        this.grappleFramesLeft = 0;
      }
    });
  }

  tryFireGrapple(enemies) {
    const mousePressed = typeof mouse !== "undefined" && mouse.presses();
    const wantsGrapple = kb.presses("f") || mousePressed;
    if (!wantsGrapple) return;
    if (this.rangeShots <= 0) return;
    if (millis() - this.lastGrappleAt < this.grappleCooldownMs) return;

    const target = this.findNearestEnemy(enemies);
    if (!target) return;

    this.rangeShots -= 1;
    this.lastGrappleAt = millis();
    this.grappleTarget = target;
    this.grappleFramesLeft = this.grappleDurationFrames;
  }

  updateGrapplePull() {
    if (!this.grappleTarget || this.grappleFramesLeft <= 0) {
      this.grappleTarget = null;
      this.grappleFramesLeft = 0;
      return;
    }

    const target = this.grappleTarget;
    const dx = this.body.x - target.x;
    const dy = this.body.y - target.y;
    const mag = Math.hypot(dx, dy);

    if (mag <= 1) {
      target.vel.x = 0;
      target.vel.y = 0;
      this.grappleTarget = null;
      this.grappleFramesLeft = 0;
      return;
    }

    const pullX = (dx / mag) * this.grapplePullSpeed;
    const pullY = (dy / mag) * this.grapplePullSpeed;
    target.vel.x = pullX;
    target.vel.y = pullY;
    this.grappleFramesLeft -= 1;
  }

  findNearestEnemy(enemies) {
    let nearest = null;
    let nearestDistSq = Infinity;
    const maxDistSq = this.grappleMaxDistance * this.grappleMaxDistance;

    for (const enemyCollider of enemies) {
      const dx = enemyCollider.x - this.body.x;
      const dy = enemyCollider.y - this.body.y;
      const distSq = dx * dx + dy * dy;
      if (distSq > maxDistSq) continue;
      if (distSq < nearestDistSq) {
        nearest = enemyCollider;
        nearestDistSq = distSq;
      }
    }

    return nearest;
  }

  grow() {
    if (this.foodConsumed % 5 !== 0) return;
    this.currentSize += 1;
    this.body.width += 4;
    this.body.height += 4;
  }

  evolveFromConsumedTypes() {
    const counts = {};
    for (const type of this.typesConsumed) {
      counts[type] = (counts[type] ?? 0) + 1;
    }

    if (Object.keys(counts).length === 0) {
      return {
        evolved: false,
        dominantType: null,
        counts
      };
    }

    const bonuses = {
      health: 0,
      rangeShots: 0,
      speed: 0
    };

    for (const [type, count] of Object.entries(counts)) {
      if (type === "tank") bonuses.health += count;
      if (type === "range" || type === "ranged") bonuses.rangeShots += count;
      if (type === "berserker") bonuses.speed += count;
    }

    this.maxHealth += bonuses.health;
    this.health = min(this.maxHealth, this.health + bonuses.health);
    this.rangeShots += bonuses.rangeShots;
    this.speed += bonuses.speed;

    let dominantType = null;
    let maxCount = -1;
    for (const [type, count] of Object.entries(counts)) {
      if (count > maxCount) {
        dominantType = type;
        maxCount = count;
      }
    }
    this.evolutionType = dominantType;

    return {
      evolved: true,
      dominantType,
      counts,
      bonuses
    };
  }
}
