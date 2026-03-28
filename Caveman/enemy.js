class Enemy {
    constructor(x, y, w = 20, h = 20, options = {}) {
        this.body = new Sprite(x, y, w, h);

        this.body.health = options.health !== undefined ? options.health : 100;
        this.body.damage = options.damage !== undefined ? options.damage : 10;
        this.body.speed = options.speed !== undefined ? options.speed : 1;
        this.body.color = options.color || 'red';
        this.body.type = options.type || 'basic';

        this.body.direction = 1; // 1 for right, -1 for left
        this.body.rotationLock = true;
    }

    update() {
        this.vel.x = this.direction * this.speed;
         
        if (this.x < 0 || this.x > innerWidth) {
            this.direction *= -1;
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.remove();
        }
    }
}