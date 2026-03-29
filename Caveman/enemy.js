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

class Enemy {
    constructor(x, y, w = 20, h = 20, options = {}) {
        // If a group is provided, create the sprite within it
        if (options.group) {
            this.body = new options.group.Sprite(x, y, w, h);
        } else {
            this.body = new Sprite(x, y, w, h);
        }

        const typeData = ENEMY_CELL[options.type] || {};
        this.body.enemyType = typeData.type || options.type || 'basic'; // explicitly set for player.js
        this.body.type = options.type || 'basic';
        this.body.enemyData = typeData; // Attach the full data object to the sprite
        this.body.health = options.health !== undefined ? options.health : (typeData.health || 100);
        this.body.damage = options.damage !== undefined ? options.damage : (typeData.damage || 10);
        this.body.speed = options.speed || (typeData.speed || 2);
        this.body.color = options.color || 'red';

        // Add spritesheet handling
        if (options.spriteSheetImage) {
            this.body.spriteSheet = options.spriteSheetImage;
            this.body.addAnis({
                cell_green:  { row: 1, col: 0, frames: 1, w: 16, h: 16 },
                cell_blue:   { row: 1, col: 1, frames: 1, w: 16, h: 16 },
                cell_red:    { row: 2, col: 0, frames: 1, w: 16, h: 16 },
                cell_orange: { row: 2, col: 1, frames: 1, w: 16, h: 16 },
                cell_purple: { row: 3, col: 0, frames: 1, w: 16, h: 16 },

                org_green:   { row: 1, col: 4, frames: 1, w: 16, h: 16 },
                org_purple:  { row: 1, col: 5, frames: 1, w: 16, h: 32 },
                org_orange:  { row: 1, col: 6, frames: 1, w: 16, h: 32 },
                org_blue:    { row: 3, col: 4, frames: 1, w: 32, h: 16 },
                org_red:     { row: 3, col: 6, frames: 1, w: 16, h: 16 },
            });
            
            this.body.ani = options.type || 'cell_green';
        }
        
        // Random movement setup
        this.body.rotationLock = true;
        this.body.direction = random(0, 360);
    }
    update() {
        // If the sprite has been removed, don't update
        if (!this.body || this.body.removed) return;

        // If the enemy hits the edge, give it a new random direction
        if (this.body.x < 0 || this.body.x > width || this.body.y < 0 || this.body.y > height) {
            // Move back toward the center slightly to avoid getting stuck
            this.body.direction = this.body.angleTo(width / 2, height / 2) + random(-20, 20);
        }

        // Occasionally change direction randomly for more "organic" movement
        if (random(100) < 1) { 
            this.body.direction += random(-45, 45);
        }
    }

    takeDamage(amount) {
        this.body.health -= amount;
        if (this.body.health <= 0) {
            this.body.remove();
        }
    }

}
