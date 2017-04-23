
// Variables and constants

var CANVAS_WIDTH = 800;
var CANVAS_HEIGHT = 500;
var FPS = 30;
var canvas;
var ctx;
var canvasX;
var canvasY;
var tick = 0;
var batteries = [];
var cities = [];
var counterMissiles = [];
var enemyMissiles = [];
var explosions = [];


// Initial canvas setup

var init = function() {
  var canvasElement = $("<canvas id='canvas' width='" + CANVAS_WIDTH + 
                        "' height='" + CANVAS_HEIGHT + "'></canvas>");
  canvas = canvasElement.get(0)
  ctx = canvas.getContext("2d");
  $("body").append(canvasElement);
}


// Draw the canvas

var draw = function() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
  drawEnvironment();
  batteries.forEach(function(battery) {
    battery.draw("yellow");
  });
  cities.forEach(function(city) {
    city.draw("brown");
  });
  counterMissiles.filter(function(counterMissile) {
    return counterMissile.active;
  }).forEach(function(counterMissile) {
      counterMissile.draw("green");
    });
  enemyMissiles.filter(function(enemyMissile) {
    return enemyMissile.active;
  }).forEach(function(enemyMissile) {
      enemyMissile.draw("red");
    });
  explosions.forEach(function(explosion) {
    explosion.draw();
  });
};


// Update canvas

var update = function() {
  canvas.addEventListener("mousedown", doMouseDown, false);
  counterMissiles.forEach(function(counterMissile) {
    counterMissile.update();
  });
  enemyMissiles.forEach(function(enemyMissile) {
    enemyMissile.update();
  });
  explosions.forEach(function(explosion) {
    explosion.update();
  });
};


// Draw environment
var drawEnvironment = function() {
  ctx.fillStyle = "yellow";
  ctx.fillRect(0, CANVAS_HEIGHT - 35, CANVAS_WIDTH, 35);
};

// Create batteries

var createBatteries = function() {
  batteries.push(new Battery(20, CANVAS_HEIGHT - 50),
                 new Battery(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 50),
                 new Battery(CANVAS_WIDTH - 20, CANVAS_HEIGHT - 50))
};


// Create cities

var createCities = function() {
  var oneFourthD = (CANVAS_WIDTH / 2 - 20) / 4;
  cities.push(new City(20 + oneFourthD, CANVAS_HEIGHT - 50),
              new City(20 + 2 * oneFourthD, CANVAS_HEIGHT - 50),
              new City(20 + 3 * oneFourthD, CANVAS_HEIGHT - 50),
              new City(CANVAS_WIDTH / 2 + oneFourthD, CANVAS_HEIGHT - 50),
              new City(CANVAS_WIDTH / 2 + 2 * oneFourthD, CANVAS_HEIGHT - 50),
              new City(CANVAS_WIDTH / 2 + 3 * oneFourthD, CANVAS_HEIGHT - 50));

};


// Add random enemy missiles

var addEnemyMissiles = function() {
  if (tick % 30 == 0 && enemyMissiles.length < 10) {
    enemyMissiles.push(new EnemyMissile);
  }
};


// Handles collision of enemy missiles with buildings

var handleCollisions = function() {
  enemyMissiles.forEach(function(missile) {
    if (missile.active && missile.collide()) missile.explode();
  });
};


// Mouseclick event

var doMouseDown = function(event) {
  canvasX = event.pageX;
  canvasY = event.pageY;
  var battery;
  if (canvasY <= CANVAS_HEIGHT - 70) {
    if (0 <= canvasX && canvasX < CANVAS_WIDTH / 4) {
      battery = 0;
    } else if (CANVAS_WIDTH / 4 <= canvasX && canvasX <= 3 * CANVAS_WIDTH / 4) {
      battery = 1;
    } else {
      battery = 2;
    }
    counterMissiles.push(new CounterMissile(batteries[battery]));
  }
};


// Building class

var Building = function(x, y) {
  this.width = 30;
  this.height = 30;
  this.draw = function(color) {
    ctx.fillStyle = color;
    ctx.fillRect(this.x - this.width/2,this.y - this.height/2,
                 this.width,this.height);
  };
};


