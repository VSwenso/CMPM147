// sketch.js - purpose and description here
// Author: Tory Swenson
// Date: 05/07/24

/* exported preload, setup, draw */
/* global memory, dropper, restart, rate, slider, activeScore, bestScore, fpsCounter */
//code from Wes Modes 

let bestDesign;
let currentDesign;
let currentScore;
let currentInspiration;
let currentCanvas;
let currentInspirationPixels;

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
  currentCanvas = createCanvas(width, height);
  currentCanvas.parent(document.getElementById("active"));
  currentScore = Number.NEGATIVE_INFINITY;
  currentDesign = initDesign(currentInspiration);
  bestDesign = currentDesign;
  image(currentInspiration.image, 0,0, width, height);
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
  mutateDesign(currentDesign, currentInspiration, slider.value/100.0);
  
  randomSeed(0);
  renderDesign(currentDesign, currentInspiration);
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

function p4_inspirations() {
  return [
    {
      name: "rose",
      assetUrl: "https://cdn.glitch.global/ea12f9d7-b29f-4cea-84f0-e146d84ccc1f/roseimg.webp?v=1715039030735",
      credit: "https://www.shutterstock.com/image-photo/santa-cruz-beach-boardwalk-wild-california-1334084054"
    },
    {
      name: "google logo",
      assetUrl: "https://cdn.glitch.global/ea12f9d7-b29f-4cea-84f0-e146d84ccc1f/googimg.png?v=1715039028122",
      credit: "https://www.ronaldsaunders.com/photo/arch-at-sunset-no-2/"
    },
    {
      name: "apple logo",
      assetUrl: "https://cdn.glitch.global/ea12f9d7-b29f-4cea-84f0-e146d84ccc1f/appimg.webp?v=1715039033585",
      credit: "https://www.stevencastrophotography.com/print-shop/walton-lighthouse-santa-cruz-harbor-3546"
    }
  ];
}

function p4_initialize(inspiration) {
  let scaleFactor = 4;
  resizeCanvas(inspiration.image.width / scaleFactor, inspiration.image.height / scaleFactor);
  let design = {
    bg: 128,
    shapeType: shapeDropdown.value,
    shapes: Array(1000).fill().map(() => {
      let x = random(width);
      let y = random(height);
      let col = inspiration.image.get(x * scaleFactor, y * scaleFactor);
      return {
        x: x,
        y: y,
        w: random(width / 8), // Reduce the maximum width
        h: random(height / 8), // Reduce the maximum height
        fill: color(col[0], col[1], col[2])
      };
    })
  };
  return design;
}

function p4_render(design, inspiration) {
  background(design.bg);
  noStroke();
  for (let shape of design.shapes) {
    fill(shape.fill);
    if (design.shapeType === "rect") {
      rect(shape.x, shape.y, shape.w, shape.h);
    } else if (design.shapeType === "ellipse") {
      ellipse(shape.x, shape.y, shape.w, shape.h);
    } else if (design.shapeType === "triangle") {
      triangle(shape.x, shape.y, shape.x + shape.w, shape.y, shape.x, shape.y + shape.h);
    }
  }
}

function mut(num, min, max, rate) {
  return constrain(randomGaussian(num, (rate * (max - min)) / 20), min, max);
}

function p4_mutate(design, inspiration, rate) {
  design.bg = mut(design.bg, 0, 255, rate);
  let scaleFactor = 4;
  design.shapes.forEach(shape => {
    shape.x = mut(shape.x, 0, width, rate);
    shape.y = mut(shape.y, 0, height, rate);
    shape.w = mut(shape.w, 0, width / 8, rate); // Reduce the maximum width
    shape.h = mut(shape.h, 0, height / 8, rate); // Reduce the maximum height
    let col = inspiration.image.get(shape.x * scaleFactor, shape.y * scaleFactor);
    shape.fill = color(col[0], col[1], col[2]);
  });
}