// ----- Objects & Data Types -----

// Many programming languages have a concept called types.
// Types that are inherent to a language are usually called "primitive" types.
// JavaScript has 7 primitives, but we only really care about 5:
// Primitives are created with **literals**, aka. typing out a value. 


// 1. Boolean, a value that represents either "true" or "false"
//    Literals:

true
false

// 2. Number, which can be an integer (i.e. 1, -6, 100, 3)
//    or a floating-point decimal (i.e. 1.5, -0.753, 502.325)
//    Some Example Literals:

2000 // Decimal (integral) notation.
30.20 // Decimal (floating-point) notation.
0x10 // Hexadecimal notation! We won't be using this (or will we ;) ),
     // but if you know it already, you can use it for numbers (if you want).
0b1010 // Binary notation! Same deal as hexadecimal in terms of use.

// 3. String, a sequence of characters strung (that's why they're called "strings")
//    together in a line. (i.e. "String", "TDI is AWESOME!")
//    Some Example Literals:

"JavaScript has a lot of types... or does it? ;)"
'This example uses single quotes. There are very few differences...'

// 4. "null", which is a special type that represents nothingness (Null. 0. Zip. Nada.).
//    You can use the null type by using the "null" keyword.
//    Literal:

null

// 5. "undefined", which is similar to null, but instead represents a variable with no value.
//    "null" means the VALUE IS NOTHING, and "undefined" means there is NO VALUE.
//    Literal:

undefined

// ----- Variables -----

// The "let" keyword is one of the ways we declare & define variables.
let helloWorld = "Hello World!";
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

let undef; // undefined
let alsoUndef = undefined; // undefined
let defButNoValue = null; // null

// Here's an example of declaration with definition coming later:

let decl; // this is DECLARATION.
console.log(decl); // expected output: undefined
decl = "That's really cool!"; // this is DEFINITION, where we set the value.
console.log(decl); // expected output: "That's really cool!"

// There's another keyword for declaring variables that we'll use:
// "const" is used for constant (unchangable) values.
// It can't be changed using "=" or redeclared with "const".

const ant = "Unchangable!";
console.log(ant);

// Uncomment these lines if you want to see it fail.
// These are examples of what you CAN'T do!

/*
ant = "it's totally changable!"     // This won't work!
const ant = "it's re-declarable!";  // Neither will this!
*/
