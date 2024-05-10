// sketch.js - purpose and description here
// Author: Tory Swenson
// Date: 05/07/24

// Here is how you might set up an OOP p5.js project
// Note that p5.js looks for a file called sketch.js

/* exported preload, setup, draw */
/* global memory, dropper, restart, rate, slider, activeScore, bestScore, fpsCounter */
/* global getInspirations, initDesign, renderDesign, mutateDesign */

let bestDesign;
let currentDesign;
let currentScore;
let currentInspiration;
let currentCanvas;
let currentInspirationPixels;
let inspirations;

function preload() {
  

  let allInspirations = getInspirations();

  for (let i = 0; i < allInspirations.length; i++) {
    let insp = allInspirations[i];
    insp.image = loadImage(insp.assetUrl);
    let option = document.createElement("option");
    option.value = i;
    option.innerHTML = insp.name;
    dropper.appendChild(option);
  }
  dropper.onchange = e => inspirationChanged(allInspirations[e.target.value]);
  currentInspiration = allInspirations[0];

  restart.onclick = () =>
    inspirationChanged(allInspirations[dropper.value]);
}

function inspirationChanged(nextInspiration) {
  currentInspiration = nextInspiration;
  currentDesign = undefined;
  memory.innerHTML = "";
  setup();
}



function setup() {
  pixelDensity(1);
  let allInspirations = getInspirations();
  for (let i = 0; i < allInspirations.length; i++) {
    let insp = allInspirations[i];
    insp.image = loadImage(insp.assetUrl);
    let option = document.createElement("option");
    option.value = i;
    option.innerHTML = insp.name;
    dropper.appendChild(option);
  }

  dropper.onchange = (e) => inspirationChanged(allInspirations[e.target.value]);
  currentInspiration = allInspirations[0];
  restart.onclick = () => inspirationChanged(allInspirations[dropper.value]);

 
  currentCanvas = createCanvas(width, height);
  currentCanvas.parent(document.getElementById("active"));
  currentScore = Number.NEGATIVE_INFINITY;
  currentDesign = initDesign(currentInspiration);
  bestDesign = currentDesign;
  image(currentInspiration.image, 0, 0, width, height);
  loadPixels();
  currentInspirationPixels = pixels;
}

function evaluate() {
  loadPixels();

  let error = 0;
  let n = pixels.length;
  
  for (let i = 0; i < n; i++) {
    error += sq(pixels[i] - currentInspirationPixels[i]);
  }
  return 1/(1+error/n);
}



function memorialize() {
  let url = currentCanvas.canvas.toDataURL();

  let img = document.createElement("img");
  img.classList.add("memory");
  img.src = url;
  img.width = width;
  img.heigh = height;
  img.title = currentScore;

  document.getElementById("best").innerHTML = "";
  document.getElementById("best").appendChild(img.cloneNode());

  img.width = width / 2;
  img.height = height / 2;

  memory.insertBefore(img, memory.firstChild);

  if (memory.childNodes.length > memory.dataset.maxItems) {
    memory.removeChild(memory.lastChild);
  }
}

let mutationCount = 0;

function draw() {
  if(!currentDesign) {
    return;
}
randomSeed(mutationCount++);
currentDesign = JSON.parse(JSON.stringify(bestDesign));
rate.innerHTML = slider.value;
mutateDesign(currentDesign, currentInspiration, slider.value/100.0); // Pass currentInspiration
randomSeed(0);
renderDesign(currentDesign, currentInspiration); // Pass currentInspiration
let nextScore = evaluate();
activeScore.innerHTML = nextScore;
if (nextScore > currentScore) {
    currentScore = nextScore;
    bestDesign = currentDesign;
    memorialize();
    bestScore.innerHTML = currentScore;
}
fpsCounter.innerHTML = Math.round(frameRate());
}

function getInspirations() {
  return [
    {
      name: "Monokuma", 
      assetUrl: "https://cdn.glitch.global/bc95f201-4fcf-45b7-83d0-664f5d9819d5/thumbnails_raf%2C360x360%2C075%2Ct%2Cfafafa_ca443f4786.jpg?v=1715126603883",
      credit: "https://images.app.goo.gl/bH72TfuJUx2xChxL7"
    },
    {
      name: "Pringles", 
      assetUrl: "https://cdn.glitch.global/bc95f201-4fcf-45b7-83d0-664f5d9819d5/images.jpg?v=1715126613749",
      credit: "https://images.app.goo.gl/v1XjdAyUkCkwaWqR6"
    },
    {
      name: "Minecraft Steve", 
      assetUrl: "https://cdn.glitch.global/bc95f201-4fcf-45b7-83d0-664f5d9819d5/thumbnails_Steve-Amiibo-6a7f690.jpg?v=1715126609696",
      credit: "https://images.app.goo.gl/pxoJvViNssD8K2cv7"
    },
    {
      name: "Disaster Girl", 
      assetUrl: "https://cdn.glitch.global/3abd0223-86fb-43ce-a00a-fde12615bcd5/girl-with-fire.jpg?v=1714778905663",
      credit: "Four-year-old Zoë Roth, 2005"
    },
  ];
}
 
function initDesign(inspiration) {
  resizeCanvas(inspiration.image.width / 2, inspiration.image.height / 2);
  let design = {
    bg: 128,
    fg: []
  };
  
  let aspectRatio = inspiration.image.width / inspiration.image.height;
  let totalRectArea = width * height; // Total area to cover with rectangles
  let totalInspirationArea = inspiration.image.width * inspiration.image.height;
  let scaleFactor = 10; // Scale factor to cover canvas
  
  let x = 0;
  let y = 0;
  
  while (y < inspiration.image.height) {
    let fillColor = inspiration.image.get(x, y);
    design.fg.push({
      x: x * 2, // Scale coordinates back to original canvas size
      y: y * 2,
      w: scaleFactor * aspectRatio,
      h: scaleFactor,
      fill: fillColor
    });
    
    x += scaleFactor;
    if (x >= inspiration.image.width) {
      x = 0;
      y += scaleFactor;
    }
  }
  
  return design;
}
function renderDesign(design, inspiration) {
 // Clear the canvas
 background(design.bg);
 noStroke();
 
 // Render foreground objects
 for(let box of design.fg) {
     // Get the fill color from the inspiration image
     let fillColor = inspiration.image.get(box.x / 2, box.y / 2); // Adjusted coordinates
     fill(fillColor, 128);
     rect(box.x, box.y, box.w, box.h);
 }
}


function mutateDesign(design, inspiration, rate) {
  design.bg = mut(design.bg, 0, 255, rate); // Color mutation for background
  for(let box of design.fg) {
      box.x = mut(box.x, 0, width, rate);
      box.y = mut(box.y, 0, height, rate);
      box.w = mut(box.w, 0, width/10, rate);
      box.h = mut(box.h, 0, height/10, rate);
      // Use inspiration data if needed
      let fillColor = inspiration.image.get(box.x / 2, box.y / 2); // Adjusted coordinates
      box.fill = fillColor;
  }
}

function mut(num, min, max, rate) {
  return constrain(randomGaussian(num, (rate * (max - min)) / 20), min, max);
}