// Battery class

var Battery = function(x, y) {
  Building.call(this);
  this.x = x;
  this.y = y;
};

Battery.prototype = Object.create(Building.prototype);


// City class

var City = function(x, y) {
  Building.call(this);
  this.x = x;
  this.y = y;
  this.width = 20;
};

City.prototype = Object.create(Building.prototype);


// General Missile class

var Missile = function() {
  this.active = true;
  this.width = 6;
  this.height = 6;
  this.velocity = 5;
  this.explode = function() {
    this.active = false;
    explosions.push(new Explosion(this.x, this.y));
  };
  this.draw = function(color) {
    ctx.fillStyle = color;
    ctx.fillRect(this.x - this.width/2,this.y - this.height/2,
                 this.width,this.height);
  };
};


// Counter Missile class

var CounterMissile = function(battery) {
  Missile.call(this);
  this.x = battery.x;
  this.y = battery.y;
  this.xf = canvasX;
  this.yf = canvasY;
  this.xDiff = this.x - this.xf;
  this.yDiff = this.y - this.yf;
  this.angleRad = Math.atan(this.yDiff / this.xDiff);
  this.update = function() {
    if (this.active) {
      if (this.angleRad < 0) {
        this.x += this.velocity * Math.cos(this.angleRad);
        this.y += this.velocity * Math.sin(this.angleRad);
        if (this.x > this.xf) this.explode();
      } else {
        this.x -= this.velocity * Math.cos(this.angleRad);
        this.y -= this.velocity * Math.sin(this.angleRad);
        if (this.x <= this.xf) this.explode();
      }
    }
  };
};

CounterMissile.prototype = Object.create(Missile.prototype);


// Enemy Missile class

var EnemyMissile = function() {
  Missile.call(this);
  this.x = Math.floor(Math.random() * (CANVAS_WIDTH + 1));
  this.y = 0;
  this.velocity = 2;
  this.targets = batteries.concat(cities); 
  this.targetPositions = this.targets.map(function(building) {
                  return [building.x, building.y];
                 });
  this.randomTarget = this.targetPositions[Math.floor(Math.random() * 
                                   this.targets.length)];
  this.xf = this.randomTarget[0];
  this.yf = this.randomTarget[1];
  this.xDiff = this.x - this.xf;
  this.yDiff = this.y - this.yf;
  this.angleRad = Math.atan(this.yDiff / this.xDiff);
  this.update = function() {
    if (this.active) {
      if (this.angleRad >= 0) {
        this.x += this.velocity * Math.cos(this.angleRad);
        this.y += this.velocity * Math.sin(this.angleRad);
      } else {
        this.x -= this.velocity * Math.cos(this.angleRad);
        this.y -= this.velocity * Math.sin(this.angleRad);
      }
    }
  };
  this.collide = function() {
    var collided = false;
    this.targets.forEach(function(building) {
      if (this.x >= building.x - building.width/2 &&
          this.x <= building.x + building.width/2 &&
          this.y >= building.y - building.height/2) {
        collided = true;
        return false;
      }
    }.bind(this));
    return collided;
  };
};

EnemyMissile.prototype = Object.create(Missile.prototype);


// Explosion class

var Explosion = function(x, y) {
  this.x = x;
  this.y = y;
  this.explodeSpeed = 1;
  this.radius = 3;
  this.explosionSize = 25;
  this.grow = true;
  this.shrink = false;
  this.draw = function() {
    ctx.fillStyle = "orange";
    ctx.beginPath();
    ctx.arc(this.x,this.y,this.radius,0,2*Math.PI);
    ctx.fill();
    ctx.closePath();
  };
  this.update = function() {
    if (this.grow) {
      this.radius += 1;
    } else if (this.shrink) {
      this.radius -= 1;
    }
    if (this.radius > this.explosionSize) {
      this.shrink = true;
      this.grow = false;
    }
    else if (this.shrink && this.radius === 0) {
      this.shrink = false;
    }
  };
};


// Game execution

init();
createBatteries();
createCities();

setInterval(function() {
  tick += 1;
  addEnemyMissiles();
  handleCollisions();
  update();
  draw();
}, 1000/FPS);

