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
   noStroke();
    for(let box of design.fg) {
      if (design.shape == "ellipse") { 
        fill(box.fill);
        ellipse(box.x, box.y, box.w);
        console.log(box.w / 2, box.h / 2);
      }
      else if (design.shape == "rectangle") { 
        fill(box.fill);
        rect(box.x, box.y, box.w, box.h);
        console.log(box.w / 2, box.h / 2);
      }
      fill(box.fill);
      rect(box.x, box.y, box.w, box.h);
      console.log(box.w / 2, box.h / 2);
    }
  }
  
  function mutateDesign(design, inspiration, rate) {
    design.backColor = mut(design.backColor, 0, 255, rate); //color
    for(let box of design.fg) {
      box.x = mut(box.x, 0, width, rate);
      box.y = mut(box.y, 0, height, rate);
      box.w = mut(box.w, 0, width/10, rate);
      box.h = mut(box.h, 0, height/10, rate);
    }
  }
  
  function mut(num, min, max, rate) {
    return constrain(randomGaussian(num, (rate * (max - min)) / 20), min, max);
  }
  