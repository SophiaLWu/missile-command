
// Variables and constants
var CANVAS_WIDTH = 800;
var CANVAS_HEIGHT = 600;
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
  if (game.gameover) {
    game.drawGameoverScreen();
  } else {
    if (game.start) {
      game.drawLevelScreen();
      counterMissiles.forEach(function(counterMissile) {
        if (counterMissile.active) counterMissile.draw("green");
      });
      enemyMissiles.forEach(function(enemyMissile) {
        if (enemyMissile.active) enemyMissile.draw("red");
      });
      explosions.forEach(function(explosion) {
        explosion.draw();
      });
    } else  {
      game.drawTitleScreen();
    }
    batteries.forEach(function(battery) {
      if (battery.active) {
        battery.draw("yellow");
        battery.drawAvailableMissiles();
      }
    });
    cities.forEach(function(city) {
      if (city.active) city.draw("brown");
    });
  }
  game.drawEnvironment();
};
// Update canvas
var update = function() {
  if (game.gameover) {
    canvas.removeEventListener("mousedown", fireMissile, false);
    canvas.removeEventListener("mousedown", startGame, false);
    canvas.addEventListener("mousedown", restartGame, false);
  } else {
    if (game.start) {
      canvas.removeEventListener("mousedown", startGame, false);
      canvas.removeEventListener("mousedown", restartGame, false);
      canvas.addEventListener("mousedown", fireMissile, false);
      counterMissiles.forEach(function(counterMissile) {
        counterMissile.update();
      });
      enemyMissiles.forEach(function(enemyMissile) {
        enemyMissile.update();
      });
      explosions.forEach(function(explosion) {
        explosion.update();
      });
      if (game.completeLevel) game.startNextLevel();
    } else {
      canvas.removeEventListener("mousedown", fireMissile, false);
      canvas.removeEventListener("mousedown", restartGame, false);
      canvas.addEventListener("mousedown", startGame, false);
    }
  }
};


// Start game mouse click event
var startGame = function() {
  console.log('here');
  game.start = true;
};


// Restart game mouse click event
var restartGame = function() {
  game.restartGame();
};


// Fire missile mouse click event
var fireMissile = function(event) {
  var rect = canvas.getBoundingClientRect();
  canvasX = event.clientX - rect.left;
  canvasY = event.clientY - rect.top;
  var whichBattery;
  if (canvasY <= CANVAS_HEIGHT - 70) {
    if (0 <= canvasX && canvasX < CANVAS_WIDTH/4) {
      whichBattery = findCorrectBattery(0, 1, 2);
    } else if (CANVAS_WIDTH/4 <= canvasX && canvasX <= CANVAS_WIDTH/2) {
      whichBattery = findCorrectBattery(1, 0, 2);
    } else if (CANVAS_WIDTH/2 < canvasX && canvasX <= 3 * CANVAS_WIDTH/4) {
      whichBattery = findCorrectBattery(1, 2, 0);
    } else {
      whichBattery = findCorrectBattery(2, 1, 0);
    }
    if (whichBattery >= 0) {
      var battery = batteries[whichBattery];
      if (battery.missiles > 0) {
        battery.missiles -= 1;
        counterMissiles.push(new CounterMissile(battery));
      } 
    }
  }
};


// Helper function for fireMissile that returns the correct battery to shoot
// from given the choices of batteries to choose from (in order)
var findCorrectBattery = function(first, second, third) {
  var battery;
  if (batteries[first].active && batteries[first].missiles > 0) {
    battery = first;
  } else if (batteries[second].active && batteries[second].missiles > 0) {
    battery = second;
  } else if (batteries[third].active && batteries[third].missiles > 0) {
    battery = third;
  } else {
    battery = -1;
  }
  return battery;
};


