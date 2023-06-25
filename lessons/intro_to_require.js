const readline = require('node:readline');
const process = require("node:process");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function response(answer) {
    console.log("*boom*");
    rl.close();
}

rl.question("steve jobs\n", response);
