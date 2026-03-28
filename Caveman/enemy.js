// The Enemy class needs to be defined after p5play has initialized Sprite.
// Since p5play attaches things to the p5 prototype, we can define the class 
// inside a variable that gets initialized in setup, or just define it globally
// but extend Sprite only when it exists.

let Enemy;

// Using a function to initialize the class once p5play is ready
function initEnemyClass() {
    if (Enemy) return; // Already initialized

    Enemy = class extends Sprite {
        /**
         * @param {number} x - The x-coordinate
         * @param {number} y - The y-coordinate
         * @param {number} w - The width
         * @param {number} h - The height
         * @param {Object} options - Custom settings for the enemy
         */
        constructor(x, y, w = 32, h = 48, options = {}) {
            super(x, y, w, h);
            
            // Customizable attributes
            this.health = options.health !== undefined ? options.health : 100;
            this.damage = options.damage !== undefined ? options.damage : 10;
            this.speed = options.speed !== undefined ? options.speed : 2;
            this.color = options.color || 'red';
            this.type = options.type || 'basic';
            
            // Initial state
            this.direction = 1; // 1 for right, -1 for left
            this.rotationLock = true; 
        }

        // Default update behavior
        update() {
            this.vel.x = this.direction * this.speed;

            if (this.x < 0 || this.x > width) {
                this.direction *= -1;
            }
        }

        takeDamage(amount) {
            this.health -= amount;
            if (this.health <= 0) {
                this.remove();
            }
        }
    };
    
    window.Enemy = Enemy;
    console.log('Enemy class initialized');
}

// We can use p5's preload or setup to ensure this runs at the right time
// But for simplicity, we'll just call it at the start of setup in sketch.js
