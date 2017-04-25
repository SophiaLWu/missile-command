# Missile Command
This is the classic [Atari Missile Command](https://en.wikipedia.org/wiki/Missile_Command) game rebuilt using HTML5 Canvas.

This is a project as described in [The Odin Project](http://www.theodinproject.com/courses/javascript-and-jquery/lessons/building-games-with-canvas).

[Play the game!](https://sophialwu.github.io/missile-command/)

## Game Instructions
The player has six cities that must be defended from enemy missiles. The player can launch counter-missiles from one of three batteries by clicking on a location. The counter-missiles explode upon reaching that location, leaving behind a fireball that can destroy any enemy missile that enters it. Enemy missiles can target both cites and batteries.

Each battery only can shoot ten counter-missiles. When one battery runs out of missiles, the next closest battery will take over.

A level ends when all enemy missiles are destroyed or reach their targets. After each level, the cities and batteries are rebuilt and the batteries' missile stocks are replenished. Each level gets progressively harder and harder, with enemy missiles being fired more frequently.

The player loses the game when all of its cities and batteries are destroyed.


## Todo
- Make the missiles, explosions, buildings look nicer (maybe some images?)
- Add a scoring system
- Have cities only rebuild between levels if players reach a certain amount of points
- Add pause and restart functionality during the game
- Add special enemy weapons (such as bomber planes and satellites)