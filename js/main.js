
// Variables and constants

var CANVAS_WIDTH = 800;
var CANVAS_HEIGHT = 500;
var FPS = 30;
var canvas;
var ctx;
var canvasX;
var canvasY;
var counterMissiles = [];
var batteries = [];
var explosions = [];


// Initial setup

var init = function() {
  var canvasElement = $("<canvas id='canvas' width='" + CANVAS_WIDTH + 
                        "' height='" + CANVAS_HEIGHT + "'></canvas>");
  canvas = canvasElement.get(0)
  ctx = canvas.getContext("2d");
  $("body").append(canvasElement);
  batteries.push(new Battery(20, CANVAS_HEIGHT - 50),
                 new Battery(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 50),
                 new Battery(CANVAS_WIDTH - 20, CANVAS_HEIGHT - 50))
}


// Update canvas

var update = function() {
  canvas.addEventListener("mousedown", doMouseDown, false);
  counterMissiles.forEach(function(counterMissile) {
    counterMissile.update();
  });
  explosions.forEach(function(explosion) {
    explosion.update();
  });
};

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


// Draw the canvas

var draw = function() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
  batteries.forEach(function(battery) {
    battery.draw();
  });
  counterMissiles
    .filter(function(counterMissile) {
      return counterMissile.active;
    })
    .forEach(function(counterMissile) {
    counterMissile.draw();
  });
  explosions.forEach(function(explosion) {
    explosion.draw();
  });
};


// Battery class

var Battery = function(x, y) {
  this.x = x;
  this.y = y;
  this.width = 30;
  this.height = 30;
  this.draw = function() {
    ctx.fillStyle = "yellow";
    ctx.fillRect(this.x - this.width/2,this.y - this.height/2,
                this.width,this.height);
  };
};


// Counter Missile class

var CounterMissile = function(battery) {
  this.active = true;
  this.width = 6;
  this.height = 6;
  this.x = battery.x;
  this.y = battery.y;
  this.xf = canvasX;
  this.yf = canvasY;
  this.velocity = 5;
  this.xDiff = this.x - this.xf;
  this.yDiff = this.y - this.yf;
  this.travelingRight = this.xDiff <= 0 ? true : false;
  this.angleRad = Math.atan(this.yDiff / this.xDiff);
  this.explode = function() {
    this.active = false;
    explosions.push(new Explosion(this.x, this.y));
  };
  this.draw = function() {
    ctx.fillStyle = "red";
    ctx.fillRect(this.x - this.width/2,this.y - this.height/2,
                 this.width,this.height);
  };
  this.update = function() {
    if (this.active) {
      if (this.travelingRight) {
        this.x += this.velocity * Math.cos(this.angleRad);
        this.y += this.velocity * Math.sin(this.angleRad);
        if (this.x > this.xf) this.explode();
      } else if (!this.travelingRight) {
        this.x -= this.velocity * Math.cos(this.angleRad);
        this.y -= this.velocity * Math.sin(this.angleRad);
        if (this.x <= this.xf) this.explode();
      }
    }
  };
};


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



init();

setInterval(function() {
  update();
  draw();
}, 1000/FPS);

