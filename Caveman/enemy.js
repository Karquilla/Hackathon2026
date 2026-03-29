const ENEMY_CELL = {
    cell_green: {
        health: 3,
        damage: 5,
        type: 'tank',
        speed: .5,
        frame: 0,
    },
    cell_blue: {
        health: 5,
        damage: 3,
        type: 'range',
        speed: 1,
        frame: 1,
    },
    cell_red: {
        health: 5,
        damage: 5,
        type: 'base',
        speed: 1,
        frame: 2,
    },
    cell_orange: {
        health: 2,
        damage: 8,
        type: 'berzerker',
        speed: 3,
        frame: 3,
    },
    cell_purple: {
        health: 3,
        damage: 7,
        type: 'trickster',
        speed: 2,
        frame: 4,
    }
}
const ENEMY_ORGANISM = {
    org_green: {
        health: 5,
        damage: 7,
        type: 'tank',
        speed: .5,
        frame: 5,
    },
    org_purple: {
        health: 5,
        damage: 9,
        type: 'trickster',
        speed: 4,
        frame: 6,
    },
    org_orange: {
        health: 4,
        damage: 10,
        type: 'berzerker',
        speed: 5,
        frame: 7,
    },
    org_blue: {
        health: 7,
        damage: 5,
        type: 'range',
        speed: 3,
        frame: 3,
        
    },
    org_red: {
        health: 7,
        damage: 7,
        type: 'base',
        speed: 3,
        frame: 5,
    }

}

const ENEMY_FISH = {
    fsh_green: {
        health: 7,
        damage: 9,
        type: 'tank',
        speed: 4,
        frame: 9,
    },
    fsh_purple: {
        health: 7,
        damage: 11,
        type: 'trickster',
        speed: 6,
        frame: 11,
    },
    fsh_orange: {
        health: 6,
        damage: 12,
        type: 'berzerker',
        speed: 7,
        frame: 10,
    },
    fsh_blue: {
        health: 9,
        damage: 7,
        type: 'range',
        speed: 5,
        frame: 12,
    },
    fsh_red: {
        health: 9,
        damage: 9,
        type: 'base',
        speed: 5,
        frame: 7,
    }
}
const MAMMALS = {
    rat: {
        health: 7,
        damage: 9,
        type: 'tank',
        speed: 4,
        frame: 9,
    },
    rabbit: {
        health: 7,
        damage: 11,
        type: 'trickster',
        speed: 6,
        frame: 11,
    },
    fox: {
        health: 6,
        damage: 12,
        type: 'berzerker',
        speed: 7,
        frame: 10,
    },
    panda: {
        health: 9,
        damage: 7,
        type: 'range',
        speed: 5,
        frame: 12,
    },
    bear: {
        health: 9,
        damage: 9,
        type: 'base',
        speed: 5,
        frame: 7,
    }
}

const HUMANS = {
    man_green: {
        health: 10,
        damage: 10,
        type: 'tank',
        speed: 4,
        frame: 0,
    },
    man_blue: {
        health: 9,
        damage: 8,
        type: 'range',
        speed: 5,
        frame: 1,
    },
    man_red: {
        health: 9,
        damage: 10,
        type: 'base',
        speed: 5,
        frame: 2,
    },
    man_orange: {
        health: 8,
        damage: 12,
        type: 'berzerker',
        speed: 6,
        frame: 3,
    },
    man_purple: {
        health: 8,
        damage: 11,
        type: 'trickster',
        speed: 6,
        frame: 4,
    }
}

