// Class declarations
function Body(game, x, y, imgKey, vx0, vy0) {
    Phaser.Sprite.call(this, game, x, y, imgKey);
    //this.game.physics.p2.enable(this, true);
    this.game.physics.p2.enable(this);
    this.body.damping = 0; // Zero friction in space
    this.body.velocity.x = vx0 || 0;
    this.body.velocity.y = vy0 || 0;
    this.accelerate = function(a) {
        if (this.body.dynamic) {
            this.body.thrust(2000 * a);
        } else {
            this.body.velocity.x += 50 * a * Math.cos(this.body.rotation - Math.PI / 2);
            this.body.velocity.y += 50 * a * Math.sin(this.body.rotation - Math.PI / 2);
        }
    };
}
Body.prototype = Object.create(Phaser.Sprite.prototype);
Body.prototype.constructor = Body;

function Sphere(game, x, y, imgKey, vx0, vy0) {
    Body.call(this, game, x, y, imgKey, vx0, vy0);
    //this.anchor.set(0.5, 0.5);
    //this.body.collideWorldBounds = false;
    this.update = function() {
        // World wrap
        game.world.wrap(this.body, this.width / 2);
        //if (this.body.x < 0 - this.width / 2 || this.body.x > game.world.width + this.width / 2) {
        //    console.log("x " + this.body.x);
        //    this.body.x = game.world.width - this.body.x;
        //    console.log("x2 " + this.body.x);
        //}
        //if (this.body.y < 0 - this.height / 2 || this.body.y > game.world.height + this.height / 2) {
        //    console.log("y " + this.body.x);
        //    this.body.y = game.world.height - this.body.y;
        //    console.log("y2 " + this.body.x);
        //}
    };
}
Sphere.prototype = Object.create(Body.prototype);
Sphere.prototype.constructor = Sphere;