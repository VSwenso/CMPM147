/* exported p4_inspirations, p4_initialize, p4_render, p4_mutate */


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
    
    // code taken from Wes Modes website
    let canvasContainer = $('.image-container'); 
    let canvasWidth = canvasContainer.width(); 
    let aspectRatio = inspiration.image.height / inspiration.image.width;
    let canvasHeight = canvasWidth * aspectRatio; 
    resizeCanvas(canvasWidth, canvasHeight);
    $(".caption").text(inspiration.credit); 
  
      
    const imgHTML = `<img src="${inspiration.assetUrl}" style="width:${canvasWidth}px;">`
    $('#original').empty();
    $('#original').append(imgHTML);
  
    let design = [];
    for (let i = 0; i < 1000; i++) {
      let shape = {
        x: random(width),
        y: random(height),
        diameter: random(8, 16)
      };
      design.push(shape);
    }
    
    return design;
  }
    
  function renderDesign(design, inspiration) {
    background(255);
    noStroke();
    inspiration.image.loadPixels();
    
    let imageWidth = inspiration.image.width;
    let imageHeight = inspiration.image.height;
      
    rectMode(CENTER);
    
    for (let shape of design) {
      let pixelX = Math.floor((shape.x / width) * imageWidth);
      let pixelY = Math.floor((shape.y / height) * imageHeight);
      pixelX = constrain(pixelX, 0, imageWidth - 1);
      pixelY = constrain(pixelY, 0, imageHeight - 1);
      let pixelIndex = (pixelY * imageWidth + pixelX) * 4;
      let r = inspiration.image.pixels[pixelIndex];
      let g = inspiration.image.pixels[pixelIndex + 1];
      let b = inspiration.image.pixels[pixelIndex + 2];
      fill(r, g, b);
      inspiration.drawShape(shape.x, shape.y, shape.diameter, shape.diameter);
    }
    
    inspiration.image.updatePixels();
  }
    
  function mutateDesign(design, inspiration, rate) {
    for (let shape of design) {
      shape.diameter = mut(shape.diameter || 50, 30, 60, rate);
    }
  }
    
  function mut(num, min, max, rate) {
    return constrain(randomGaussian(num, (rate * (max - min)) / 20), min, max);
  }
    