class Enemy {
    constructor(x, y, w = 20, h = 20, options = {}) {
        if (options.group) {
            this.body = new options.group.Sprite(x, y, w, h);
        } else {
            this.body = new Sprite(x, y, w, h);
        }

        const typeData = ENEMY_CELL[options.type] || ENEMY_ORGANISM[options.type] || ENEMY_FISH[options.type] || MAMMALS[options.type] || HUMANS[options.type] || {};
        this.body.enemyType = typeData.type || options.type || 'basic';
        this.body.type = options.type || 'basic';
        this.body.enemyData = typeData;
        this.body.health = options.health !== undefined ? options.health : (typeData.health || 100);
        this.body.damage = options.damage !== undefined ? options.damage : (typeData.damage || 10);
        this.body.speed = options.speed || (typeData.speed || 2);
        this.body.color = options.color || 'red';
        this.movementMode = options.movementMode || "topdown";
        this.platformSpeed = this.body.speed;
        this.currentAppearanceFrame = null;
        this.body.enemySize = max(
            this.body.d ?? 0,
            this.body.w ?? this.body.width ?? 0,
            this.body.h ?? this.body.height ?? 0
        );

        if (options.spriteSheetImage) {
            this.body.spriteSheet = options.spriteSheetImage;
            this.body.addAnis({
                cell_green:  { x: 0, y: 16, frames: 1, w: 16, h: 16 },
                cell_blue:   { x: 48, y: 16, frames: 1, w: 16, h: 16 },
                cell_red:    { x: 0, y: 32, frames: 1, w: 16, h: 16 },
                cell_orange: { x: 48, y: 32, frames: 1, w: 16, h: 16 },
                cell_purple: { x: 0, y: 48, frames: 1, w: 16, h: 16 },

                org_green:   { x: 112, y: 16, frames: 1, w: 16, h: 16 },
                org_purple:  { x: 112, y: 32, frames: 1, w: 16, h: 32 },
                org_orange:  { x: 192, y: 32, frames: 1, w: 16, h: 32 },
                org_blue:    { x: 112, y: 64, frames: 1, w: 16, h: 32 },
                org_red:     { x: 192, y: 16, frames: 1, w: 16, h: 16 },

                fsh_green:   { x: 256, y: 16, frames: 1, w: 32, h: 16 },
                fsh_purple:  { x: 256, y: 64, frames: 1, w: 32, h: 16 },
                fsh_orange:  { x: 256, y: 32, frames: 1, w: 32, h: 16 },
                fsh_blue:    { x: 256, y: 80, frames: 1, w: 32, h: 16 },
                fsh_red:     { x: 256, y: 48, frames: 1, w: 32, h: 16 },

                rat:         { x: 0, y: 112, frames: 1, w: 32, h: 16 },
                rabbit:      { x: 0, y: 144, frames: 1, w: 32, h: 16 },
                fox:         { x: 112, y: 112, frames: 1, w: 32, h: 16 },
                panda:       { x: 144, y: 112, frames: 1, w: 32, h: 16 },
                bear:        { x: 112, y: 144, frames: 1, w: 32, h: 16 },

                man_green:   { x: 16, y: 208, frames: 1, w: 16, h: 32 },
                man_blue:    { x: 80, y: 208, frames: 1, w: 16, h: 32 },
                man_red:     { x: 160, y: 208, frames: 1, w: 16, h: 32 },
                man_orange:  { x: 160, y: 241, frames: 1, w: 16, h: 32 },
                man_purple:  { x: 80, y: 241, frames: 1, w: 16, h: 32 },
            });
            
            this.currentAppearanceFrame = this.getAppearanceFrame(options.type || 'cell_green');
            this.body.ani = options.type || 'cell_green';
            this.syncSpriteScale();
        }
        
        this.body.rotationLock = true;
        this.body.friction = 0;
        if (this.movementMode === "topdown") {
            this.body.direction = random(0, 360);
        } else {
            this.body.direction = random([0, 180]);
            this.body.vel.x = this.body.direction === 0 ? this.platformSpeed : -this.platformSpeed;
            this.body.vel.y = 0;
        }
    }

