class Enemy {
    constructor(x, y, w = 20, h = 20, options = {}) {
        // If a group is provided, create the sprite within it
        if (options.group) {
            this.body = new options.group.Sprite(x, y, w, h);
        } else {
            this.body = new Sprite(x, y, w, h);
        }

        this.body.health = options.health !== undefined ? options.health : 100;
        this.body.damage = options.damage !== undefined ? options.damage : 10;
        this.body.color = options.color || 'red';
        this.body.type = options.type || 'basic';
        
        // Random movement setup
        this.body.rotationLock = true;
        this.body.direction = random(0, 360);
        this.body.speed = options.speed || 2;
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