const ENEMY_CELL = {
    cell_green: {
        health: 3,
        damage: 5,
        type: 'tank',
        speed: .5,
        frame: 0, // Row 1, Pos 1
    },
    cell_blue: {
        health: 5,
        damage: 3,
        type: 'range',
        speed: 1,
        frame: 1, // Row 1, Pos 2
    },
    cell_red: {
        health: 5,
        damage: 5,
        type: 'base',
        speed: 1,
        frame: 2, // Row 2, Pos 1
    },
    cell_orange: {
        health: 2,
        damage: 8,
        type: 'berzerker',
        speed: 3,
        frame: 3, // Row 2, Pos 2
    },
    cell_purple: {
        health: 3,
        damage: 7,
        type: 'trickster',
        speed: 2,
        frame: 4, // Row 3, Pos 1
    }
}
const ENEMY_ORGANISM = {
    org_green: {
        health: 5,
        damage: 7,
        type: 'tank',
        speed: .5,
        frame: 5, // Row 1, Pos 5
    },
    org_purple: {
        health: 5,
        damage: 9,
        type: 'trickster',
        speed: 4,
        frame: 6, // Row 1, Pos 6
    },
    org_orange: {
        health: 4,
        damage: 10,
        type: 'berzerker',
        speed: 5,
        frame: 7, // Row 1, Pos 7
    },
    org_blue: {
        health: 7,
        damage: 5,
        type: 'range',
        speed: 3,
        frame: 3, // Row 3, Pos 5
        
    },
    org_red: {
        health: 7,
        damage: 7,
        type: 'base',
        speed: 3,
        frame: 5, // Row 3, Pos 7
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

class Enemy {
    constructor(x, y, w = 20, h = 20, options = {}) {
        // If a group is provided, create the sprite within it
        if (options.group) {
            this.body = new options.group.Sprite(x, y, w, h);
        } else {
            this.body = new Sprite(x, y, w, h);
        }

        const typeData = ENEMY_CELL[options.type] || ENEMY_ORGANISM[options.type] || ENEMY_FISH[options.type] || MAMMALS[options.type] || {};
        this.body.enemyType = typeData.type || options.type || 'basic'; // explicitly set for player.js
        this.body.type = options.type || 'basic';
        this.body.enemyData = typeData; // Attach the full data object to the sprite
        this.body.health = options.health !== undefined ? options.health : (typeData.health || 100);
        this.body.damage = options.damage !== undefined ? options.damage : (typeData.damage || 10);
        this.body.speed = options.speed || (typeData.speed || 2);
        this.body.color = options.color || 'red';
        this.movementMode = options.movementMode || "topdown";

        // Add spritesheet handling
        if (options.spriteSheetImage) {
            this.body.spriteSheet = options.spriteSheetImage;
            this.body.addAnis({
                // Cells
                cell_green:  { x: 0, y: 16, frames: 1, w: 16, h: 16 },
                cell_blue:   { x: 48, y: 16, frames: 1, w: 16, h: 16 },
                cell_red:    { x: 0, y: 32, frames: 1, w: 16, h: 16 },
                cell_orange: { x: 48, y: 32, frames: 1, w: 16, h: 16 },
                cell_purple: { x: 0, y: 48, frames: 1, w: 16, h: 16 },

                // Organisms
                org_green:   { x: 112, y: 16, frames: 1, w: 16, h: 16 },
                org_purple:  { x: 112, y: 32, frames: 1, w: 16, h: 32 },
                org_orange:  { x: 192, y: 32, frames: 1, w: 16, h: 32 },
                org_blue:    { x: 112, y: 64, frames: 1, w: 16, h: 32 },
                org_red:     { x: 192, y: 16, frames: 1, w: 16, h: 16 },

                // Fish
                fsh_green:   { x: 256, y: 16, frames: 1, w: 32, h: 16 },
                fsh_purple:  { x: 256, y: 64, frames: 1, w: 32, h: 16 },
                fsh_orange:  { x: 256, y: 32, frames: 1, w: 32, h: 16 },
                fsh_blue:    { x: 256, y: 80, frames: 1, w: 32, h: 16 },
                fsh_red:     { x: 256, y: 48, frames: 1, w: 32, h: 16 },

                // Mammals
                rat:         { x: 0, y: 112, frames: 1, w: 32, h: 16 },
                rabbit:      { x: 0, y: 144, frames: 1, w: 32, h: 16 },
                fox:         { x: 112, y: 112, frames: 1, w: 32, h: 16 },
                panda:       { x: 144, y: 112, frames: 1, w: 32, h: 16 },
                bear:        { x: 112, y: 144, frames: 1, w: 32, h: 16 },
            });
            
            this.body.ani = options.type || 'cell_green';
        }
        
        // Random movement setup
        this.body.rotationLock = true;
        if (this.movementMode === "topdown") {
            this.body.direction = random(0, 360);
        } else {
            // Platformer mode: only move left or right
            this.body.direction = random([0, 180]);
        }
    }
    update(worldBounds = null, floors = null) {
        // If the sprite has been removed, don't update
        if (!this.body || this.body.removed) return;

        const minX = worldBounds?.minX ?? 0;
        const maxX = worldBounds?.maxX ?? width;
        const minY = worldBounds?.minY ?? 0;
        const maxY = worldBounds?.maxY ?? height;
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        if (this.movementMode === "platformer") {
            // Apply gravity
            this.body.vel.y += 0.7; // matches player gravity
            if (floors) {
                this.body.collides(floors);
            }
            
            // Limit fall speed
            if (this.body.vel.y > 14) this.body.vel.y = 14;

            // Turn around at world edges
            if (this.body.x < minX + 20) {
                this.body.direction = 0;
                this.body.x = minX + 20;
            } else if (this.body.x > maxX - 20) {
                this.body.direction = 180;
                this.body.x = maxX - 20;
            }

            // Occasionally change direction
            if (random(100) < 0.5) {
                this.body.direction = (this.body.direction === 0) ? 180 : 0;
            }
        } else {
            // Topdown movement logic
            if (this.body.x < minX || this.body.x > maxX || this.body.y < minY || this.body.y > maxY) {
                this.body.direction = this.body.angleTo(centerX, centerY) + random(-20, 20);
            }

            if (random(100) < 1) { 
                this.body.direction += random(-45, 45);
            }
        }
    }

    takeDamage(amount) {
        this.body.health -= amount;
        if (this.body.health <= 0) {
            this.body.remove();
        }
    }

}