    getAppearanceFrame(type) {
        const appearanceFrames = {
            cell_green:  { w: 16, h: 16 },
            cell_blue:   { w: 16, h: 16 },
            cell_red:    { w: 16, h: 16 },
            cell_orange: { w: 16, h: 16 },
            cell_purple: { w: 16, h: 16 },
            org_green:   { w: 16, h: 16 },
            org_purple:  { w: 16, h: 32 },
            org_orange:  { w: 16, h: 32 },
            org_blue:    { w: 16, h: 32 },
            org_red:     { w: 16, h: 16 },
            fsh_green:   { w: 32, h: 16 },
            fsh_purple:  { w: 32, h: 16 },
            fsh_orange:  { w: 32, h: 16 },
            fsh_blue:    { w: 32, h: 16 },
            fsh_red:     { w: 32, h: 16 },
            rat:         { w: 32, h: 16 },
            rabbit:      { w: 32, h: 16 },
            fox:         { w: 32, h: 16 },
            panda:       { w: 32, h: 16 },
            bear:        { w: 32, h: 16 },
            man_green:   { w: 16, h: 32 },
            man_blue:    { w: 16, h: 32 },
            man_red:     { w: 16, h: 32 },
            man_orange:  { w: 16, h: 32 },
            man_purple:  { w: 16, h: 32 }
        };

        return appearanceFrames[type] ?? { w: this.body.w ?? 16, h: this.body.h ?? 16 };
    }

    syncSpriteScale() {
        if (!this.currentAppearanceFrame) return;

        const frameWidth = this.currentAppearanceFrame.w ?? 16;
        const frameHeight = this.currentAppearanceFrame.h ?? 16;
        const bodyWidth = this.body.w ?? this.body.width ?? frameWidth;
        const bodyHeight = this.body.h ?? this.body.height ?? frameHeight;

        if (!frameWidth || !frameHeight) return;

        this.body.scale.x = bodyWidth / frameWidth;
        this.body.scale.y = bodyHeight / frameHeight;
    }

    update(worldBounds = null, floors = null) {
        if (!this.body || this.body.removed) return;

        const minX = worldBounds?.minX ?? 0;
        const maxX = worldBounds?.maxX ?? width;
        const minY = worldBounds?.minY ?? 0;
        const maxY = worldBounds?.maxY ?? height;
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        if (this.movementMode === "platformer") {
            this.body.vel.y += 0.7;
            if (floors) {
                this.body.collides(floors);
                if (this.body.colliding(floors) > 0 && this.body.vel.y > 0) {
                    this.body.vel.y = 0;
                }
            }
            
            if (this.body.vel.y > 14) this.body.vel.y = 14;

            this.body.vel.x = this.body.direction === 0 ? this.platformSpeed : -this.platformSpeed;

            if (this.body.x < minX + 20) {
                this.body.direction = 0;
                this.body.x = minX + 20;
            } else if (this.body.x > maxX - 20) {
                this.body.direction = 180;
                this.body.x = maxX - 20;
            }

            if (random(100) < 0.5) {
                this.body.direction = (this.body.direction === 0) ? 180 : 0;
            }

            if (floors && this.body.colliding(floors) > 0 && abs(this.body.vel.x) < 0.1) {
                this.body.direction = (this.body.direction === 0) ? 180 : 0;
                this.body.vel.x = this.body.direction === 0 ? this.platformSpeed : -this.platformSpeed;
            }
        } else {
            if (this.body.x < minX || this.body.x > maxX || this.body.y < minY || this.body.y > maxY) {
                this.body.direction = this.body.angleTo(centerX, centerY) + random(-20, 20);
            }

            if (random(100) < 1) { 
                this.body.direction += random(-45, 45);
            }
        }

        this.updateFacingDirection();
    }

    updateFacingDirection() {
        const faceThreshold = 0.05;

        if (this.body.vel.x > faceThreshold) {
            this.body.mirror.x = true;
        } else if (this.body.vel.x < -faceThreshold) {
            this.body.mirror.x = false;
        }
    }

    takeDamage(amount) {
        this.body.health -= amount;
        if (this.body.health <= 0) {
            this.body.remove();
        }
    }

}
