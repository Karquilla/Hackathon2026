class Enemy {
    constructor(x, y, w = 20, h = 20, options = {}) {
        this.body = new Sprite(x, y, w, h);

        this.body.x = x;
        this.body.y = y;
        this.body.health = options.health !== undefined ? options.health : 100;
        this.body.damage = options.damage !== undefined ? options.damage : 10;
        // this.body.speed = options.speed !== undefined ? options.speed : 0;
        this.body.color = options.color || 'red';
        this.body.type = options.type || 'basic';

        this.body.rotationLock = true;
    }

    update() {
         
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.body.health <= 0) {
            this.body.remove();
        }
    }
}