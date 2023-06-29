// ----- Functions -----

// Functions allow you to write code and use it more than once!
// They can be named whatever you want, just like variables,
// but it's usally best to give them a name that explains what they do.

function myFunction() {
    console.log("This is my function!"); // This function calls another function: console.log
}

// The parentheses call the function.
myFunction();
// Let's call it again!
myFunction();

// If we don't use parenthesis, it would be treated just like a value because it's an object:
let sameThing = myFunction;
// What do you think will happen when we call...
sameThing();

// A brief note on "Recursion":
// Functions can also call themselves just like they can call any other function.
// This can let you do some pretty cool things, but it can be really hard to figure out, program, and read.
// You almost never need to use it, either, so we won't be using it in this strand.

// Functions can also take one or more arguments in parenthesis.
// These are treated just like variables inside the function,
// but outside the function they simply don't exist

function greet(theirName) {
    console.log("Hello there,", theirName);
}

greet("Addison");
greet("Ethan");
greet("Johannes");
greet("Campers");

// This function takes 2 arguments, separated by commas,
// and calls the console.log function with 3!
function saySomething(thingToSay, person) {
    console.log('Hey', person, thingToSay);
}

saySomething("you're pretty cool!", "Johannes");
saySomething("you're not!", "Elon Musk");

// Functions can also return values with the "return" keyword.
// This passes the value from the inside of the function to the outside where it's called.

function letsMultiply(a, b) {
    return a * b;
}

let x = 10;
let y = 8;

// Our function is called instead of being treated as a value because of the (parenthesis).
let c = letsMultiply(x, y);

console.log(x, "multiplied by", y, "is", c);
