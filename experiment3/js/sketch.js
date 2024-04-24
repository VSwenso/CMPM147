// sketch.js - purpose and description here
// Author: Your Name
// Date:

// Here is how you might set up an OOP p5.js project
// Note that p5.js looks for a file called sketch.js

// Constants - User-servicable parts
// In a longer project I like to put these in a separate file

let seed = 0;
let seed2 = 0;
let tilesetImage;
let tilesetImage2;
let currentGrid = [];
let currentGrid2 = [];
let numRows, numCols;
let numRows2, numCols2;



//Dungeon generator

var myp5 = new p5((d) => {
  d.preload = () => {
    tilesetImage = d.loadImage(
      "tilesetP8.png"
    );
  }

  function placeTile(i, j, ti, tj) {
    d.image(tilesetImage, 16 * j, 16 * i, 16, 16, 8 * ti, 8 * tj, 8, 8);
  }

  function reseed() {
    seed = (seed | 0) + 1109;
    d.randomSeed(seed);
    d.noiseSeed(seed);
    d.select("#seedReport").html("seed " + seed);
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
  numRows = d.select("#asciiBox").attribute("cols") | 0;

  d.createCanvas(16 * numCols, 16 * numRows).parent("canvas-container1");
  d.select('canvas').elt.getContext("2d").imageSmoothingEnabled = false;

  d.select("#reseedButton").mousePressed(reseed);
  d.select("#asciiBox").input(reparseGrid);

  reseed();
  };

  d.draw = () => {
    d.randomSeed(seed);
    drawGrid(currentGrid);
  }

  function generateGrid(numCols, numRows) {
    //Determines which side is smaller to pick the maximum
    //and the minimum size of rooms
    let smaller = 1;
    if (numCols >= numRows){
      smaller = numRows;
    } else {
      smaller = numCols;
    }
    //The size and number of rooms
    let maxSize = d.floor(d.random(smaller/5, smaller/4));
    let minSize = d.floor(d.random(smaller/10, maxSize));
    let numRooms = d.floor(d.random(5, 10));
    //The grid with the background areas
    let grid = [];
    for (let i = 0; i < numRows; i++) {
      let row = [];
      for (let j = 0; j < numCols; j++) {
        if(d.noise(i/10, j/10) > 0.5){
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
      const roomRows = d.floor(d.random() * (maxSize - minSize)) + minSize;
      const roomCols = d.floor(d.random() * (maxSize - minSize)) + minSize;
      const x = d.floor(d.random() * numCols - roomCols) + 1;
      const y = d.floor(d.random() * numRows - roomRows) + 1;
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
        let prevCenterX = d.floor(prevRoom.x + prevRoom.width / 2);
        let prevCenterY = d.floor(prevRoom.y + prevRoom.height / 2);
        const centerX = d.floor(room.x + room.width / 2);
        const centerY = d.floor(room.y + room.height / 2);
        
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
    d.background(128);
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
          let ti = d.floor(d.random(9, 11))
          let tj = d.floor(d.random(18, 19))
          placeTile(i, j, ti, tj);
          placeTile(i, j, 9 + (d.millis()%((i+1)*(j+1)%7 * 1000) < (i*j%5 * 25) ? -1 : -2), 18 + (d.millis()%((i+1)*(j+1)%19 * 700) < (i*j%5 + 250) ? 1 : 2));
        }
        else if (grid[i][j] == '-') {
          let ti = (d.floor(d.random(1, 3)))
          let tj = d.floor(d.random(18, 19))
          placeTile(i, j, ti, tj);
          placeTile(i, j, 5 + (d.millis()%((i+1)*(j+1)%11 * 1000) > (i*j%5 * 50 + 400) ? 1 : 0), 19 + (d.millis()%((i+1)*(j+1)%13 * 1000) < (i*j%5 + 250) ? -1 : 0));
        }
        //Drawing the dungeon
        if(gridCheck(grid, i, j, ".")){
          placeTile(i, j, (d.floor(d.random(4))), 9);
          //Adding extra treasure boxes as well.
          if(gridCode(grid, i, j, ".") == 15 && d.random() < 0.05){
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
            placeTile(i, j, 26, 26);
            entry = true
            entryx = j;
            entryy = i;
          }
        } else {
          //Drawing the edges and also adding in some extra terrains in the lava.
          drawContext(grid, i, j, ".", 0, 9);
          if(gridCode(grid, i, j, ".") == 0 && d.random() > 0.99){
            placeTile(i, j, 14, 9);
          }
        }
      }
    }
    //Placing the exit door to a location far as possible from the entrance.
    placeTile(exity, exitx, 27, 26);
  }

}, 'p5sketch');


