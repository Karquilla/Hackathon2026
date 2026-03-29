class Floor {
  constructor(options = {}) {
    this.group = options.group ?? new Group();
    this.group.collider = "static";
    this.group.color = options.color ?? "#705334";
    this.group.stroke = options.stroke ?? "#2d2015";
    this.spriteSheetImage = options.spriteSheetImage ?? null;
    this.platformFrame = options.platformFrame ?? { x: 80, y: 304, w: 16, h: 16 };
    this.platformTiles = options.platformTiles ?? null;
    this.tileCache = new Map();
  }

  add(x, y, w, h, options = {}) {
    const platform = new this.group.Sprite(x, y, w, h);
    platform.color = options.color ?? this.group.color;
    platform.stroke = options.stroke ?? this.group.stroke;
    platform.friction = options.friction ?? 0.2;
    platform.bounciness = 0;
    platform.rotationLock = true;

    const spriteSheetImage = options.spriteSheetImage ?? this.spriteSheetImage;
    const platformFrame = options.platformFrame ?? this.platformFrame;
    const platformTiles = options.platformTiles ?? this.platformTiles;
    if (spriteSheetImage && (platformTiles || platformFrame)) {
      const resolvedTiles = this.resolvePlatformTiles(platformTiles, platformFrame);
      const leftTile = this.getTileImage(spriteSheetImage, resolvedTiles.left);
      const centerTile = this.getTileImage(spriteSheetImage, resolvedTiles.center);
      const rightTile = this.getTileImage(spriteSheetImage, resolvedTiles.right);
      const tileWidth = resolvedTiles.center.w ?? resolvedTiles.left.w ?? resolvedTiles.right.w ?? 16;
      const tileHeight = resolvedTiles.center.h ?? resolvedTiles.left.h ?? resolvedTiles.right.h ?? 16;

      platform.pixelPerfect = true;
      platform.draw = function () {
        if (!centerTile) return;

        push();
        imageMode(CORNER);
        noSmooth();

        const startX = -this.w / 2;
        const startY = -this.h / 2;

        for (let tileY = 0; tileY < this.h; tileY += tileHeight) {
          const drawHeight = min(tileHeight, this.h - tileY);
          const useEndcaps = this.w >= tileWidth * 2;
          const centerStartX = useEndcaps ? tileWidth : 0;
          const centerEndX = useEndcaps ? max(tileWidth, this.w - tileWidth) : this.w;

          if (useEndcaps && leftTile) {
            image(
              leftTile,
              startX,
              startY + tileY,
              tileWidth,
              drawHeight,
              0,
              0,
              tileWidth,
              drawHeight
            );
          }

          for (let tileX = centerStartX; tileX < centerEndX; tileX += tileWidth) {
            const drawWidth = min(tileWidth, centerEndX - tileX);

            image(
              centerTile,
              startX + tileX,
              startY + tileY,
              drawWidth,
              drawHeight,
              0,
              0,
              drawWidth,
              drawHeight
            );
          }

          if (useEndcaps && rightTile) {
            image(
              rightTile,
              startX + this.w - tileWidth,
              startY + tileY,
              tileWidth,
              drawHeight,
              0,
              0,
              tileWidth,
              drawHeight
            );
          }
        }

        pop();
      };
    }

    return platform;
  }

  addGround(y = height - 18, h = 36, options = {}) {
    return this.add(width / 2, y, width, h, options);
  }

  getTileImage(spriteSheetImage, platformFrame) {
    const cacheKey = [
      spriteSheetImage?.src ?? "sheet",
      platformFrame.x,
      platformFrame.y,
      platformFrame.w,
      platformFrame.h
    ].join(":");

    if (!this.tileCache.has(cacheKey)) {
      this.tileCache.set(
        cacheKey,
        spriteSheetImage.get(
          platformFrame.x,
          platformFrame.y,
          platformFrame.w,
          platformFrame.h
        )
      );
    }

    return this.tileCache.get(cacheKey);
  }

  resolvePlatformTiles(platformTiles, platformFrame) {
    if (platformTiles) {
      const centerTile = platformTiles.center ?? platformTiles.middle ?? platformTiles.mid;
      return {
        left: platformTiles.left ?? centerTile,
        center: centerTile ?? platformFrame,
        right: platformTiles.right ?? centerTile
      };
    }

    return {
      left: platformFrame,
      center: platformFrame,
      right: platformFrame
    };
  }
}
