function Bullet(game, key) {
    Phaser.Sprite.call(this, game, 0, 0, key);
    this.anchor.set(0.5, 0.5);
    this.game.physics.p2.enable(this);
    this.body.collideWorldBounds = false;
    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;
    this.exists = false;
}
Bullet.prototype = Object.create(Phaser.Sprite.prototype);
Bullet.prototype.constructor = Bullet;