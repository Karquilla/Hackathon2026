class Floor {
  constructor(options = {}) {
    this.group = options.group ?? new Group();
    this.group.collider = "static";
    this.group.color = options.color ?? "#705334";
    this.group.stroke = options.stroke ?? "#2d2015";
    this.spriteSheetImage = options.spriteSheetImage ?? null;
    this.platformFrame = options.platformFrame ?? { x: 80, y: 304, w: 16, h: 16 };
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
    if (spriteSheetImage && platformFrame) {
      platform.spriteSheet = spriteSheetImage;
      platform.addAnis({
        platform_tile: {
          x: platformFrame.x,
          y: platformFrame.y,
          frames: 1,
          w: platformFrame.w,
          h: platformFrame.h
        }
      });
      platform.ani = "platform_tile";
    }

    return platform;
  }

  addGround(y = height - 18, h = 36, options = {}) {
    return this.add(width / 2, y, width, h, options);
  }
}
