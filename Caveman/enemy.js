const ENEMY_TYPE = {
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
    },
}

class Enemy {
    constructor(x, y, w = 20, h = 20, options = {}) {
        // If a group is provided, create the sprite within it
        if (options.group) {
            this.body = new options.group.Sprite(x, y, w, h);
        } else {
            this.body = new Sprite(x, y, w, h);
        }

        const typeData = ENEMY_TYPE[options.type] || {};
        this.body.enemyType = options.type || 'basic'; // explicitly set for player.js
        this.body.type = options.type || 'basic';
        this.body.enemyData = typeData; // Attach the full data object to the sprite
        this.body.health = options.health !== undefined ? options.health : (typeData.health || 100);
        this.body.damage = options.damage !== undefined ? options.damage : (typeData.damage || 10);
        this.body.speed = options.speed || (typeData.speed || 2);
        this.body.color = options.color || 'red';

        // Add spritesheet handling
        if (options.spriteSheetImage) {
            // Use the frame assigned to the type, or a random one if type is unknown
            let frameIndex = typeData.frame !== undefined ? typeData.frame : floor(random(5));
            
            // Add a static animation using these 5 frames across 3 rows
            this.body.addAni('idle', options.spriteSheetImage, {
                w: 16,
                h: 16,
                frames: [
                    [0, 1], [1, 1], // Row 1 (green, blue)
                    [0, 2], [1, 2], // Row 2 (red, orange)
                    [0, 3]          // Row 3 (purple)
                ]
            });
            this.body.ani = 'idle';
            this.body.ani.frame = frameIndex;
            this.body.ani.stop();
        }
        
        // Random movement setup
        this.body.rotationLock = true;
        this.body.direction = random(0, 360);
    }
    update() {
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
