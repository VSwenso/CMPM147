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

let worldSeed;
let tileWidth, tileHeight;
let clicks = {};

function p3_preload() {}

function p3_setup() {}

function p3_worldKeyChanged(key) {
  worldSeed = XXH.h32(key, 0);
  noiseSeed(worldSeed);
  randomSeed(worldSeed);
  clicks = {}
}

function p3_tileWidth() {
  return 32;
}

function p3_tileHeight() {
  return 16;
}

function p3_tileClicked(i, j) {
  // Store clicked tile
  let key = [i, j];
  clicks[key] = {
    start: millis(), // Record the start time of the animation
    duration: 15000, // Animation duration (in milliseconds)
  };

  // Store surrounding tiles within a maximum distance of 100
  for (let dx = -100; dx <= 100; dx++) {
    for (let dy = -100; dy <= 100; dy++) {
      let x = i + dx;
      let y = j + dy;
      let dist = Math.sqrt(dx * dx + dy * dy); // Calculate Euclidean distance
      if (dist <= 100) {
        let delay = dist * 200; // Calculate delay based on distance (adjust as needed)
        let key = [x, y];
        clicks[key] = {
          start: millis() + delay, // Add delay to the start time
          duration: 5000, // Animation duration (in milliseconds)
        };
      }
    }
  }
}

function p3_drawBefore() {}

function p3_drawTile(i, j) {
  let key = [i, j];
  let isClicked = clicks[key];

  if (isClicked) {
    let timeElapsed = millis() - isClicked.start;
    let yOffset = sin(timeElapsed * 0.020) * (worldSeed%50); // Increased frequency by multiplying timeElapsed by 0.004

    push();
    translate(0, -yOffset); // Apply vertical offset

    noStroke();
    if (XXH.h32("tile:" + [i, j], worldSeed) % 4 == 0) {
      //fill(0, 0, 159);
      fill(0,0,0)
    } else {
      //fill(0, 0, 201);
      fill(0,0,0)
    }

    let [tw, th] = [p3_tileWidth(), p3_tileHeight()];

    beginShape();
    vertex(-tw, 0);
    vertex(0, th);
    vertex(tw, 0);
    vertex(0, -th);
    endShape(CLOSE);

    pop();

    // Check if animation duration has elapsed
    if (timeElapsed >= isClicked.duration) {
      delete clicks[key]; // Remove the tile from the clicks object
    }
  } else {
    // Regular tile rendering
    noStroke();
    if (XXH.h32("tile:" + [i, j], worldSeed) % 4 == 0) {
      //fill(0, 0, 159);
      fill(255,255,255,26)
    } else {
      //fill(0, 0, 201);
      fill(0,0,0)
    }

    let [tw, th] = [p3_tileWidth(), p3_tileHeight()];

    beginShape();
    vertex(-tw, 0);
    vertex(0, th);
    vertex(tw, 0);
    vertex(0, -th);
    endShape(CLOSE);
  }
}

function p3_drawSelectedTile(i, j) {
  noFill();
  stroke(0, 0, 0);

  let [tw, th] = [p3_tileWidth(), p3_tileHeight()];

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