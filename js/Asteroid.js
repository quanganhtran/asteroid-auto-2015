function Asteroid(game, x, y, imgKey, vx0, vy0, size0) {
    // Static variables
    Asteroid.BIG = 1;
    Asteroid.MEDIUM = 0.5;
    Asteroid.SMALL = 0.25;
    //Asteroid.colGr = game.physics.p2.createCollisionGroup();
    // Constructor and instance variables
    Sphere.call(this, game, x, y, imgKey, vx0, vy0);
    this.size = size0 || Asteroid.BIG;
    this.scale.setTo(this.size);
    this.body.setCircle(this.width / 2);
    //this.body.data.shapes[0].sensor = true;
    //this.body.collideWorldBounds = false;
    //this.body.setCollisionGroup(Asteroid.colGr);
    //this.body.collides(Asteroid.colGr);
    //this.shatter = function(group, fragSize, fragCount) {
    //    for (var i = 0; i < fragCount; i++) {
    //        group.add(new Asteroid(game, this.x, this.y, 'asteroid', game.rnd.realInRange(-30, 30), game.rnd.realInRange(-30, 30), fragSize));
    //    }
    //}
}
Asteroid.prototype = Object.create(Sphere.prototype);
Asteroid.prototype.constructor = Asteroid;