//Overworld generator
var myp5 = new p5((o) => {
  o.preload = () => {
    tilesetImage2 = o.loadImage(
      "tilesetP8.png"
    );
  }

  function placeTile2(i, j, ti, tj) {
    o.image(tilesetImage2, 16 * j, 16 * i, 16, 16, 8 * ti, 8 * tj, 8, 8);
  }

  function reseed2() {
    seed2 = (seed2 | 0) + 1109;
    o.randomSeed(seed2);
    o.noiseSeed(seed2);
    o.select("#seedReport2").html("seed " + seed2);
    regenerateGrid2();
  }

  function regenerateGrid2() {
    o.select("#asciiBox2").value(gridToString2(generateWorldGrid(numCols2, numRows2)));
    reparseGrid2();
  }
  
  function reparseGrid2() {
    currentGrid2 = stringToGrid2(o.select("#asciiBox2").value());
  }
  
  function gridToString2(grid) {
    let rows2 = [];
    for (let i = 0; i < grid.length; i++) {
      rows2.push(grid[i].join(""));
    }
    return rows2.join("\n");
  }
  
  function stringToGrid2(str) {
    let grid2 = [];
    let lines2 = str.split("\n");
    for (let i = 0; i < lines2.length; i++) {
      let row2 = [];
      let chars2 = lines2[i].split("");
      for (let j = 0; j < chars2.length; j++) {
        row2.push(chars2[j]);
      }
      grid2.push(row2);
    }
    return grid2;
  }

  o.setup = () => {
  numCols2 = o.select("#asciiBox2").attribute("rows") | 0;
  numRows2 = o.select("#asciiBox2").attribute("cols") | 0;

  o.createCanvas(16 * numCols2, 16 * numRows2).parent("canvas-container2");
  o.select("canvas").elt.getContext("2d").imageSmoothingEnabled = false;

  o.select("#reseedButton2").mousePressed(reseed2);
  o.select("#asciiBox2").input(reparseGrid2);

  reseed2();
  };

  o.draw = () => {
    o.randomSeed(seed2);
    drawWorldGrid(currentGrid2);
  }

  function generateWorldGrid(numCols, numRows) {
    //The grid with the different biomes and items
    let grid = [];
    for (let i = 0; i < numRows; i++) {
      let row = [];
      for (let j = 0; j < numCols; j++) {
        if(o.noise(i/10, j/10) > 0.5){
          row.push("-");
        }
        else if(o.noise(i/10, j/10) < 0.3){
          row.push("W");
        }
        else{
          row.push("_");
        }
      }
      grid.push(row);
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
      placeTile2(i, j, dti + 5, dtj + 2);
      placeTile2(i, j, dti + 5, dtj);
    } else if(code == 7){
      placeTile2(i, j, dti + 5, dtj + 2);
      placeTile2(i, j, dti + 6, dtj);
    } else if (code == 10){
      placeTile2(i, j, dti + 4, dtj + 1);
      placeTile2(i, j, dti + 6, dtj + 1);
    } else if (code == 11){
      placeTile2(i, j, dti + 4, dtj + 1);
      placeTile2(i, j, dti + 6, dtj);
    } else if (code == 13){
      placeTile2(i, j, dti + 4, dtj + 2);
      placeTile2(i, j, dti + 5, dtj);
    } else if (code == 14){
      placeTile2(i, j, dti + 4, dtj + 2);
      placeTile2(i, j, dti + 6, dtj + 1);
    } else if (code == 15){
      placeTile2(i, j, dti + 4, dtj + 2);
      placeTile2(i, j, dti + 6, dtj);
    }
    else{
      const [tiOffset, tjOffset] = lookup[code];
      placeTile2(i, j, dti + tiOffset, dtj + tjOffset);
    }
  }
  
  //Drawing grids.
  function drawWorldGrid(grid) {
    o.background(128);
    for(let i = 0; i < grid.length; i++) {
      for(let j = 0; j < grid[i].length; j++) {
        //Drawing the water, andl also animating it using % operators and millis().
        if(grid[i][j] == 'W'){
          placeTile2(i, j, 0, 13);
        
          placeTile2(i, j, 0 + (o.millis()% (((i * j) % 17) * 5000) < (((i * j) % 5) + 5) * 50 ? 3 : 0), 13);
        }
        //Drawing the low lands
        if(grid[i][j] == '-'){
          placeTile2(i, j, o.floor(o.random(0, 4)), 1);
        }
        else{
          drawContext(grid, i, j, "-", 0, 6);
        }
        //Drawing the high lands with the houses and towers.
        //Also drawing the trees in the low lands
        //Drawing ground
        if (grid[i][j] == '_') {
          let ti = o.floor(o.random(4))
          let tj = 0
          placeTile2(i, j, ti, tj);
          //Drawing the houses
          if(gridCode(grid, i, j, "_") == 15 && o.random() > 0.9){
            placeTile2(i, j, 26, 0);
          }
        }
        else{
          //Drawing the edges
          drawContext(grid, i, j, "_", 5, 0)
          //Drawing the trees
          if(gridCode(grid, i, j, "_") == 0 && grid[i][j] != "W"){
            let ti = 14
            let tj = o.floor(o.random(3))
            placeTile2(i, j, ti, tj);
          }
        }
        //Drawing the towers
        if(gridCode(grid, i, j, "_") == 15 && o.random() > 0.99){
          placeTile2(i, j, 28, 1);
          placeTile2(i - 1, j, 28, 0);
        }
      }
    }
  }

}, 'p5sketch');

