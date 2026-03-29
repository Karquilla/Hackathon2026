class Player {
  constructor(x, y, w, h, options = {}) {
    this.body = new Sprite(x, y, w, h);
    this.body.color = "#00ef00";
    this.body.rotationLock = true;
    this.baseWidth = w;
    this.baseHeight = h;
    this.spriteSheetImage = options.spriteSheetImage ?? null;
    this.stageAppearances = options.stageAppearances ?? {};
    this.currentAppearanceFrame = null;
    this.speed = 5;
    this.movementMode = "topdown";
    this.jumpStrength = 12;
    this.gravity = 0.7;
    this.maxFallSpeed = 14;
    this.isGrounded = false;
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
    this.minGrappleCooldownMs = 90;
    this.lastDamageAt = -99999;
    this.contactDamageCooldownMs = 500;
    this.enemyDamageTakenMultiplier = 0.5;
    this.evolutionType = "base";
    this.typesConsumed = [];
    this.foodConsumed = 0;
    this.currentSize = 0;
    this.evolutionBonuses = {
      health: 0,
      rangeShots: 0,
      speed: 0,
      grapplePull: 0,
      cooldownReductionMs: 0
    };

    this.setupStageAppearances();
    this.syncSpriteScale();
  }

  move() {
    if (this.movementMode === "platformer") {
      this.movePlatformer();
      return;
    }

    this.moveTopDown();
  }

  moveTopDown() {
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

  movePlatformer() {
    const moveLeft = kb.pressing("left") || kb.pressing("a");
    const moveRight = kb.pressing("right") || kb.pressing("d");
    const wantsJump = kb.presses("up") || kb.presses("w") || kb.presses("space");

    if (moveLeft && !moveRight) {
      this.body.vel.x = -this.speed;
    } else if (moveRight && !moveLeft) {
      this.body.vel.x = this.speed;
    } else {
      this.body.vel.x = 0;
    }

    if (wantsJump && this.isGrounded) {
      this.body.vel.y = -this.jumpStrength;
      this.isGrounded = false;
    }

    this.body.vel.y = min(this.body.vel.y + this.gravity, this.maxFallSpeed);
  }

  configureForStage(stageNumber) {
    this.applyStageAppearance(stageNumber);

    if (stageNumber >= 4) {
      this.setMovementMode("platformer");
      return;
    }

    this.setMovementMode("topdown");
  }

  setMovementMode(mode) {
    this.movementMode = mode;

    if (mode === "platformer") {
      this.body.rotationLock = true;
      this.body.friction = 0;
      this.body.vel.x = 0;
      this.body.vel.y = 0;
      this.isGrounded = false;
      return;
    }

    this.body.rotationLock = true;
    this.body.friction = 0;
    this.body.vel.x = 0;
    this.body.vel.y = 0;
    this.isGrounded = false;
  }

  setupStageAppearances() {
    if (!this.spriteSheetImage) return;

    this.body.spriteSheet = this.spriteSheetImage;
    const anis = {};

    for (const [stage, frame] of Object.entries(this.stageAppearances)) {
      if (!frame) continue;

      anis[`player_stage_${stage}`] = {
        x: frame.x,
        y: frame.y,
        frames: 1,
        w: frame.w ?? this.baseWidth,
        h: frame.h ?? this.baseHeight
      };
    }

    if (Object.keys(anis).length > 0) {
      this.body.addAnis(anis);
    }
  }

  applyStageAppearance(stageNumber) {
    if (!this.spriteSheetImage) return;

    const stageFrame = this.stageAppearances[stageNumber] ?? this.stageAppearances.default;
    const aniName = `player_stage_${stageNumber}`;

    if (stageFrame && this.body.anis?.[aniName]) {
      this.currentAppearanceFrame = stageFrame;
      this.body.ani = aniName;
      this.syncSpriteScale();
      return;
    }

    if (this.stageAppearances.default && this.body.anis?.player_stage_default) {
      this.currentAppearanceFrame = this.stageAppearances.default;
      this.body.ani = "player_stage_default";
      this.syncSpriteScale();
    }
  }

  update(enemies, worldBounds = null, floors = null) {
    this.move();
    this.resolveEnvironment(worldBounds, floors);

    if (enemies) {
      this.tryFireGrapple(enemies);
      this.updateGrapplePull();

      this.body.overlaps(enemies, (_playerCollider, enemyCollider) => {
        const playerSize = this.getCombatSize();
        const enemyType = String(
          enemyCollider.enemyData?.type ??
          enemyCollider.enemyTypeClass ??
          enemyCollider.enemyArchetype ??
          enemyCollider.type ??
          "unknown"
        ).toLowerCase();
        const enemySize = this.getEnemyCombatSize(enemyCollider);

        if (playerSize >= enemySize) {
          this.consumeEnemy(enemyCollider, enemyType, enemySize);
          return;
        }

        this.takeContactDamage(enemyCollider.damage ?? enemyCollider.enemyData?.damage ?? 1);
      });
    }
  }

  resolveEnvironment(worldBounds, floors) {
    this.clampToBounds(worldBounds, floors);

    if (this.movementMode === "platformer" && floors) {
      this.body.collides(floors);
      this.isGrounded = this.body.colliding(floors) > 0;

      if (this.isGrounded && this.body.vel.y > 0) {
        this.body.vel.y = 0;
      }
    }
  }

  clampToBounds(bounds, floors = null) {
    if (!bounds) return;

    const spriteWidth = this.body.w ?? this.body.width ?? 0;
    const spriteHeight = this.body.h ?? this.body.height ?? 0;
    const halfWidth = spriteWidth / 2;
    const halfHeight = spriteHeight / 2;
    const minX = bounds.minX + halfWidth;
    const maxX = bounds.maxX - halfWidth;
    const minY = bounds.minY + halfHeight;
    const maxY = bounds.maxY - halfHeight;

    if (!Number.isFinite(minX) || !Number.isFinite(maxX) || !Number.isFinite(minY) || !Number.isFinite(maxY)) {
      return;
    }

    const clampedMinX = min(minX, maxX);
    const clampedMaxX = max(minX, maxX);
    const clampedMinY = min(minY, maxY);
    const clampedMaxY = max(minY, maxY);

    const clampedX = constrain(this.body.x, clampedMinX, clampedMaxX);
    const shouldClampYToWorldFloor = !(this.movementMode === "platformer" && floors);
    const clampedY = shouldClampYToWorldFloor
      ? constrain(this.body.y, clampedMinY, clampedMaxY)
      : max(this.body.y, clampedMinY);
    const reachedFloor = shouldClampYToWorldFloor && this.movementMode === "platformer" && this.body.y >= clampedMaxY;

    if (clampedX !== this.body.x) {
      this.body.x = clampedX;
      this.body.vel.x = 0;
    } else {
      this.body.x = clampedX;
    }

    if (clampedY !== this.body.y) {
      this.body.y = clampedY;
      this.body.vel.y = 0;
    } else {
      this.body.y = clampedY;
    }

    if (this.movementMode === "platformer" && shouldClampYToWorldFloor) {
      this.isGrounded = reachedFloor || abs(this.body.y - clampedMaxY) < 0.5;
    }
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
    if (this.foodConsumed % 8 !== 0) return;
    this.currentSize += 1;
    if (typeof this.body.w === "number") this.body.w += 2;
    if (typeof this.body.h === "number") this.body.h += 2;
    if (typeof this.body.width === "number") this.body.width += 2;
    if (typeof this.body.height === "number") this.body.height += 2;
    this.syncSpriteScale();
  }

  reduceSizeBetweenStages(retainPercent = 0.8) {
    const safeRetainPercent = constrain(retainPercent, 0.1, 1);
    const currentWidth = this.body.w ?? this.body.width ?? this.baseWidth;
    const currentHeight = this.body.h ?? this.body.height ?? this.baseHeight;
    const nextWidth = max(this.baseWidth, round(currentWidth * safeRetainPercent));
    const nextHeight = max(this.baseHeight, round(currentHeight * safeRetainPercent));

    if (typeof this.body.w === "number") this.body.w = nextWidth;
    if (typeof this.body.h === "number") this.body.h = nextHeight;
    if (typeof this.body.width === "number") this.body.width = nextWidth;
    if (typeof this.body.height === "number") this.body.height = nextHeight;

    this.currentSize = max(this.currentSize * safeRetainPercent, 0);
    this.syncSpriteScale();
  }

  syncSpriteScale() {
    const frameWidth = this.currentAppearanceFrame?.w ?? this.baseWidth;
    const frameHeight = this.currentAppearanceFrame?.h ?? this.baseHeight;
    const bodyWidth = this.body.w ?? this.body.width ?? this.baseWidth;
    const bodyHeight = this.body.h ?? this.body.height ?? this.baseHeight;

    if (!frameWidth || !frameHeight) return;

    this.body.scale.x = bodyWidth / frameWidth;
    this.body.scale.y = bodyHeight / frameHeight;
  }

  getCombatSize() {
    return max(
      this.body.d ?? 0,
      this.body.w ?? this.body.width ?? 0,
      this.body.h ?? this.body.height ?? 0
    );
  }

  getEnemyCombatSize(enemyCollider) {
    return max(
      enemyCollider.enemySize ?? 0,
      enemyCollider.d ?? 0,
      enemyCollider.w ?? enemyCollider.width ?? 0,
      enemyCollider.h ?? enemyCollider.height ?? 0
    );
  }

  consumeEnemy(enemyCollider, enemyType, enemySize) {
    this.typesConsumed.push(enemyType);
    this.foodConsumed += 1;
    this.currentSize = max(this.currentSize, enemySize);
    this.grow();

    enemyCollider.remove();

    if (this.grappleTarget === enemyCollider) {
      this.grappleTarget = null;
      this.grappleFramesLeft = 0;
    }
  }

  takeContactDamage(amount) {
    if (millis() - this.lastDamageAt < this.contactDamageCooldownMs) return;

    this.lastDamageAt = millis();
    const scaledDamage = max(1, round(amount * this.enemyDamageTakenMultiplier));
    this.health = max(0, this.health - scaledDamage);
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
      speed: 0,
      grapplePull: 0,
      cooldownReductionMs: 0
    };

    for (const [type, count] of Object.entries(counts)) {
      if (type === "tank") {
        bonuses.health += count * 2;
      }
      if (type === "range" || type === "ranged") {
        bonuses.rangeShots += count;
      }
      if (type === "berserker" || type === "berzerker") {
        bonuses.speed += count * 0.35;
      }
      if (type === "trickster") {
        bonuses.grapplePull += count * 0.75;
        bonuses.cooldownReductionMs += count * 15;
      }
      if (type === "base") {
        bonuses.health += count;
        bonuses.speed += count * 0.15;
      }
    }

    this.evolutionBonuses.health += bonuses.health;
    this.evolutionBonuses.rangeShots += bonuses.rangeShots;
    this.evolutionBonuses.speed += bonuses.speed;
    this.evolutionBonuses.grapplePull += bonuses.grapplePull;
    this.evolutionBonuses.cooldownReductionMs += bonuses.cooldownReductionMs;

    this.maxHealth += bonuses.health;
    this.health = min(this.maxHealth, this.health + bonuses.health);
    this.rangeShots += bonuses.rangeShots;
    this.speed += bonuses.speed;
    this.grapplePullSpeed += bonuses.grapplePull;
    this.grappleCooldownMs = max(
      this.minGrappleCooldownMs,
      this.grappleCooldownMs - bonuses.cooldownReductionMs
    );

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
