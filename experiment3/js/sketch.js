// sketch.js - purpose and description here
// Author: Your Name
// Date:

// Here is how you might set up an OOP p5.js project
// Note that p5.js looks for a file called sketch.js

// Constants - User-servicable parts
// In a longer project I like to put these in a separate file

let seed = 0;
let tilesetImage;
let currentGrid = [];
let numRows, numCols;

let seed_2 = 0; 
let tilesetImage_2; 
let currentGrid_2 = [];
let numRows_2, numCols_2

var myp5 = new p5((d) => {
  d.preload = () => {
    tilesetImage = d.loadImage(
      "https://cdn.glitch.com/25101045-29e2-407a-894c-e0243cd8c7c6%2FtilesetP8.png?v=1611654020438"
    );
  }

  function reseed() {
    seed = (seed | 0) + 1109;
    d.randomSeed(seed); 
    d.noiseSeed(seed); 
    d.select("#seedReport").html("seed" + seed); 
    regenerateGrid(); 
  }

  function regenerateGrid() {
    d.select("#asciiBox").value(gridToString(generateGrid(numCols, numRows)));
    reparseGrid();
  }

  function reparseGrid() {
    currentGrid = stringToGrid(d.select("#asciiBox").value());
  }

  function gridToString(grid) {
    let rows = [];
    for (let i = 0; i < grid.length; i++) {
      rows.push(grid[i].join(""));
    }
    return rows.join("\n");
  }

  function stringToGrid(str) {
    let grid = [];
    let lines = str.split("\n");
    for (let i = 0; i < lines.length; i++) {
      let row = [];
      let chars = lines[i].split("");
      for (let j = 0; j < chars.length; j++) {
        row.push(chars[j]);
      }
      grid.push(row);
    }
    return grid;
  }

  d.setup = () => {
    numCols = d.select("#asciiBox").attribute("rows") | 0;
    numRows = d.select("#asciiBox").attribute("columns") | 0; 

    d.createCanvas(16 * numCols, 16 * numRows).parent("canvas.container_1");
    d.select('canvas').elt.getContext("2d").imageSmoothingEnabled = false;

    d.select("#reseedButton").mousePressed(reseed); 
    d.select("#asciiBox").input(reparseGrid); 

    reseed(); 
    };

    d.draw = () => {
      d.randomSeed(seed); 
      drawGrid(currentGrid);
    }

  function placeTile(i, j, ti, tj) {
    d.image(tilesetImage, 16 * j, 16 *i, 16, 16, 8*ti, 8*tj, 8, 8);
  }

  function gridCheck(gridData, xPosition, yPosition, targetVal) {
    return (
      xPosition < gridData[0].length &&
      xPosition >= 0 &&
      yPosition < gridData.length &&
      yPosition >= 0 &&
      gridData[yPosition][xPosition] == targetVal
    );
  }

  function gridCode(gridData, xPosition, yPosition, targetVal) {
    return (
      (gridCheck(gridData, xPosition, yPosition - 1, targetVal) << 3) +
      (gridCheck(gridData, xPosition + 1, yPosition, targetVal) << 2) +
      (gridCheck(gridData, xPosition, yPosition + 1, targetVal) << 1) +
      (gridCheck(gridData, xPosition - 1, yPosition, targetVal) << 0)
    );
  }

  function drawContent(gridData, xPosition, yPosition, targetVal, xTileOffset, yTileOffset) {
    const nearbyState = gridCode(gridData, xPosition, yPosition, targetVal); 
    const [xOffset, yOffset] = lookupTable[nearbyState]; 
    placeTile(xPosition, yPosition, xTileOffset + xOffset, yTileOffset + yOffset); 
  }

  function generateGrid(numCols, numRows) {
    const noiseStrength = 1; 
    const noiseScale = 10; 
    const gridData = []; 
    const roomCenters = []; 

    for (let yPosition = 0; yPosition < numRows; yPosition++) {
      const rowData = [];
      for (let xPosition = 0; xPosition < numCols; xPosition++) {
        rowData.push("r"); //rock
      }
      gridData.push(rowData);
    }

    for (let yPosition = 0; yPosition < numRows; yPosition++) {
      for (let xPosition = 0; xPosition < numCols; xPosition++) {
        if (d.noise(yPosition * noiseStrength, xPosition * noiseStrength) * noiseScale > 8) {
          roomCenters.push([yPosition, xPosition]); 
        }
      }
    }

    let prevRoom = undefined; 
    while (roomCenters.length > 0) {
      const currentRoom = roomCenters.pop(); 
      const roomWidth = d.floor(d.random(4, 10));
      const roomHeight = d.floor(d.random(4, 8));
      const startX = currentRoom[1] - d.floor(roomWidth / 2);
      const startY = currentRoom[0] - d.floor(roomHeight / 2); 

      for (let yPosition = startY; yPosition < startY + roomHeight; yPosition++) {
        for (let xPosition = startX; xPosition < startX + roomWidth; xPosition++) {
          if (gridCheck(gridData, xPosition, yPosition, "r")) {
            gridData[yPosition][xPosition] = "2"; 
          }
        }
      }

      if (prevRoom !== undefined) {
        const hallWidth = d.abs(currentRoom[1] - prevRoom[1]);
        const hallHeight = d.abs(currentRoom[0] - prevRoom[0]);

        for (let moveAmount = 0; moveAmount < hallWidth; moveAmount++) {
          if (currentRoom[1] < prevRoom[1]) {
            if (gridCheck(gridData, currentRoom[1] + moveAmount, currentRoom[0], "r")) {
              gridData[currentRoom[0]][currentRoom[1] - moveAmount] = "3"; 
            }
          } else {
            if (gridCheck(gridData, prevRoom[1], currentRoom[0] - moveAmount, "r")) {
              gridData[currentRoom[0] - moveAmount][prevRoom[1]] = "3"; 
            }
          }
        }
      
        for (let moveAmount = 0; moveAmount < hallHeight; moveAmount++) {
          if (currentRoom[0] < prevRoom[0]) {
            if (gridCheck(gridData, prevRoom[1], currentRoom[0] + moveAmount, "r")) {
              gridData[currentRoom[0] + moveAmount][prevRoom[1]] = "3"; 
            }
          } else {
            if (gridCheck(gridData, prevRoom[1], currentRoom[0] - moveAmount, "r")) {
              gridData[currentRoom[0] - moveAmount][prevRoom[1]] = "3";
            }
          }
        }
      }

      prevRoom = currentRoom;
    }

    let chestNotPlaced = true; 
    while (chestNotPlaced) {
      const xPosition = d.floor(d.random(0, numCols));
      const yPosition = d.floor(d.random(0, numRows));
      if (gridCheck(gridData, xPosition, yPosition, "2") && gridCode(gridData, xPosition, yPosition, "2") == 15) {
        gridData[yPosition][xPosition] = "9"; 
        chestNotPlaced = false; 
      }
    }

    return gridData;
  }

  function drawGrid(gridData, lifeVal) {
    d.background(128); 

    for (let yPosition = 0; yPosition < gridData.length; yPosition++) {
      for (let xPosition = 0; xPosition < gridData[yPosition].length; xPosition++) {
        if (gridData[yPosition][xPosition] == "r") {
          placeTile(xPosition, yPosition, (d.millis() / 500) % 3, 18); //animated the rock
        } else if (gridData[yPosition][xPosition] == "2") {
          placeTile(xPosition, yPosition, d.random(1, 3), 23);
          drawContent(gridData, xPosition, yPosition, "2", 14, 21);
        } else if (gridData[yPosition][xPosition] == "3") {
          placeTile(xPosition, yPosition, 22, 21); 
        } else if (gridData[yPosition][xPosition] == "9") {
          placeTile(xPosition, yPosition, d.floor(d.random(1, 4)), d.random(21, 24));
          placeTile(xPosition, yPosition, 4, 28);
        }
      }
    }
  }

  const lookupTable = [
    [0, 0], [2, 2], [2, 0], [0, 0], [1, 1], [1, 2], [1, 0], [1, 1],
    [3, 1], [3, 2], [3, 0], [3, 1], [2, 0], [2, 2], [2, 0], [2, 1]
  ];

}, 'p5sketch');


