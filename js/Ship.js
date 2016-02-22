function Ship(game, x, y, imgKey, vx0, vy0) {
    // Static variables for Ship
    Ship.cooldown = 300;
    // Constructor and instance variables
    Sphere.call(this, game, x, y, imgKey, vx0, vy0);
    //this.body.kinematic = true;
    this.maxHealth = 100;
    this.health = 100;
    this.nextFire = 0;
    this.steer = function (t) {
        this.body.angle += t;
        this.body.setZeroRotation();
    };
    this.fire = function (bulletPool) {
        if (this.game.time.now > this.nextFire) {
            var bullet = bulletPool.getFirstExists(false);
            if (bullet) {
                bullet.reset(this.x, this.y);
                bullet.body.rotation = this.body.rotation;
                bullet.body.thrust(VBULLET * 200);
                this.nextFire = this.game.time.now + Ship.cooldown;
            }
        }
    };
}
Ship.prototype = Object.create(Sphere.prototype);
Ship.prototype.constructor = Ship;

function AutoShip(game, x, y, imgKey, vx0, vy0) {
    // Static variables
    AutoShip.IDLE = 0;
    AutoShip.BUSY = 1;
    AutoShip.WANDER = 2;
    AutoShip.FLOATING = 3;
    AutoShip.BALANCE = 4;
    AutoShip.wanderWait = 3000;
    // Constructor and instance variables
    Ship.call(this, game, x, y, imgKey, vx0, vy0);
    this.bulletPool = null;
    // AI Components
    this.fireSensor = this.body.addRectangle(4, 100, 0, -100);
    this.fireSensor.sensor = true;
    this.lFireSensor = this.body.addRectangle(40, 100, -30, -100);
    this.lFireSensor.sensor = true;
    this.rFireSensor = this.body.addRectangle(40, 100, 30, -100);
    this.rFireSensor.sensor = true;
    this.frontSensor = this.body.addRectangle(this.width, this.height, 0, -this.height);
    this.frontSensor.sensor = true;
    this.leftSensor = this.body.addRectangle(this.width, this.height, -this.width/2, -this.height/2);
    this.leftSensor.sensor = true;
    this.rightSensor = this.body.addRectangle(this.width, this.height, this.width/2, -this.height/2);
    this.rightSensor.sensor = true;
    this.backSensor = this.body.addCapsule(this.width, this.height/2, 0, this.height/2);
    this.backSensor.sensor = true;

    this.primaryState = AutoShip.IDLE;
    this.secondaryState = AutoShip.FLOATING;
    this.busy = false;
    this.target = 0;
    this.lTarget = 0;
    this.rTarget = 0;
    this.frontDanger = 0;
    this.backDanger = 0;
    this.wanderTimer = 3000;
    
    this.update = function() {
        game.world.wrap(this.body, this.width / 2);
        // AI Danger Countermeasure
        if (this.backDanger + this.frontDanger + this.target + this.lTarget + this.rTarget > 0) {
            this.primaryState = AutoShip.BUSY;
            this.busy = true;
        } else if (this.primaryState == AutoShip.BUSY) {
            this.primaryState = AutoShip.IDLE;
            this.busy = false;
        }
        if (this.backDanger > 0) {
            this.accelerate(SHIPACC);
        } else if (this.frontDanger > 0) {
            this.accelerate(-SHIPACC);
        }
        if (this.target > 0) {
            this.fire(this.bulletPool);
        } else if (this.lTarget > 0) {
            this.steer(-SHIPSTEER);
        } else if (this.rTarget > 0) {
            this.steer(SHIPSTEER);
        }
        // AI Stabilization
        if (this.primaryState != AutoShip.BUSY && (Math.abs(this.body.velocity.x) > 100 || Math.abs(this.body.velocity.y) > 100)) {
            this.secondaryState = AutoShip.BALANCE;
        }
        if (this.secondaryState == AutoShip.BALANCE) {
            this.balance();
        }
        // AI Active Patrol
        if (this.primaryState == AutoShip.BUSY) {
            this.wanderTimer = game.time.now + AutoShip.wanderWait;
        }
        if (this.wanderTimer < game.time.now) {
            this.primaryState = AutoShip.WANDER;
        }
        if (this.primaryState == AutoShip.WANDER) {
            this.wander();
        }
        //if (this.game.time.now > this.wanderTimer) {
        //    this.accelerate(SHIPACC);
        //    this.wanderTimer += 300;
        //}
    };

    this.balance = function() {
        if (Math.abs(this.body.velocity.y) > 10) {
            // Balancing vY
            if ((-Math.PI/2 < this.body.rotation && this.body.rotation < -AI_BAL) || (AI_BAL < this.body.rotation && this.body.rotation <= Math.PI/2)) {
                this.steer(-sign(this.body.rotation) * SHIPSTEER);
            } else if ((-Math.PI+AI_BAL < this.body.rotation && this.body.rotation <= -Math.PI/2) || (Math.PI/2 < this.body.rotation && this.body.rotation < Math.PI-AI_BAL)) {
                this.steer(sign(this.body.rotation) * SHIPSTEER);
            } else {
                if (-AI_BAL < this.body.rotation && this.body.rotation < AI_BAL) {
                    this.accelerate(sign(this.body.velocity.y) * SHIPACC);
                } else {
                    this.accelerate(-sign(this.body.velocity.y) * SHIPACC);
                }
            }
        } else if(Math.abs(this.body.velocity.x) > 10) {
            // Balancing vX
            if ((0 < this.body.rotation && this.body.rotation < Math.PI/2 - AI_BAL) || (Math.PI/2 + AI_BAL < this.body.rotation && this.body.rotation <= Math.PI)) {
                this.steer(-sign(this.body.rotation - Math.PI/2) * SHIPSTEER);
            } else if ((-Math.PI < this.body.rotation && this.body.rotation < -Math.PI/2 - AI_BAL) || (-Math.PI/2 + AI_BAL < this.body.rotation && this.body.rotation <= 0)) {
                this.steer(sign(this.body.rotation - Math.PI/2) * SHIPSTEER);
            } else {
                if (Math.PI/2 - AI_BAL < this.body.rotation && this.body.rotation < Math.PI/2 + AI_BAL) {
                    this.accelerate(-sign(this.body.velocity.x) * SHIPACC);
                } else {
                    this.accelerate(sign(this.body.velocity.x) * SHIPACC);
                }
            }
        } else {
            this.secondaryState = AutoShip.FLOATING;
        }
    };

    this.wander = function() {
        if (this.secondaryState != AutoShip.BALANCE) {
            var seed = Math.random() * 100;
            if (seed < 5) {
                this.accelerate(SHIPACC);
            } else if (seed < 15) {
                this.steer(SHIPSTEER);
            } else if (seed < 25) {
                this.steer(-SHIPSTEER);
            }
        }
    }
}
AutoShip.prototype = Object.create(Ship.prototype);
AutoShip.prototype.constructor = AutoShip;

function sign(x) {
    return typeof x === 'number' ? x ? x < 0 ? -1 : 1 : x === x ? 0 : NaN : NaN;
}