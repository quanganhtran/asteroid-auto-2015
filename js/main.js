/**
 * Created by Anh on 10/5/2015.
 */
// Constants
var GAME_WIDTH = 1280;
var GAME_HEIGHT = 720;
var VBULLET = 200;
var SHIPACC = 0.1;
var SHIPSTEER = 2;
var AI_BAL = 0.05;
var ASTEROID_COUNT = 8;

var game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.AUTO, "asteroid-main", {preload: preload, create: create, update: update, render: render});

// The game functions
function preload() {
    game.load.image("bg", "assets/starfield.jpg");
    game.load.image("player", "assets/player_p2.png");
    game.load.image("asteroid", "assets/asteroid.png");
    game.load.image("bullet", "assets/bullet.png");
}

var bg;
var player;
var bullets, bullet, asteroids, asteroid;
var playerCollisionGroup, bulletsCollisionGroup, asteroidsCollisionGroup;
var aKey, dKey, wKey, sKey, fireKey;
var hpInfo;

function create() {
    // Prepare physics system
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.setImpactEvents(true);
    playerCollisionGroup = game.physics.p2.createCollisionGroup();
    bulletsCollisionGroup = game.physics.p2.createCollisionGroup();
    asteroidsCollisionGroup = game.physics.p2.createCollisionGroup();
    // Set background
    bg = game.add.image(game.world.centerX, game.world.centerY, 'bg');
    bg.anchor.setTo(0.5, 0.5);
    
    // Prepare input
    aKey = game.input.keyboard.addKey(Phaser.Keyboard.A);
    dKey = game.input.keyboard.addKey(Phaser.Keyboard.D);
    wKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
    sKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
    fireKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    
    // Prepare bullets
    prepareBullet();
    // Prepare the player's ship
    preparePlayer();
    // Prepare asteroids
    prepareAsteroid();

    // Info panels
    hpInfo = game.add.text(10, 10, "HP: " + player.health, { font: '34px Arial', fill: '#fff' });

}

function preparePlayer() {
    player = new AutoShip(game, game.world.centerX, game.world.centerY, 'player');
    
    player.bulletPool = bullets;
    player.body.onBeginContact.add(sensorEngage, player);
    player.body.onEndContact.add(sensorDisengage, player);
    
    player.body.setCollisionGroup(playerCollisionGroup);
    player.body.collides(asteroidsCollisionGroup);
    game.add.existing(player);
    //player.events.onKilled.add(restart, this);
}

function prepareAsteroid() {
    asteroids = game.add.group();
    asteroids.enableBody = true;
    asteroids.physicsBodyType = Phaser.Physics.P2JS;
    for (var i = 0; i < ASTEROID_COUNT; i++) {
        asteroid = new Asteroid(game, game.rnd.realInRange(20, game.world.width - 20), game.rnd.realInRange(20, game.world.height - 20), 'asteroid', game.rnd.realInRange(-30, 30), game.rnd.realInRange(-30, 30));
        asteroids.add(asteroid);
        //asteroid.body.onBeginContact.add(impactCallback, asteroid);
        asteroid.body.setCollisionGroup(asteroidsCollisionGroup);
        asteroid.body.collides(bulletsCollisionGroup, asteroidVsBullet);
        asteroid.body.collides(playerCollisionGroup, asteroidVsPlayer);
    }
}

function prepareBullet() {
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.P2JS;
    for (var i = 0; i < 30; i++) {
        bullet = new Bullet(game, 'bullet');
        bullets.add(bullet);
        bullet.body.setCollisionGroup(bulletsCollisionGroup);
        bullet.body.collides(asteroidsCollisionGroup);
    }
}

function update() {
    // Inputs handling
    if (wKey.isDown) {
        player.accelerate(SHIPACC);
    } else if (sKey.isDown) {
        player.accelerate(-SHIPACC);
    }
    if (aKey.isDown) {
        player.steer(-SHIPSTEER);
    }
    if (dKey.isDown) {
        player.steer(SHIPSTEER);
    }
    if (fireKey.isDown) {
        player.fire(bullets);
    }
    // Update info
    hpInfo.text = "HP: " + player.health;
}

function render() {
    //game.debug.spriteInfo(player, 32, 32);
    game.debug.text("theta: " + player.body.rotation, 500, 16);
    game.debug.text("vx: " + player.body.velocity.x, 500, 32);
    game.debug.text("vy: " + player.body.velocity.y, 500, 48);

    game.debug.text("prim: " + player.primaryState, 800, 16);
    game.debug.text("sec: " + player.secondaryState, 800, 32);
}