var myp5 = new p5((o) => {
  o.preload = () => {
    tilesetImage_2 = o.loadImage(
      "https://cdn.glitch.com/25101045-29e2-407a-894c-e0243cd8c7c6%2FtilesetP8.png?v=1611654020438"
    );
  }

  function reseed_2() {
    seed_2 = (seed_2 | 0) + 1109; 
    o.randomSeed(seed_2); 
    o.noiseSeed(seed_2);
    o.select("#seedReport").html("seed" + seed_2); 
    regenerateGrid_2(); 
  }

  function regenerateGrid_2() {
    o.select("#asciiBox2").value(gridToString_2(generateGrid(numCols_2, numRows_2)));
    reparseGrid_2();
  }

  function reparseGrid_2() {
    currentGrid_2 = stringToGrid_2(o.select("#asciiBox2").value());
  }

  function gridToString_2(grid) {
    let rows = []; 
    for (let i = 0; i < grid.length; i++) {
      rows.push(grid[i].join(""));
    }
    return rows.join("\n");
  }

  function stringToGrid_2(str) {
    let grid = []; 
    let lines = str.split("\n");
    for (let i = 0; i < lines.length; i++) {
      let row = []; 
      let chars = lines[i].split(""); 
      for (let j = 0; j < chars.length; j++) {
        row.push(chars[j]);
      }
      grid.push(row);
    }
    return grid;
  }

  o.setup = () => {
    numCols_2 = o.select("#asciiBox2").attribute("rows") | 0; 
    numRows_2 = o.select("#asciiBox2").attribute("columns") | 0;

    o.createCanvas(16 * numCols_2, 16 * numRows_2).parent("canvas.Container_2");
    o.select("canvas").elt.getContext("2d").imageSmoothingEnabled = false;

    o.select("#reseedButton_2").mousePressed(reseed_2); 
    o.select("#asciiBox2").input(reparseGrid_2); 

    reseed_2();
    };

    o.draw = () => {
      o.randomSeed(seed_2); 
      drawGrid(currentGrid_2);
    }

  function placeTile_2(i, j, ti, tj) {
    o.image(tilesetImage, 16 * j, 16 * i, 16, 16, 8 * ti, 8 * tj, 8, 8); 
  }


  function generateGrid(numCols, numRows) {
    let grid = []; 
    for (let i = 0; i < numRows; i++) {
      let row = []; 
      for (let j = 0; j < numCols; j++) {
        //Perlin
        let noiseValue = o.noise(i / 20, j / 20); 

        //using perlin
        let code; 
        if (noiseValue < 0.3) {
          code = "."; 
        } else if (noiseValue < 0.6) {
          code = "_"; 
        } else if (noiseValue < 0.8) {
          code = ":";
        } else {
          code = ";";
        }

        row.push(code); 
      }
      grid.push(row);
    }

    return grid; 
  }

  function drawGrid(grid) {
    o.background(128);

    
    const g = 10; 
    const t = o.millis() / 1000.0; 

    //rendering ze tiles
    o.noStroke(); 
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        if (gridCheck(grid, i, j, ".")) {
          placeTile_2(i, j, 0, 3); 
        } else if (gridCheck(grid, i, j, ":")) {
          placeTile_2(i, j, (4 * o.pow(o.noise(t / 10, i, j / 4 + t), 2)) | 0, 14);
          drawContext_2(grid, i, j, ":", 9, 3, true); 
        } else {
          placeTile_2(i, j, (4 * o.pow(o.random(), g)) | 0, 0);
          drawContext_2(grid, i, j, ".", 4, 0);
        }
      }
    }
  }

  function gridCheck(grid, i, j, target) {
    //if location is inside the bounds
    return (
      i >= 0 &&
      i < grid.length &&
      j >= 0 &&
      j < grid[i].length &&
      grid[i][j] == target
    );
  }

  function gridCode(grid, i, j, target) {
    //calc code
    return (
      (gridCheck(grid, i - 1, j, target) << 0) + 
      (gridCheck(grid, i, j - 1, target) << 1) +
      (gridCheck(grid, i, j + 1, target) << 2) +
      (gridCheck(grid, i + 1, j, target) << 3)
    );
  }

  function drawContext_2(grid, i, j, target, dti, dtj, invert = false) {
    
    let code = gridCode(grid, i, j, target); 

    //bdrf
    if (invert) {
      code = 15 - code; 
    }

    //placing tile
    let [tiOffset, tjOffset] = lookup[code]; 
    placeTile_2(i, j, dti + tiOffset, dtj + tjOffset); 
  }

  //tile offset pairs
  const lookup = [
    [1, 1], 
    [1, 0], 
    [0, 1], 
    [0, 0], 
    [2, 1], 
    [2, 0], 
    [1, 1], 
    [1, 0], 
    [1, 2], 
    [1, 1], 
    [0, 2], 
    [0, 1], 
    [2, 2], 
    [2, 1], 
    [1, 2], 
    [1, 1]
  ];

}, 'p5sketch');

/*
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
} */