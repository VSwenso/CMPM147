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

function preload() {
  tilesetImage = loadImage(
    "https://cdn.glitch.com/25101045-29e2-407a-894c-e0243cd8c7c6%2FtilesetP8.png?v=1611654020438"
  );
}

function reseed() {
  seed = (seed | 0) + 1109;
  randomSeed(seed);
  noiseSeed(seed);
  select("#seedReport").html("seed " + seed);
  regenerateGrid();
}

function regenerateGrid() {
  select("#asciiBox").value(gridToString(generateGrid(numCols, numRows)));
  reparseGrid();
}

function reparseGrid() {
  currentGrid = stringToGrid(select("#asciiBox").value());
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

function setup() {
  numCols = select("#asciiBox").attribute("rows") | 0;
  numRows = select("#asciiBox").attribute("cols") | 0;

  createCanvas(16 * numCols, 16 * numRows).parent("canvasContainer");
  select("canvas").elt.getContext("2d").imageSmoothingEnabled = false;

  select("#reseedButton").mousePressed(reseed);
  select("#asciiBox").input(reparseGrid);

  reseed();
}


function draw() {
  randomSeed(seed);
  drawGrid(currentGrid);
}

function placeTile(i, j, ti, tj) {
  image(tilesetImage, 16 * j, 16 * i, 16, 16, 8 * ti, 8 * tj, 8, 8);
}
function generateGrid(numCols, numRows) {
  let smaller = 1;
  if (numCols >= numRows){
    smaller = numRows;
  } else {
    smaller = numCols;
  }
  //The size and number of rooms
  let max_Size = floor(random(smaller/5, smaller/4));
  let min_Size = floor(random(3, max_Size));
  let numRooms = floor(random(5, 10));
  //grid w/ background areas
  let grid = [];
  for (let i = 0; i < numRows; i++) {
    let row = [];
    for (let j = 0; j < numCols; j++) {
      if(noise(i/10, j/10) > 0.5){
        row.push("-")
      }
      else{
        row.push("_");
      }
    }
    grid.push(row);
  }
  //This randomly locates and create rooms depending on the min and max size.
  let rooms = [];
  for (let i = 0; i < numRooms; i++){
    const roomRows = floor(random() * (max_Size - min_Size)) + min_Size;
    const roomCols = floor(random() * (max_Size - min_Size)) + min_Size;
    const x = floor(random() * numCols - roomCols) + 1;
    const y = floor(random() * numRows - roomRows) + 1;
    const room = {x: x, y: y, width: roomCols, height: roomRows};
    //This checks if the room is overlapping. If it is, the room is rebuilt before it is pushed to the sets of rooms
    //to keep track the used spaces.
    for(const r of rooms){
      if(room.x < r.x + r.width && room.x + room.width > r.x && room.y < r.y + r.height && room.y + room.height > r.y){
        i--;
        continue;
      }
    }
    rooms.push(room);
    //This prints out the room into the grid.
    for (let j = y; j < y + roomRows; j++){
      for (let l = x; l < x + roomCols; l++){
        grid[j][l] = ".";
      }
    }
    
    //This creates a passage between rooms, which creates an passage connecting the center of the room
    //and the center of the room created previously
    if (i > 0) {
      const prevRoom = rooms[i - 1];
      let prevCenterX = floor(prevRoom.x + prevRoom.width / 2);
      let prevCenterY = floor(prevRoom.y + prevRoom.height / 2);
      const centerX = floor(room.x + room.width / 2);
      const centerY = floor(room.y + room.height / 2);
      
      while (prevCenterX !== centerX) {
        grid[prevCenterY][prevCenterX] = ".";
        if (prevCenterX < centerX) prevCenterX++;
        else prevCenterX--;
      }
      while (prevCenterY !== centerY) {
        grid[prevCenterY][prevCenterX] = ".";
        if (prevCenterY < centerY) prevCenterY++;
        else prevCenterY--;
      }
    }
  }
  return grid;
}

// [1, 21] is dungeon wall
// [0, 9] is dungeon floor
const lookup = [
  [5, 1], //0000 blank
  [5, 0], //0001 up
  [6, 1], //0010 right
  [6, 0], //0011 up right
  [5, 2], //0100 down
  [5, 1], //0101 down & up 
  [6, 2], //0110 down right
  [5, 1], //0111 down, up, and right
  [4, 1], //1000 left
  [4, 0], //1001 up left
  [5, 1], //1010 left right 10
  [5, 1], //1011 left right up
  [4, 2], //1100 down left
  [5, 1], //1101 down left up
  [5, 1], //1110 down left right
  [5, 1] //1111 all direction
];

//Check the coordination if it is in the area and if it is the target
function gridCheck(grid, i, j, target) {
  if(i < 0 || j < 0 || i >= grid.length || j >= grid[i].length){
    return false;
  }
  if(grid[i][j] == target){
    return true;
  }
  return false;
}

//Adds in to a string depending on if the target object is located around the coordinate.
//The string(binary) is converted into decimal and returned
function gridCode(grid, i, j, target) {
  let binary = '';
  binary += gridCheck(grid, i, j - 1, target) ? "1":"0";
  binary += gridCheck(grid, i + 1, j, target)  ? "1":"0";
  binary += gridCheck(grid, i, j + 1, target)  ? "1":"0";
  binary += gridCheck(grid, i - 1, j, target)  ? "1":"0";
  const index = parseInt(binary, 2);
  return index
}

//Gets the index number from gridCode and place tiles depending what the value is.
function drawContext(grid, i, j, target, dti, dtj) {
  const code = gridCode(grid, i, j, target)
  if(code == 5){
    placeTile(i, j, dti + 5, dtj + 2);
    placeTile(i, j, dti + 5, dtj);
  } else if(code == 7){
    placeTile(i, j, dti + 5, dtj + 2);
    placeTile(i, j, dti + 6, dtj);
  } else if (code == 10){
    placeTile(i, j, dti + 4, dtj + 1);
    placeTile(i, j, dti + 6, dtj + 1);
  } else if (code == 11){
    placeTile(i, j, dti + 4, dtj + 1);
    placeTile(i, j, dti + 6, dtj);
  } else if (code == 13){
    placeTile(i, j, dti + 4, dtj + 2);
    placeTile(i, j, dti + 5, dtj);
  } else if (code == 14){
    placeTile(i, j, dti + 4, dtj + 2);
    placeTile(i, j, dti + 6, dtj + 1);
  } else if (code == 15){
    placeTile(i, j, dti + 4, dtj + 2);
    placeTile(i, j, dti + 6, dtj);
  }
  else{
    const [tiOffset, tjOffset] = lookup[code];
    placeTile(i, j, dti + tiOffset, dtj + tjOffset);
  }
}

//Drawing grids.
function drawGrid(grid) {
  background(128);
  let entry = false;
  let entryx;
  let entryy;
  let exitx;
  let exity;
  let exitdist = 0;
  for(let i = 0; i < grid.length; i++) {
    for(let j = 0; j < grid[i].length; j++) {
      //Drawing lavas with animations by millis()
      if (grid[i][j] == '_') {
        let ti = floor(random(9, 11))
        let tj = floor(random(18, 19))
        placeTile(i, j, ti, tj);
        placeTile(i, j, 9 + (millis()%((i+1)*(j+1)%7 * 1000) < (i*j%5 * 25) ? -1 : -2), 18 + (millis()%((i+1)*(j+1)%19 * 700) < (i*j%5 + 250) ? 1 : 2));
      }
      else if (grid[i][j] == '-') {
        let ti = (floor(random(1, 3)))
        let tj = floor(random(18, 19))
        placeTile(i, j, ti, tj);
        placeTile(i, j, 5 + (millis()%((i+1)*(j+1)%11 * 1000) > (i*j%5 * 50 + 400) ? 1 : 0), 19 + (millis()%((i+1)*(j+1)%13 * 1000) < (i*j%5 + 250) ? -1 : 0));
      }
      //Drawing the dungeon
      if(gridCheck(grid, i, j, ".")){
        placeTile(i, j, (floor(random(4))), 14);
        //Adding extra treasure boxes as well.
        if(gridCode(grid, i, j, ".") == 15 && random() < 0.05){
          placeTile(i, j, 2, 30);
        }
        //Taking the farthest coordinate from the entance door where a door can be located.
        if(gridCode(grid, i, j, ".") == 15 && gridCheck(grid, i-1, j-1, ".") && gridCheck(grid, i-1, j+1, ".") && 
           gridCheck(grid, i+1, j-1, ".") && gridCheck(grid, i + 1, j + 1, ".") &&
           entry == true){
          if(exitdist < Math.sqrt(Math.pow(entryx - j, 2) + Math.pow(entryy - i, 2))){
            exitdist = Math.sqrt(Math.pow(entryx - j, 2) + Math.pow(entryy - i, 2));
            exitx = j;
            exity = i
          }
        }
        //Adding in entrance door once.
        if(gridCode(grid, i, j, ".") == 15 && gridCheck(grid, i-1, j-1, ".") && gridCheck(grid, i-1, j+1, ".") && 
           gridCheck(grid, i+1, j-1, ".") && gridCheck(grid, i + 1, j + 1, ".") &&
           entry == false){
          placeTile(i, j, 6, 26);
          entry = true
          entryx = j;
          entryy = i;
        }
      } else {
        //Drawing the edges and also adding in some extra terrains in the lava.
        drawContext(grid, i, j, ".", 0, 9);
        if(gridCode(grid, i, j, ".") == 0 && random() > 0.99){
          placeTile(i, j, 14, 9);
        }
      }
    }
  }
  //Placing the exit door to a location far as possible from the entrance.
  placeTile(exity, exitx, 7, 26);
}


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