function sensorEngage(a, b, sensor, d, e) {
    switch (sensor.id) {
        case this.leftSensor.id:
            this.frontDanger++;
            this.lTarget++;
            break;
        case this.rightSensor.id:
            this.frontDanger++;
            this.rTarget++;
            break;
        case this.frontSensor.id:
            this.frontDanger++;
            break;
        case this.backSensor.id:
            this.backDanger++;
            break;
        case this.fireSensor.id:
            this.target++;
            break;
        case this.lFireSensor.id:
            this.lTarget++;
            break;
        case this.rFireSensor.id:
            this.rTarget++;
            break;
    }
}

function sensorDisengage(a, b, sensor, d, e) {
    switch (sensor.id) {
        case this.leftSensor.id:
            this.frontDanger--;
            this.lTarget--;
            break;
        case this.rightSensor.id:
            this.frontDanger--;
            this.rTarget--;
            break;
        case this.frontSensor.id:
            this.frontDanger--;
            break;
        case this.backSensor.id:
            this.backDanger--;
            break;
        case this.fireSensor.id:
            this.target--;
            break;
        case this.lFireSensor.id:
            this.lTarget--;
            break;
        case this.rFireSensor.id:
            this.rTarget--;
            break;
    }
}

function asteroidVsPlayer(asteroid, player) {
    player.sprite.damage(asteroid.sprite.size * 80);
    asteroid.sprite.destroy();
    if (asteroids.countLiving() <= 0 || !player.sprite.alive) {
        restart();
    }
}

function asteroidVsBullet(asteroid, bullet, c, d, e, f) {
    bullet.sprite.kill();
    if (asteroid.sprite.size === Asteroid.SMALL) {
        asteroid.sprite.destroy();
    } else if (asteroid.sprite.size === Asteroid.MEDIUM) {
        for (var i = 0; i < 3; i++) {
            var frag = new Asteroid(game, asteroid.sprite.x, asteroid.sprite.y, 'asteroid', game.rnd.realInRange(-30, 30), game.rnd.realInRange(-30, 30), Asteroid.SMALL);
            asteroids.add(frag);
            frag.body.setCollisionGroup(asteroidsCollisionGroup);
            frag.body.collides(bulletsCollisionGroup, asteroidVsBullet);
            frag.body.collides(playerCollisionGroup, asteroidVsPlayer);
        }
        asteroid.sprite.destroy();
    } else {
        for (var i = 0; i < 3; i++) {
            var frag = new Asteroid(game, asteroid.sprite.x, asteroid.sprite.y, 'asteroid', game.rnd.realInRange(-30, 30), game.rnd.realInRange(-30, 30), Asteroid.MEDIUM);
            asteroids.add(frag);
            frag.body.setCollisionGroup(asteroidsCollisionGroup);
            frag.body.collides(bulletsCollisionGroup, asteroidVsBullet);
            frag.body.collides(playerCollisionGroup, asteroidVsPlayer);
        }
        asteroid.sprite.destroy();
    }
    if (asteroids.countLiving() <= 0) {
        restart();
    }
}

function restart() {
    player.revive(100);
    //player.heal(99);
    asteroids.destroy('true');
    prepareAsteroid();
}

function impactCallback(impactBody, b, c, d, e) {
    //console.log(bullet.sprite);
    //console.log(this);
    if (impactBody.sprite.key == 'bullet') {
        impactBody.sprite.kill();
    } else {
        impactBody.sprite.damage(this.size * 80);
    }
    if (impactBody.sprite.key == 'player' || this.size === Asteroid.SMALL) {
        this.destroy();
    } else if (this.size === Asteroid.MEDIUM) {
        for (var i = 0; i < 3; i++) {
            var frag = new Asteroid(game, this.x, this.y, 'asteroid', game.rnd.realInRange(-30, 30), game.rnd.realInRange(-30, 30), Asteroid.SMALL);
            asteroids.add(frag);
            frag.body.onBeginContact.add(impactCallback, frag);
            frag.body.setCollisionGroup(asteroidsCollisionGroup);
            frag.body.collides(bulletsCollisionGroup);
            frag.body.collides(playerCollisionGroup);
        }
        this.destroy();
    } else {
        for (var i = 0; i < 3; i++) {
            var frag = new Asteroid(game, this.x, this.y, 'asteroid', game.rnd.realInRange(-30, 30), game.rnd.realInRange(-30, 30), Asteroid.MEDIUM);
            asteroids.add(frag);
            frag.body.onBeginContact.add(impactCallback, frag);
            frag.body.setCollisionGroup(asteroidsCollisionGroup);
            frag.body.collides(bulletsCollisionGroup);
            frag.body.collides(playerCollisionGroup);
        }
        this.destroy();
    }
    if (asteroids.countLiving() <= 0) {
        restart();
    }
}