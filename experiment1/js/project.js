// project.js - purpose and description here
// Author: Tory Swenson
// Date: 04/17/24

// NOTE: This is how we might start a basic JavaaScript OOP project

// Constants - User-servicable parts
// In a longer project I like to put these in a separate file

// define a class
class MyProjectClass {
  // constructor function
  constructor(param1, param2) {
    // set properties using 'this' keyword
    this.property1 = param1;
    this.property2 = param2;
  }
  
  // define a method
  myMethod() {
    // code to run when method is called
  }
}

function main() {
  const fillers = {
    adventurer: ["Charming Stranger", "Aluring Creature", "Enchanting Soul", "Darling", "My Sweet", "Rizzler", "Mommy", "Hot Tamale", "Tempation Incarnate", "Shawty", "Short King", "Pookie Bear", "Cute Sugar Boo", "My Little Sunshine", "Sweetie-Pie"],
    location: ["Trampoline Park", "Cryptocurrency Forest Meet Up", "LARPing Event", "UFO enthusiast convention", "Bread Aisle", "Taxidermy Shop"],
    expression: ["poops pants nervously", "bites lip agressively", "nervously approaches with hands clasped together", "sweating profusely", "giggles cutely", "tips fedora", "starts to turn into wolf", "chuggs pepto bismol", "whimpers", "begins to cry", "jaw drops to the floor, eyes pop out of sockets accompanied by trumpets, heart beats out of chest, awooga awooga sound effect, steam blows out of ears", "looks down sheepishly", "wipes comically large bead of sweat from forehead", "clears throat, straightens tie and combs hair"],
    call: ["bank loan", "beaver", "banana", " Heavily used Rubber Chicken", "light up Kylo Ren funko-pop", "Rabid Wombat", "high-elf with the subclass draconic bloodline", "Minecraft enchanting table", "Cease and Desist", "Crusty white dog that is on the verge of death", "heel of bread loaf that gets uneaten", "peice of candy from the bottom of grandmas purse"],
    response: ["you've got my interest", "DAMN", "you are aPEELing", "you light up my word", "you are loud and annoying", "I just rolled a D20", "you fire me up", "I am about to go to jail", "you make me think im in heaven"],
    job: ["Bitcoin", "Subway", "Disney-Pixar", "Only-Fans", "Self-Proclaimed", "Uneducated", "WWE", "dictator", "Dinosaur Impersonator"],
    title: ["Dark wizard", "sandwich-artist ", "clown", "ultimate mechanic", "interpretive dance instructor", "chief unicorn wrangler","Director of Fun and Frolic", "Grand Poohbah of Affairs", "Time-Lord", "Galatic Ambassador", "Digital Prophet", "Head Schemer"],
    adjective: ["lovely", "enthralling", "captivating", "radiant", "rizzy", "magnetic", "super-duper", "angelic", "exquisite"],
    message: ["nanosecond", "moment", "breath", "second", "holler", "twinkling", "bable", "moment of your time", "sec", "..sowwy im shyyy", "...WHY ARE YOU LEAVING", "...wait, no! Come back"],
    
  };
  
  const template = `Hey there, $adventurer. Mind if I have a quick $message!
  
  I couldn't help but notice you from across the $location, Dangggggg *$expression*. Ahem, you look very $adjective. Are you a $call, because $response.
  
  I am also a $job, $title. Surely this must tempt one such as yourself!
  `;
  
  
  // STUDENTS: You don't need to edit code below this line.
  
  const slotPattern = /\$(\w+)/;
  
  function replacer(match, name) {
    let options = fillers[name];
    if (options) {
      return options[Math.floor(Math.random() * options.length)];
    } else {
      return `<UNKNOWN:${name}>`;
    }
  }
  
  function generate() {
    let story = template;
    while (story.match(slotPattern)) {
      story = story.replace(slotPattern, replacer);
    }
  
    /* global box */
    $("#box").text(story);

  }
  
  /* global clicker */
  $("#clicker").click(generate);
  
  generate();
  
}

// let's get this party started - uncomment me
main();