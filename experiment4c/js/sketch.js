"use strict";

/* global XXH, p3_tileWidth, p3_tileHeight */
/* exported p3_preload, p3_setup, p3_worldKeyChanged, p3_tileClicked, p3_drawBefore, p3_drawTile, p3_drawSelectedTile, p3_drawAfter */

let rockTextures = [];
let rocks = {}; // Stores data for each boat

function p3_preload() {
  rockTextures.push(loadImage("https://cdn.glitch.global/036b055e-2d7e-43af-9f58-0dfb921e6a93/better%20rock%20asset(2).png?v=1714531441224"));
  rockTextures.push(loadImage("https://cdn.glitch.global/036b055e-2d7e-43af-9f58-0dfb921e6a93/Better%20rock%20asset.png?v=1714531387327"));
}

function p3_setup() {}

let worldSeed;

function p3_worldKeyChanged(key) {
  worldSeed = XXH.h32(key, 0);
  noiseSeed(worldSeed);
  randomSeed(worldSeed);
  rocks = {}; // Reset boats when the world key changes
}

function p3_tileWidth() {
  return 16;
}

function p3_tileHeight() {
  return 8;
}

function p3_drawBefore() {
  background("#712F79");
}

function p3_drawTile(i, j) {
  noStroke();

  //colors
  const veryLightOozeColor = color("#F54952"); 
  const lightOozeColor = color("#AE2D68"); 
  const midtoneOozeColor = color("#660F56"); 
  const darkOozeColor = color("#280659"); 

  // Calculate ripple effect 
  const rippleFrequency = 0.2; 
  const rippleSpeed = 0.00110; 
  const rippleAmplitude = 5;
  const currentTime = millis();
  const ripplePhase = currentTime * rippleSpeed + i * rippleFrequency;
  const rippleEffect = sin(ripplePhase) * rippleAmplitude;

  // Interpolate between colors 
  let colorEffect;
  if (rippleEffect < -2.5) {
    colorEffect = lerpColor(veryLightOozeColor, lightOozeColor, map(rippleEffect, -5, -2.5, 0, 1));
  } else if (rippleEffect < 2.5) {
    colorEffect = lerpColor(lightOozeColor, midtoneOozeColor, map(rippleEffect, -2.5, 2.5, 0, 1));
  } else {
    colorEffect = lerpColor(midtoneOozeColor, darkOozeColor, map(rippleEffect, 2.5, 5, 0, 1));
  }

  fill(colorEffect); 

  push();
  translate(0, rippleEffect); 
  beginShape();
  vertex(-p3_tileWidth(), 0);
  vertex(0, p3_tileHeight());
  vertex(p3_tileWidth(), 0);
  vertex(0, -p3_tileHeight());
  endShape(CLOSE);

  // draw rock
  const tileKey = `${i}_${j}`;
  if (!rocks[tileKey] && XXH.h32(tileKey, worldSeed).toNumber() % 100 < 10) {
    rocks[tileKey] = {
      textureIndex: Math.floor(random() * rockTextures.length) 
    };
  }
  if (rocks[tileKey]) {
    drawRock(rocks[tileKey].textureIndex);
  }

  pop();
}

function drawRock(textureIndex) {
  const scale = (p3_tileWidth() * 2) / 64;
  image(rockTextures[textureIndex], 0, -30, 64 * scale, 64 * scale);
}

function p3_tileClicked(i, j) {
  // This function can still handle interactions as needed
}

function p3_drawSelectedTile(i, j) {
  // noFill();
  fill(0);
  //text("tile " + [i, j], 0, 0);
}


function p3_drawAfter() {}