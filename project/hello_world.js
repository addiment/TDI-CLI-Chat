// Welcome to JavaScript!


// ----- Function call syntax -----

// Our first step towards learning JavaScript is to learn how to call a function.
// 


// ----- Logging to the console -----

// The "console" object is how we use the JavaScript debug console.
// The log function is really handy,
// it will simply print anything you put into it to the console.
console.log("Hello JavaScript!"); // expected output: "Hello JavaScript!"







// ----- Variables -----

// The "var" keyword is one of the ways we declare & define variables.
var helloWorld = "Hello World!";

console.log(helloWorld); // expected output: "Hello World!"

// But what is the difference between DECLARING and DEFINING a variable?
// What we just did with "helloWorld" was declaration AND definition.
// We DECLARED that the variable "helloWorld" existed,
// then we DEFINED what "helloWorld" was (it was "Hello World!").

// You can think of variables like containers,
// where the contents of the container are the value.  

// Also, think back to null and undefined!
// null is an empty container,
// whereas undefined is no container at all.

var undef; // undefined
var alsoUndef = undefined; // undefined
var defButNoValue = null; // null

// Here's an example of declaration with definition coming later:

var decl; // this is DECLARATION.
console.log(decl); // expected output: undefined
decl = "That's really cool!"; // this is DEFINITION, where we set the value.
console.log(decl); // expected output: "That's really cool!"



// ----- Objects & Data Types -----

// Like most programming languages, JavaScript has types.
// Types that are inherent to a language are usually called "primitive" types.
// JavaScript has 7 primitives, but we only really care about 5:

// TODO: explain what a literal is
// 1. Boolean, a value that represents either "true" or "false"

true
false

// 2. Number, which can be an integer (i.e. 1, 6, 100, 3)
//    or a floating-point decimal (i.e. 1.5, 0.753, 502.325)

2000 // Decimal (integral) notation.
30.20 // Decimal (floating-point) notation.
0x10 // Hexadecimal notation! We won't be using this (or will we ;) ),
     // but if you know it already, you can use it for numbers (if you want). 
0b1010 // Binary notation! Same deal as hexadecimal in terms of use.

// 3. String, a sequence of characters strung (that's why they're called "strings")
//    together in a line. (i.e. "String", "TDI is AWESOME!") 

"JavaScript has a lot of types... or does it? ;)"

// 4. "null", which is a special type that represents nothingness (Null. 0. Zip. Nada.).
//    You can use the null type by using the "null" keyword.

null

// 5. "undefined", which is similar to null, but instead represents a variable with no value.
//    "null" means the VALUE IS NOTHING, and "undefined" means there is NO VALUE.

undefined

// But there's one more sorta-primitive type that comes with JavaScript,
// and that's where everything starts going and can get complicated...



// ----- Everything is Objects! -----

// Remember those memes about cake from a few years ago,
// where people would cut into random objects with knives,
// only to reveal that the object was just a very well-made cake?

// That's JavaScript.

// Objects, at their core, have KEYS and VALUES.
// Keys are words (like variable names) that have values associated with them.
// You can sorta think of objects like "variable containers."

var ourFirstObject = { // You can totally do this on only one line, but it's the same.
    "key": 100,
    // You don't really need quotation marks around keys.
    // You do need them for string values, though! 
    anotherKey: "another value"
};

// This syntax with periods is called "member access".
// Let's print out our object's properties:
console.log(ourFirstObject.key); // expected output: 100
// Here's accessing the other key:
console.log(ourFirstObject.anotherKey); // expected output: "anotherValue"

// (this is where the cake starts)

// No member access?!? 
console.log(ourFirstObject); // expected output: { key: 100, anotherKey: 'another value' }

// We can print out objects just like variables...

// So, what if we did...
console.log(console); // expected output: (no spoilers, you try it!)

// So maybe, just maybe, we can...
console.log(console.log); // (try it!)

// Objects are VARIABLES! Functions are OBJECTS! Functions are VARIABLES!

// Oh my.

// This might be a lot to take in. But don't worry, you'll get used to it.
// We can help you out if you're having trouble!








// ----- let and const ----- (maybe not this one though)

// "let" is another way of declaring/defining variables.
// "let" is different from "var" in that it's only accessible in the same "scope"
// (we'll talk more about scope later) that it was declared in.
// It can also be re-declared in "narrower" scopes.
// You can see examples of how "var" and "let" are different in these links:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/var
let sago = "It's a-me, Mario!";
console.log(sago);


// "const" is a constant value.
// It can't be changed using "=" or redeclared with "const".
const ant = "Unchangable!";
console.log(ant);

// Comment or delete these lines if you want the code to work.
// These are examples of what you CAN'T do.
ant = "it's totally changable!"     // This won't work!
const ant = "it's re-declarable!";  // Neither will this!