// Game class
var Game = function() {
  this.start = false;
  this.level = 1;
  this.completeLevel = false;
  this.levelDelay = 75;
  this.tickToAddMissiles = 200;
  this.missilesPerAddition = 4;
  this.maxMissiles = 4;
  this.gameover = false;
  this.drawTitleScreen = function() {
    ctx.font = "100px Rationale";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Missile Command", CANVAS_WIDTH/2, CANVAS_HEIGHT/2 - 50);
    ctx.font = "40px Rationale";
    ctx.fillText("click to play", CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 50);
  };
  this.drawLevelScreen = function() {
    if (tick <= this.levelDelay) {
      ctx.font = "50px Rationale";
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Level " + this.level, CANVAS_WIDTH/2, CANVAS_HEIGHT/2);
    }
  }
  this.drawGameoverScreen = function() {
    ctx.font = "100px Rationale";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("GAMEOVER", CANVAS_WIDTH/2, CANVAS_HEIGHT/2 - 50);
    ctx.font = "40px Rationale";
    ctx.fillText("click to restart", CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 50);
  }
  this.drawEnvironment = function() {
    ctx.fillStyle = "yellow";
    ctx.fillRect(0, CANVAS_HEIGHT - 35, CANVAS_WIDTH, 35);
  };
  this.addEnemyMissiles = function() {
    if ((tick === this.levelDelay || 
         tick % (this.levelDelay + this.tickToAddMissiles) === 0) &&
        enemyMissiles.length < this.maxMissiles) {
      for (var i = 0; i < this.missilesPerAddition; i++) {
        enemyMissiles.push(new EnemyMissile);
      }
    }
  };
  this.createBatteries = function() {
    batteries.push(new Battery(20, CANVAS_HEIGHT - 50),
                   new Battery(CANVAS_WIDTH/2, CANVAS_HEIGHT - 50),
                   new Battery(CANVAS_WIDTH - 20, CANVAS_HEIGHT - 50))
  };
  this.createCities = function() {
    var oneFourthD = (CANVAS_WIDTH/2 - 20) / 4;
    cities.push(new City(20 + oneFourthD, CANVAS_HEIGHT - 50),
                new City(20 + 2 * oneFourthD, CANVAS_HEIGHT - 50),
                new City(20 + 3 * oneFourthD, CANVAS_HEIGHT - 50),
                new City(CANVAS_WIDTH/2 + oneFourthD, CANVAS_HEIGHT - 50),
                new City(CANVAS_WIDTH/2 + 2 * oneFourthD, CANVAS_HEIGHT - 50),
                new City(CANVAS_WIDTH/2 + 3 * oneFourthD, CANVAS_HEIGHT - 50));

  };
  this.handleCollisions = function() {
    enemyMissiles.forEach(function(missile) {
      if (missile.active) missile.collide();
    });
    explosions.forEach(function(explosion) {
      if (explosion.active) explosion.collide();
    });
  };
  this.checkCompleteLevel = function() {
    if (enemyMissiles.length === this.maxMissiles) {
      var activeEnemyMissiles = enemyMissiles.filter(function(missile) {
        return missile.active;
      });
      var activeExplosions = explosions.filter(function(explosion) {
        return explosion.active;
      });
      if (activeEnemyMissiles.length === 0 && activeExplosions.length === 0) {
        this.completeLevel = true;
      }
    }
  };
  this.resetValues = function() {
    tick = 0;
    batteries = [];
    cities = [];
    counterMissiles = [];
    enemyMissiles = [];
    explosions = [];
  };
  this.startNextLevel = function() {
    this.resetValues();
    this.createBatteries();
    this.createCities();
    this.allEnemyMissilesLaunched = false;
    this.completeLevel = false;
    this.level += 1;
    if (this.level % 3 === 0) {
      this.missilesPerAddition += 1;
    }
    if (this.tickToAddMissiles > 15) {
      this.tickToAddMissiles -= 15;
      this.maxMissiles = this.level * this.missilesPerAddition;
    }
  };
  this.checkGameover = function() {
    var activeBuildings = cities.concat(batteries).filter(function(building) {
      return building.active;
    });
    if (activeBuildings.length === 0) this.gameover = true;
  };
  this.restartGame = function() {
    this.level = 1;
    this.completeLevel = false;
    this.tickToAddMissiles = 200;
    this.missilesPerAddition = 4;
    this.maxMissiles = 4;
    this.gameover = false;
    this.resetValues();
    this.createBatteries();
    this.createCities();
  };
};


// Building class
var Building = function(x, y) {
  this.active = true;
  this.width = 30;
  this.height = 30;
  this.draw = function(color) {
    ctx.fillStyle = color;
    ctx.fillRect(this.x - this.width/2,this.y - this.height/2,
                 this.width,this.height);
  };
  this.destroy = function() {
    this.active = false;
  };
};


