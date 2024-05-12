"use strict";

/* global XXH, p3_tileWidth, p3_tileHeight */
/* exported p3_preload, p3_setup, p3_worldKeyChanged, p3_tileClicked, p3_drawBefore, p3_drawTile, p3_drawSelectedTile, p3_drawAfter */

let rockPhotos = [];
let rocks = {}; // Stores data for each rock

function p3_preload() {
  //rock assets are from Evan Gassman on Vecteezy
  rockPhotos.push(loadImage("https://cdn.glitch.global/036b055e-2d7e-43af-9f58-0dfb921e6a93/better%20rock%20asset(2).png?v=1714531441224"));
  rockPhotos.push(loadImage("https://cdn.glitch.global/036b055e-2d7e-43af-9f58-0dfb921e6a93/Better%20rock%20asset.png?v=1714531387327"));
}

function p3_setup() {}
let worldSeed;

function p3_worldKeyChanged(key) {
  worldSeed = XXH.h32(key, 0);
  noiseSeed(worldSeed);
  randomSeed(worldSeed);
  rocks = {}; // Reset rocks when the world key changes
}

function p3_tileWidth() {
  return 16;
}

function p3_tileHeight() {
  return 8;
}

function p3_drawBefore() {
 // Create a linear gradient between black and purple
  const gradientHeight = height;
  const gradientWidth = width;

  // Create the linear gradient
  const gradient = drawingContext.createLinearGradient(
    0, 0, 0, gradientHeight
  );

  // Define the gradient colors and positions
  gradient.addColorStop(0, color(0, 0, 0)); // Black at the top
  gradient.addColorStop(1, color(113, 47, 121)); // Purple at the bottom

  // Set the gradient as the background
  drawingContext.fillStyle = gradient;
  drawingContext.fillRect(0, 0, gradientWidth, gradientHeight);
}

function p3_drawTile(i, j) {
  noStroke();

  // Define colors for the ooze
  const veryLightOozeColor = color("#F54952");
  const lightOozeColor = color("#AE2D68");
  const midtoneOozeColor = color("#660F56");
  const darkOozeColor = color("#280659");

  // Calculating ripple effect
  const rippleFrequency = 0.2;
  const rippleSpeed = 0.00110;
  const rippleAmplitude = 5;
  const currTime = millis(); //using millis
  const directionSpeed = 0.0002; // Adjust this value to control the speed of direction change
  const directionPhase = currTime * directionSpeed;
  const ripplePhase = currTime * rippleSpeed - i * rippleFrequency * cos(directionPhase); 
  const rippleEffect = sin(ripplePhase) * rippleAmplitude; //sin function

  // Calculating color phase
  const colorSpeed = 0.0007; // Adjust this value to control the speed of color cycling
  const colorPhase = currTime * colorSpeed;

  // Interpolate between colors - ripple effect and color phase
  let colorEffect;
  if (rippleEffect < -2.5) {
    colorEffect = lerpColor(
      lerpColor(veryLightOozeColor, lightOozeColor, colorPhase % 1),
      lerpColor(lightOozeColor, midtoneOozeColor, colorPhase % 1),
      map(rippleEffect, -6, -3.5, 0, 2)
    );
  } else if (rippleEffect < 2.5) {
    colorEffect = lerpColor(
      lerpColor(lightOozeColor, midtoneOozeColor, colorPhase % 1),
      lerpColor(midtoneOozeColor, darkOozeColor, colorPhase % 1),
      map(rippleEffect, -3.5, 3.5, 0, 2)
    );
  } else {
    colorEffect = lerpColor(
      lerpColor(midtoneOozeColor, darkOozeColor, colorPhase % 1),
      lerpColor(darkOozeColor, veryLightOozeColor, colorPhase % 1),
      map(rippleEffect, 3.5, 6, 0, 2)
    );
  }

fill(colorEffect);
  push();
  translate(0, rippleEffect);

  // Draw polygon instead of square
  const polygonSides = 6; // Change this value to adjust the number of sides
  const polygonRadius = min(p3_tileWidth(), p3_tileHeight()) / 2; // Radius based on tile dimensions
  drawPolygon(polygonSides, polygonRadius);

  // draw rocks
  const tileKey = `${i}_${j}`;
  if (!rocks[tileKey] && XXH.h32(tileKey, worldSeed).toNumber() % 100 < 10) {
    rocks[tileKey] = {
      textureIndex: Math.floor(random() * rockPhotos.length)
    };
  }

  if (rocks[tileKey]) {
    drawRock(rocks[tileKey].textureIndex);
  }

  pop();
}
function drawRock(textureIndex) {
  const scale = (p3_tileWidth() * 2) / 32;
  image(rockPhotos[textureIndex], 0, -30, 32 * scale, 30 * scale);
}

function p3_tileClicked(i, j) {
}

function p3_drawSelectedTile(i, j) {
  // noFill();
  fill(0);
  text("tile " + [i, j], 0, 0);
}

function drawPolygon(sides, radius) {
  beginShape();
  for (let i = 0; i < sides; i++) {
    const angle = TWO_PI * i / sides;
    const x = radius * cos(angle);
    const y = radius * sin(angle);
    vertex(x, y);
  }
  endShape(CLOSE);
}

function p3_drawAfter() {}
