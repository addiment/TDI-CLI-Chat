const process = require('node:process');
// "destructuring assignment" syntax
const { stdin, stdout } = process;
// For user input
const readline = require('node:readline');

// Our input controller
const rl = readline.createInterface({
    input: stdin,
    output: stdout,
    prompt: '',
});

/**
 * Prints a message to the message log by moving the cursor to above the prompt and then line feeding.
 * @param {string} str The message content.
 * @param {boolean} [isRedraw] Whether or not to move the cursor around willy-nilly and add message to history. This is used for the {@linkcode fullRedraw} function.
 */
function printMessage(str, isRedraw) {
    // Move cursor up two lines,
    // one for the line that gets added when we press enter,
    // and one for the message prompt bar.
    if (!isRedraw) stdout.moveCursor(0, -2);
    // Move the cursor to the beginning of the current line and erase downwards
    stdout.cursorTo(0);
    stdout.clearScreenDown();
    // If we aren't re-printing a message, add it to the message history.
    if (!isRedraw) messageHistory.push({ content: str, type });
    // Write the message to the screen
    stdout.write(str);
    // Cursor to beginning of line again
    stdout.cursorTo(0);
    // 
    if (!isRedraw) {
        stdout.moveCursor(0, 1);
        regenPrompt();
    }
    return;
}

function regenPrompt() {
    // \u2588 is the unicode full-block character. We're using 
    String.fromCharCode(...(Array().fill('\u2588', 0, stdout.columns - 1)));
    stdout.write(out + '\n');
    stdout.cursorTo(rl.getCursorPos().cols, stdout.rows);
    rl.prompt(true);
}

// Sends an ANSI escape command to clear the screen, then re-prints all past messages and regenerates the prompt. 
function fullRedraw() {
    // Clear the screen using special characters
    stdout.write('\x1b[2J\x1b[3J');
    stdout.cursorTo(0, stdout.rows); // Move the cursor to the bottom to start
    for (const msg of messageHistory) {
        printMessage(msg.content, msg.type, true);
    };
    stdout.write('\n');
    regenPrompt();
}

module.exports = { printMessage, regenPrompt, fullRedraw };