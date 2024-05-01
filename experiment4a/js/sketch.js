
"use strict";

/* global XXH */
/* exported --
    p3_preload
    p3_setup
    p3_worldKeyChanged
    p3_tileWidth
    p3_tileHeight
    p3_tileClicked
    p3_drawBefore
    p3_drawTile
    p3_drawSelectedTile
    p3_drawAfter
*/

function p3_preload() {}

function p3_setup() {}

let worldSeed;
let lastColorUpdateTime = 0;
let ringColors = {};
let colorChange = 25
let updateFrequency = 250    // how many millis before each color updates

function p3_worldKeyChanged(key) {
  worldSeed = XXH.h32(key, 0);
  noiseSeed(worldSeed);
  randomSeed(worldSeed);
  lastColorUpdateTime = 0;
  ringColors = {};
}

function p3_tileWidth() {
  return 32;
}
function p3_tileHeight() {
  return 16;
}

let [tw, th] = [p3_tileWidth(), p3_tileHeight()];

let clicks = {};

function p3_tileClicked(i, j) {
  let key = [i, j];
  clicks[key] = 1 + (clicks[key] | 0);
}

function p3_drawBefore() {}

function p3_drawTile(i, j) {
  noStroke();

  // Calculate distance from the center (0,0) tile
  let distance = Math.sqrt(i * i + j * j);
  if (i === 0 || j === 0) {
    distance += 1;
  }

  // Calculate the number of rings needed based on distance
  let numRings = Math.ceil(distance);

  // Check if it's time to update the colors of each ring (every 5 seconds)
  if (millis() - lastColorUpdateTime >= updateFrequency) {
    // Iterate over each ring color and adjust it
    for (let ring in ringColors) {
      let colorChangeR = random(25)|0 + 15
      let colorChangeG = random(25)|0 + 15
      let colorChangeB = random(25)|0 + 15
      colorChange = (colorChangeR+colorChangeG+colorChangeB)/3 | 0
      let currentColor = ringColors[ring];
      let newColor = color((currentColor.levels[0] + colorChangeR) % 256, (currentColor.levels[1] + colorChangeG) % 256, (currentColor.levels[2] + colorChangeB) % 256);
      ringColors[ring] = newColor;
    }
    lastColorUpdateTime = millis();
  }

  // Seed for the current ring
  randomSeed(worldSeed + 3 * numRings - colorChange);

  // Determine color based on distance from origin and ring number
  let tileColor;
  if (numRings in ringColors) {
    tileColor = ringColors[numRings];
  } else {
    // Generate a random color for the tile
    tileColor = color(random(255), random(255), random(255));
    ringColors[numRings] = tileColor;
  }

  fill(tileColor);

  // Draw tile shape
  push();
  beginShape();
  vertex(-tw, 0);
  vertex(0, th);
  vertex(tw, 0);
  vertex(0, -th);
  endShape(CLOSE);
  pop();
  
  randomSeed(worldSeed)
}

function p3_drawSelectedTile(i, j) {
  noFill();
  stroke(0, 255, 0, 128);

  beginShape();
  vertex(-tw, 0);
  vertex(0, th);
  vertex(tw, 0);
  vertex(0, -th);
  endShape(CLOSE);

  noStroke();
  fill(0);
}

function p3_drawAfter() {}