// Battery class
var Battery = function(x, y) {
  Building.call(this);
  this.x = x;
  this.y = y;
  this.height = 60;
  this.missiles = 10;
  this.drawAvailableMissiles = function() {
    ctx.font = "20px Rationale";
    ctx.fillStyle = "green";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.missiles, this.x, this.y - 15);
    ctx.beginPath();
    ctx.moveTo(this.x, this.y - 5);
    ctx.lineTo(this.x, this.y + 5);
    ctx.strokeStyle = "green";
    ctx.stroke();
    ctx.moveTo(this.x - 4, this.y + 5);
    ctx.lineTo(this.x + 4, this.y + 5);
    ctx.stroke();
    ctx.moveTo(this.x - 4, this.y + 5);
    ctx.lineTo(this.x - 4, this.y + 10);
    ctx.stroke();
    ctx.moveTo(this.x + 4, this.y + 5);
    ctx.lineTo(this.x + 4, this.y + 10);
    ctx.stroke();
  };
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
  this.streakWidth = 2;
  this.explode = function() {
    this.active = false;
    explosions.push(new Explosion(this.x, this.y));
  };
  this.draw = function(color) {
    ctx.fillStyle = color;
    ctx.fillRect(this.x - this.width/2,this.y - this.height/2,
                 this.width,this.height);
    ctx.beginPath();
    ctx.moveTo(this.xi, this.yi);
    ctx.lineTo(this.x, this.y);
    ctx.lineWidth = this.streakWidth;
    ctx.strokeStyle = color;
    ctx.stroke();
  };
};


// Counter Missile class
var CounterMissile = function(battery) {
  Missile.call(this);
  this.xi = battery.x;
  this.yi = battery.y - battery.height/2;
  this.x = this.xi
  this.y = this.yi
  this.xf = canvasX;
  this.yf = canvasY;
  this.xDiff = this.x - this.xf;
  this.yDiff = this.y - this.yf;
  this.angleRad = Math.atan(this.yDiff / this.xDiff);
  this.velocity = 15;
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
  this.xi = Math.floor(Math.random() * (CANVAS_WIDTH + 1));
  this.yi = 0;
  this.x = this.xi
  this.y = this.yi
  this.velocity = 2;
  this.targets = batteries.concat(cities).filter(function(building) {
    return building.active;
  });
  this.randomTarget = this.targets[Math.floor(Math.random() * 
                                              this.targets.length)];
  this.xf = this.randomTarget.x;
  this.yf = this.randomTarget.y;
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
    if (this.randomTarget.active) {
      if (this.x >= this.xf - this.randomTarget.width/2 &&
          this.x <= this.xf + this.randomTarget.width/2 &&
          this.y >= this.yf - this.randomTarget.height/2) {
        this.explode();
        this.randomTarget.destroy();
      }
    } else {
      if (this.y >= CANVAS_HEIGHT - 35) {
        this.explode();
      }
    }
  };
};

EnemyMissile.prototype = Object.create(Missile.prototype);


// Explosion class
var Explosion = function(x, y) {
  this.active = true;
  this.x = x;
  this.y = y;
  this.explodeSpeed = 0.5;
  this.radius = 3;
  this.explosionSize = 30;
  this.grow = true;
  this.shrink = false;
  this.draw = function() {
    var gradient = ctx.createRadialGradient(this.x,this.y,5,
                                            this.x,this.y,this.radius);
    gradient.addColorStop(0, "yellow");
    gradient.addColorStop(1, "orange");
    ctx.beginPath();
    ctx.arc(this.x,this.y,this.radius,0,2*Math.PI);
    ctx.fillStyle = gradient;
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
      this.active = false;
    }
  };
  this.collide = function() {
    enemyMissiles.filter(function(missile) {
      return missile.active;
    }).forEach(function(missile) {
        var xdiff = Math.abs((missile.x - missile.width/2) - this.x);
        var ydiff = Math.abs((missile.y - missile.height/2) - this.y);
        var distance = Math.sqrt(xdiff * xdiff + ydiff * ydiff);
        if (distance <= this.radius) {
          missile.explode();
        }
      }.bind(this));
  };
};


// Game execution
init();
var game = new Game;
game.createBatteries();
game.createCities();

setInterval(function() {
  if (!game.gameover) {
    tick += 1;
    game.handleCollisions();
    game.addEnemyMissiles();
    game.checkCompleteLevel();
    game.checkGameover();
  }
  draw();
  update();
}, 1000/FPS);

