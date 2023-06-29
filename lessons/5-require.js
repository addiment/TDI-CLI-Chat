// ----- Require -----
// The "require" function is built into Node.js,
// and it allows you to add code from other places.
// The return value of the require function is an object that has objects from the module you import.
// Because modifying code you didn't actually write is usually a bad idea,
// we almost always declare the imported objects with const.
// Starting the string input with "node:" will load one of Node.js's built-in modules.
// For this file/lesson, we'll be requiring the "readline" and "process" modules.
// The readline module makes it easy (at least, compared to other methods) to take in user input.
// The process module does a lot of things, but we need it to access the raw terminal objets (standard in and standard out).

const readline = require('node:readline');
const process = require("node:process");

// Creating a readline interface is how you actually take input and output.
// Typically, we just call it "rl".
// A readline interface requires "streams" (streams are like pipes, but with data instead of water)
// for places to direct input and output.
let options = {
    input: process.stdin,
    output: process.stdout
}
const rl = readline.createInterface(options);

// You can also just use an object literal!
/*
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
*/

// This is our callback for the readline question.
// Whatever you type in 
function response(answer) {
    // The question function will put a string into the first parameter of this callback,
    // but we want a number!
    // Luckily, JavaScript has a function that takes a string and tries to turn it into a number.
    
    // When we talked about literals, we forgot to mention two more Number literals:
    // Not a Number (NaN) represents a value of the Number type that isn't a numeric value. 
    NaN

    // Infinity represents a number too large for JavaScript to represent.
    Infinity
    // It's very unlikely for it to happen, but if you find yourself with a number greater than:
    
    // 179,769,313,486,231,590,772,930,519,078,902,473,361,797,697,894,230,657,273,430,081,157,
    // 732,675,805,500,963,132,708,477,322,407,536,021,120,113,879,871,393,357,658,789,768,814,
    // 416,622,492,847,430,639,474,124,377,767,893,424,865,485,276,302,219,601,246,094,119,453,
    // 082,952,085,005,768,838,150,682,342,462,881,473,913,110,540,827,237,163,350,510,684,586,
    // 298,239,947,245,938,479,716,304,835,356,329,624,224,137,215
    // (aka 2^1024 - 1)
    
    // you get Infinity.
    // In JavaScript, 0 / 0 is also Infinity.

    // Long story short,
    // parseFloat returns NaN if it can't figure out how to turn the text into a number.
    let answerAsNumber = parseFloat(answer);

    // CURSE YOU, JAVASCRIPT!!!!!!
    if (Number.isNaN(answerAsNumber)) { 
        console.log("That's not a number :(");
    } else {
        console.log(answer, "* 2 is", answerAsNumber * 2);
    }
    // When a readline interface is opened,
    // it will keep the program "on" until the interface is closed.
    // Closing the interface when we get an answer will actually close the program. 
    rl.close();
}

rl.question("Enter a number\n", response);
