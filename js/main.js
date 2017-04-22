
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


// Initial setup

var init = function() {
  var canvasElement = $("<canvas id='canvas' width='" + CANVAS_WIDTH + 
                        "' height='" + CANVAS_HEIGHT + "'></canvas>");
  canvas = canvasElement.get(0)
  ctx = canvas.getContext("2d");
  $("body").append(canvasElement);
  var battery = new Battery(CANVAS_WIDTH/2, CANVAS_HEIGHT - 50);
  batteries.push(battery);
}


// Update canvas

var update = function() {
  canvas.addEventListener("mousedown", doMouseDown, false);
  counterMissiles.forEach(function(counterMissile) {
    counterMissile.update();
  });
};

var doMouseDown = function(event) {
  canvasX = event.pageX;
  canvasY = event.pageY;
  var missile = new CounterMissile(batteries[0]);
  counterMissiles.push(missile);
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
  this.height = 10;
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
  };
  this.draw = function() {
    if (this.active) {
      ctx.fillStyle = "red";
      ctx.fillRect(this.x - this.width/2,this.y - this.height/2,
                   this.width,this.height);
    }
  };
  this.update = function() {
    if (this.travelingRight && this.x <= this.xf) {
      this.x += this.velocity * Math.cos(this.angleRad);
      this.y += this.velocity * Math.sin(this.angleRad);
    } else if (!this.travelingRight && this.x > this.xf) {
      this.x -= this.velocity * Math.cos(this.angleRad);
      this.y -= this.velocity * Math.sin(this.angleRad);
    } else {
      this.active = false;
    }
  };
};



init();

setInterval(function() {
  update();
  draw();
}, 1000/FPS);

