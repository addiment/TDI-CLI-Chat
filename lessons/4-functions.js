// ----- Functions -----

// Functions allow you to write code and use it more than once.

function myFunction() {
    console.log("my function!");
}

// The parentheses call the function.
myFunction();
// Call it again!
myFunction();

// Functions can also take arguments!

function debate(argument) {
    console.log("You think", argument);
    console.log("But I think that doesn't make any sense!");
}

debate("eating only french fries is healthy");

// Functions can also return values!

function divide(a, b) {
    return a / b;
}

let a = 10;
let b = 8;

console.log(a, "divided by", b, "is", divide(a, b));
