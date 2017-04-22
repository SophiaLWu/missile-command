
// Setting up the canvas

var CANVAS_WIDTH = 800;
var CANVAS_HEIGHT = 500;
var FPS = 30;
var canvas;
var ctx;
var canvasX;
var canvasY;
var counterMissiles = []

var init = function() {
  var canvasElement = $("<canvas id='canvas' width='" + CANVAS_WIDTH + 
                        "' height='" + CANVAS_HEIGHT + "'></canvas>");
  canvas = canvasElement.get(0)
  ctx = canvas.getContext("2d");
  $("body").append(canvasElement);
}

init();

setInterval(function() {
  update();
  draw();
}, 1000/FPS);


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
  var missile = new CounterMissile();
  counterMissiles.push(missile);
};


// Draw the canvas

var draw = function() {
  ctx.fillStyle = "#000";
  ctx.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
  counterMissiles
    .filter(function(counterMissile) {
      return counterMissile.active;
    })
    .forEach(function(counterMissile) {
    counterMissile.draw();
  });

};


// Counter Missile class

var CounterMissile = function() {
  this.active = true;
  this.x = CANVAS_WIDTH/2;
  this.y = CANVAS_HEIGHT/2;
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
    ctx.fillStyle = "red";
    ctx.fillRect(this.x, this.y, 5, 5);
  };
  this.update = function() {
    if (this.travelingRight && this.x <= this.xf) {
      console.log(this.x, this.y, this.xf, this.yf);
      this.x += this.velocity * Math.cos(this.angleRad);
      this.y += this.velocity * Math.sin(this.angleRad);
    } else if (!this.travelingRight && this.x > this.xf) {
      this.x -= this.velocity * Math.cos(this.angleRad);
      this.y -= this.velocity * Math.sin(this.angleRad);
    }
  };
};