/* goober
let seed = 0;
let seed2 = 0;
let tilesetImage;
let tilesetImage2;
let currentGrid = [];
let currentGrid2 = [];
let numRows, numCols;
let numRows2, numCols2;



//Dungeon generator

var myp5 = new p5((d) => {
  d.preload = () => {
    tilesetImage = d.loadImage(
      "tilesetP8.png"
    );
  }

  function placeTile(i, j, ti, tj) {
    d.image(tilesetImage, 16 * j, 16 * i, 16, 16, 8 * ti, 8 * tj, 8, 8);
  }

  function reseed() {
    seed = (seed | 0) + 1109;
    d.randomSeed(seed);
    d.noiseSeed(seed);
    d.select("#seedReport").html("seed " + seed);
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
  numRows = d.select("#asciiBox").attribute("cols") | 0;

  d.createCanvas(16 * numCols, 16 * numRows).parent("canvas-container1");
  d.select('canvas').elt.getContext("2d").imageSmoothingEnabled = false;

  d.select("#reseedButton").mousePressed(reseed);
  d.select("#asciiBox").input(reparseGrid);

  reseed();
  };

  d.draw = () => {
    d.randomSeed(seed);
    drawGrid(currentGrid);
  }

  function generateGrid(numCols, numRows) {
    //Determines which side is smaller to pick the maximum
    //and the minimum size of rooms
    let smaller = 1;
    if (numCols >= numRows){
      smaller = numRows;
    } else {
      smaller = numCols;
    }
    //The size and number of rooms
    let maxSize = d.floor(d.random(smaller/5, smaller/4));
    let minSize = d.floor(d.random(smaller/10, maxSize));
    let numRooms = d.floor(d.random(5, 10));
    //The grid with the background areas
    let grid = [];
    for (let i = 0; i < numRows; i++) {
      let row = [];
      for (let j = 0; j < numCols; j++) {
        if(d.noise(i/10, j/10) > 0.5){
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
      const roomRows = d.floor(d.random() * (maxSize - minSize)) + minSize;
      const roomCols = d.floor(d.random() * (maxSize - minSize)) + minSize;
      const x = d.floor(d.random() * numCols - roomCols) + 1;
      const y = d.floor(d.random() * numRows - roomRows) + 1;
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
        let prevCenterX = d.floor(prevRoom.x + prevRoom.width / 2);
        let prevCenterY = d.floor(prevRoom.y + prevRoom.height / 2);
        const centerX = d.floor(room.x + room.width / 2);
        const centerY = d.floor(room.y + room.height / 2);
        
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
    d.background(128);
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
          let ti = d.floor(d.random(9, 11))
          let tj = d.floor(d.random(18, 19))
          placeTile(i, j, ti, tj);
          placeTile(i, j, 9 + (d.millis()%((i+1)*(j+1)%7 * 1000) < (i*j%5 * 25) ? -1 : -2), 18 + (d.millis()%((i+1)*(j+1)%19 * 700) < (i*j%5 + 250) ? 1 : 2));
        }
        else if (grid[i][j] == '-') {
          let ti = (d.floor(d.random(1, 3)))
          let tj = d.floor(d.random(18, 19))
          placeTile(i, j, ti, tj);
          placeTile(i, j, 5 + (d.millis()%((i+1)*(j+1)%11 * 1000) > (i*j%5 * 50 + 400) ? 1 : 0), 19 + (d.millis()%((i+1)*(j+1)%13 * 1000) < (i*j%5 + 250) ? -1 : 0));
        }
        //Drawing the dungeon
        if(gridCheck(grid, i, j, ".")){
          placeTile(i, j, (d.floor(d.random(4))), 9);
          //Adding extra treasure boxes as well.
          if(gridCode(grid, i, j, ".") == 15 && d.random() < 0.05){
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
            placeTile(i, j, 26, 26);
            entry = true
            entryx = j;
            entryy = i;
          }
        } else {
          //Drawing the edges and also adding in some extra terrains in the lava.
          drawContext(grid, i, j, ".", 0, 9);
          if(gridCode(grid, i, j, ".") == 0 && d.random() > 0.99){
            placeTile(i, j, 14, 9);
          }
        }
      }
    }
    //Placing the exit door to a location far as possible from the entrance.
    placeTile(exity, exitx, 27, 26);
  }

}, 'p5sketch');


//Overworld generator
var myp5 = new p5((o) => {
  o.preload = () => {
    tilesetImage2 = o.loadImage(
      "tilesetP8.png"
    );
  }

  function placeTile2(i, j, ti, tj) {
    o.image(tilesetImage2, 16 * j, 16 * i, 16, 16, 8 * ti, 8 * tj, 8, 8);
  }

  function reseed2() {
    seed2 = (seed2 | 0) + 1109;
    o.randomSeed(seed2);
    o.noiseSeed(seed2);
    o.select("#seedReport2").html("seed " + seed2);
    regenerateGrid2();
  }

  function regenerateGrid2() {
    o.select("#asciiBox2").value(gridToString2(generateWorldGrid(numCols2, numRows2)));
    reparseGrid2();
  }
  
  function reparseGrid2() {
    currentGrid2 = stringToGrid2(o.select("#asciiBox2").value());
  }
  
  function gridToString2(grid) {
    let rows2 = [];
    for (let i = 0; i < grid.length; i++) {
      rows2.push(grid[i].join(""));
    }
    return rows2.join("\n");
  }
  
  function stringToGrid2(str) {
    let grid2 = [];
    let lines2 = str.split("\n");
    for (let i = 0; i < lines2.length; i++) {
      let row2 = [];
      let chars2 = lines2[i].split("");
      for (let j = 0; j < chars2.length; j++) {
        row2.push(chars2[j]);
      }
      grid2.push(row2);
    }
    return grid2;
  }

  o.setup = () => {
  numCols2 = o.select("#asciiBox2").attribute("rows") | 0;
  numRows2 = o.select("#asciiBox2").attribute("cols") | 0;

  o.createCanvas(16 * numCols2, 16 * numRows2).parent("canvas-container2");
  o.select("canvas").elt.getContext("2d").imageSmoothingEnabled = false;

  o.select("#reseedButton2").mousePressed(reseed2);
  o.select("#asciiBox2").input(reparseGrid2);

  reseed2();
  };

  o.draw = () => {
    o.randomSeed(seed2);
    drawWorldGrid(currentGrid2);
  }

  function generateWorldGrid(numCols, numRows) {
    //The grid with the different biomes and items
    let grid = [];
    for (let i = 0; i < numRows; i++) {
      let row = [];
      for (let j = 0; j < numCols; j++) {
        if(o.noise(i/10, j/10) > 0.5){
          row.push("-");
        }
        else if(o.noise(i/10, j/10) < 0.3){
          row.push("W");
        }
        else{
          row.push("_");
        }
      }
      grid.push(row);
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
      placeTile2(i, j, dti + 5, dtj + 2);
      placeTile2(i, j, dti + 5, dtj);
    } else if(code == 7){
      placeTile2(i, j, dti + 5, dtj + 2);
      placeTile2(i, j, dti + 6, dtj);
    } else if (code == 10){
      placeTile2(i, j, dti + 4, dtj + 1);
      placeTile2(i, j, dti + 6, dtj + 1);
    } else if (code == 11){
      placeTile2(i, j, dti + 4, dtj + 1);
      placeTile2(i, j, dti + 6, dtj);
    } else if (code == 13){
      placeTile2(i, j, dti + 4, dtj + 2);
      placeTile2(i, j, dti + 5, dtj);
    } else if (code == 14){
      placeTile2(i, j, dti + 4, dtj + 2);
      placeTile2(i, j, dti + 6, dtj + 1);
    } else if (code == 15){
      placeTile2(i, j, dti + 4, dtj + 2);
      placeTile2(i, j, dti + 6, dtj);
    }
    else{
      const [tiOffset, tjOffset] = lookup[code];
      placeTile2(i, j, dti + tiOffset, dtj + tjOffset);
    }
  }
  
  //Drawing grids.
  function drawWorldGrid(grid) {
    o.background(128);
    for(let i = 0; i < grid.length; i++) {
      for(let j = 0; j < grid[i].length; j++) {
        //Drawing the water, andl also animating it using % operators and millis().
        if(grid[i][j] == 'W'){
          placeTile2(i, j, 0, 13);
        
          placeTile2(i, j, 0 + (o.millis()% (((i * j) % 17) * 5000) < (((i * j) % 5) + 5) * 50 ? 3 : 0), 13);
        }
        //Drawing the low lands
        if(grid[i][j] == '-'){
          placeTile2(i, j, o.floor(o.random(0, 4)), 1);
        }
        else{
          drawContext(grid, i, j, "-", 0, 6);
        }
        //Drawing the high lands with the houses and towers.
        //Also drawing the trees in the low lands
        //Drawing ground
        if (grid[i][j] == '_') {
          let ti = o.floor(o.random(4))
          let tj = 0
          placeTile2(i, j, ti, tj);
          //Drawing the houses
          if(gridCode(grid, i, j, "_") == 15 && o.random() > 0.9){
            placeTile2(i, j, 26, 0);
          }
        }
        else{
          //Drawing the edges
          drawContext(grid, i, j, "_", 5, 0)
          //Drawing the trees
          if(gridCode(grid, i, j, "_") == 0 && grid[i][j] != "W"){
            let ti = 14
            let tj = o.floor(o.random(3))
            placeTile2(i, j, ti, tj);
          }
        }
        //Drawing the towers
        if(gridCode(grid, i, j, "_") == 15 && o.random() > 0.99){
          placeTile2(i, j, 28, 1);
          placeTile2(i - 1, j, 28, 0);
        }
      }
    }
  }

}, 'p5sketch');
/* END OF THE GOOBER
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
    o.select("#seedReport_2").html("seed" + seed_2); 
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
/* end of test 

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