// sketch.js - Adding in the work from glitch-living impressions. 
// Author: Tory Swenson
// Date: 04/16/24

// Here is how you might set up an OOP p5.js project
// Note that p5.js looks for a file called sketch.js

// Constants - User-servicable parts
// In a longer project I like to put these in a separate file
const VALUE1 = 1;
const VALUE2 = 2;

// Globals
let myInstance;
let canvasContainer;
var centerHorz, centerVert;

class MyClass {
    constructor(param1, param2) {
        this.property1 = param1;
        this.property2 = param2;
    }

    myMethod() {
        // code to run when method is called
    }
}

/* exported setup, draw */
function main() {
  let seed = 239;

  const grassColor = "#3f539b";
  //const skyColor = "#3a78c9";
  const stoneColor = "#08254a";
  const treeColor = "#046e85";

  function setup() {
    createCanvas(400, 200);
    createButton("reimagine").mousePressed(() => seed++);
  }

  function draw() {
    randomSeed(seed);

    background(100);

    noStroke();

      let skyTop = color('#08254a');
      let skyBottom = color('#3a78c9');
      for (let y = 0; y < height / 2; y++) {
        let inter = map(y, 0, height / 2, 0, 1);
        let skyColor = lerpColor(skyTop, skyBottom, inter);
        stroke(skyColor);
        line(0, y, width, y);
      }
      
    //fill(skyColor);
    //rect(0, 0, width, height / 2);

    fill(grassColor);
    rect(0, height / 2, width, height / 2);

    fill(stoneColor);
    beginShape();
    vertex(0, height / 2);
    const steps = 10;
    for (let i = 0; i < steps + 1; i++) {
      let x = (width * i) / steps;
      let y =
        height / 2 - (random() * random() * random() * height) / 2;
      vertex(x, y);
    }
    vertex(width, height / 2);
    endShape(CLOSE);
  
    //Draw Bushes
    const bushes = 50*random() ;
    const move = mouseX/width
    fill(treeColor); 
    for (let i = 0; i < bushes; i++) {
      let x = width * ((random() + (move/50 + millis() / 500000.0) ) % 1);
      let y = random(height / 2, height);
      let size = random(10, 20);
      ellipse(x, y, size);
    }

    fill(treeColor);
    const trees = 20*random();
    const scrub = mouseX/width;
    for (let i = 0; i < trees; i++) {
      let z = random();
      let x = width * ((random() + (scrub/50 + millis() / 500000.0) / z) % 1);
      let s = width / 50 / z;
      let y = height / 2 + height / 20 / z;
      triangle(x, y - s, x - s / 4, y, x + s / 4, y);
    }
  }
}

function resizeScreen() {
  centerHorz = canvasContainer.width() / 2; // Adjusted for drawing logic
  centerVert = canvasContainer.height() / 2; // Adjusted for drawing logic
  console.log("Resizing...");
  resizeCanvas(canvasContainer.width(), canvasContainer.height());
  // redrawCanvas(); // Redraw everything based on new size
}

// setup() function is called once when the program starts
function setup() {
  // place our canvas, making it fit our container
  canvasContainer = $("#canvas-container");
  let canvas = createCanvas(canvasContainer.width(), canvasContainer.height());
  canvas.parent("canvas-container");
  // resize canvas is the page is resized

  // create an instance of the class
  myInstance = new MyClass("VALUE1", "VALUE2");

  $(window).resize(function() {
    resizeScreen();
  });
  resizeScreen();
}

// draw() function is called repeatedly, it's the main animation loop
function draw() {
  background(220);    
  // call a method on the instance
  myInstance.myMethod();

  // Set up rotation for the rectangle
  push(); // Save the current drawing context
  translate(centerHorz, centerVert); // Move the origin to the rectangle's center
  rotate(frameCount / 100.0); // Rotate by frameCount to animate the rotation
  fill(234, 31, 81);
  noStroke();
  rect(-125, -125, 250, 250); // Draw the rectangle centered on the new origin
  pop(); // Restore the original drawing context

  // The text is not affected by the translate and rotate
  fill(255);
  textStyle(BOLD);
  textSize(140);
  text("p5*", centerHorz - 105, centerVert + 40);
}

// mousePressed() function is called once after every time a mouse button is pressed
function mousePressed() {
    // code to run when mouse is pressed
}