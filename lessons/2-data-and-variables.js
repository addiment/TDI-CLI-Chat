// ----- Objects & Data Types -----

// Many programming languages have a concept called types.
// Types that are inherent to a language instead of created by someone else are usually called "primitive" types.
// JavaScript has 7 primitives, but we only really care about 5:
// Primitives can be created with **literals**, ie. typing out a value. 
// Here's the 5 most common primitive types:

// 1. Boolean, a value that represents either "true" or "false"
//    Some example Boolean literals:

true
false

// 2. Number, which can be an integer (i.e. 1, -6, 100, 3)
//    or a decimal (i.e. 1.5, -0.753, 502.325)
//    Some example Number literals:

2000 // Decimal (integral) notation.
30.20 // Decimal (floating-point) notation.
0x10 // Hexadecimal notation! We won't be using this,
     // but if you know it already, you can use it for numbers (if you want).
0b1010 // Binary notation! Same deal as hexadecimal in terms of use.

// 3. String, a "string" of characters (that's why they're called "strings")
//    Some example String literals:

"JavaScript sure has a lot of types"
'This example uses single quotes, but works just the same.'

// 4. "null", which is a special type that represents nothingness (Null. Zip. Nada.).
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
decl = "That's really cool!"; // Here's our defintion! This is where we set the value.
console.log(decl); // expected output: "That's really cool!"

// There's another keyword for declaring variables that we'll use:
// "const" is used for constant (unchangeable) values.
// It can't be changed using "=" or redeclared with another "const".

const ant = "Unchangeable!";
console.log(ant);

// Uncomment these lines if you want to see it fail.
// These are examples of what you CAN'T do!

/*
ant = "it's totally changeable!"     // This won't work!
const ant = "it's re-declarable!";  // Neither will this!
*/

// If you're especially curious, the last two datatypes we didn't mention are BigInt and Symbol.
// You can read more about them at https://developer.mozilla.org/JavaScript/Data_structures 
