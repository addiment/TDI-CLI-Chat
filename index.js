const process = require('node:process');
const net = require('node:net');
const fs = require('fs');
const readline = require('node:readline');

/**
 * @typedef {object} MessageStruct
 * @property {string} content The content of the message. Just a string.
 * @property {MessageType} type Whether the message is something we sent, something we received, or something like an error message.
*/

// Ansi Escape Code Shorthand
const ANSI_ESCAPE = '\x1b[';
const ANSI_RESET = ANSI_ESCAPE + '0m';
const ANSI_FG_RED = ANSI_ESCAPE + '31m';
const ANSI_FG_YELLOW = ANSI_ESCAPE + '33m';
const ANSI_FG_CYAN = ANSI_ESCAPE + '36m';
const ANSI_FG_GREEN = ANSI_ESCAPE + '32m';
const ANSI_FG_WHITE = ANSI_ESCAPE + '37m';
const ANSI_FG_BWHITE = ANSI_ESCAPE + '97m';
const ANSI_BG_BWHITE = ANSI_ESCAPE + '107m';
const ANSI_FG_BLACK = ANSI_ESCAPE + '30m';

/**
 * Enum for a log message's type.
 * @readonly
 * @enum {0 | 1 | 2}
 */
const MessageType = {
    MESSAGE_SYSINFO: 0,
    MESSAGE_SYSSUCCESS: 1,
    MESSAGE_SYSWARNING: 2,
    MESSAGE_SYSERROR: 3,
    MESSAGE_OUTGOING: 4,
    MESSAGE_INCOMING: 5
}

/** @type {MessageStruct[]} */
var messageHistory = [];
/** @type {net.Socket} */
var messageSocket = null;
/** @type {net.Server} */
var chatServer = null;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: ANSI_FG_CYAN,
});

/**
 * Quits the program and closes any open connections
 * @param {Error} [error] An error, if present.
 */
async function quit(error) {
    if (chatServer) {
        chatServer.unref(); // RTFM for .unref()
        chatServer.close();
    }
    if (messageSocket) {
        messageSocket.unref();
        if (!messageSocket.destroyed) messageSocket.destroy();
    } else if (!error) {
        pushMessage('Aborting connection!', MessageType.MESSAGE_SYSWARNING);
        process.stdout.write(ANSI_RESET); // Reset any lingering styles.
        process.exit(0);
    }
    if (error) {
        pushMessage(`Error: ${error}`, MessageType.MESSAGE_SYSERROR);
        process.stdout.write(ANSI_RESET);
        process.exit(1);
    } else {
        pushMessage("Connection closed.", MessageType.MESSAGE_SYSINFO);
        process.stdout.write(ANSI_RESET);
        process.exit(0);
    }
}

/**
 * Handles server/client connections.
 * @param {net.Socket} socket
 */
async function handleSocket(socket) {
    if (socket.readyState == 'open') {
        messageSocket = socket;
        pushMessage(`Now connected to ${socket.localAddress || socket.remoteAddress}`, MessageType.MESSAGE_SYSSUCCESS);
    } else { // If we were given a connecting socket, wait until it gets connected.
        socket.on('connect', () => {
            if (chatServer) chatServer.close(); // server.close will still maintain currently opened connections
            messageSocket = socket;
            pushMessage(`Now connected to ${socket.localAddress || socket.remoteAddress}`, MessageType.MESSAGE_SYSSUCCESS);
        });
    }
    // Create socket event listeners
    socket.on('close', didErr => {
        if (!didErr) quit(); // If we encounter an error, that event listener will quit the program with more information. Don't quit here.
    });
    socket.on('error', err => {
        quit(err); // Quit on error.
    });
    socket.on('data', data => { // When we receive a message
        pushMessage(data.toString('utf-8'), MessageType.MESSAGE_INCOMING); // Add the message to the screen
    });
}

// Regenerates and prints the prompt.
function regenPrompt() {
    // Creates a bar (string) the width of the screen 
    let p = ANSI_BG_BWHITE + ANSI_FG_BLACK + '*' + ANSI_FG_BWHITE;
    for (var i = 0; i < process.stdout.columns - 1; i++) {
        p += '\u2588'; // The Unicode "full block" character, U+2588
    }
    // Remove any leftover formatting and make a new line
    p += ANSI_RESET + '\n';
    process.stdout.write(p); // Write the bar to the screen
    process.stdout.cursorTo(rl.getCursorPos().cols, process.stdout.rows); // Move the cursor back to where it was (the text input)
    rl.prompt(true); // Regenerate the readline module prompt
}

// Sends an ANSI escape command to clear the screen, then re-prints all past messages and regenerates the prompt. 
function fullRedraw() {
    process.stdout.write(ANSI_ESCAPE + '2J' + ANSI_ESCAPE + '3J'); // Clear the screen
    process.stdout.cursorTo(0, process.stdout.rows); // Move the cursor to the bottom to start
    messageHistory.forEach(msg => {
        pushMessage(msg.content, msg.type, true); // Print old messages
    });
    process.stdout.write('\n');
    regenPrompt(); // Generate a prompt
}

/**
 * @param {string} str The string to print
 * @param {string} prefix The line prefix
 * @param {string} suffix The line suffix
 * @param {'right' | 'left'} [side] The side of the screen
 * @param {string} [indicator] The message indicator (like '> ')
 * @param {number} [indicatorLength] The indicator length. This is separate from string.length so that escape codes are ignored.
 */
function printWithDirectionWrap(str, prefix, suffix, side = 'left', indicator = '', indicatorLength = 0) {
    let splitStrings = [];
    // process.stdout.columns = good for max
    let maxLineLength = Math.floor(process.stdout.columns / 2);
    let splitCount = Math.ceil((str.length + indicatorLength) / maxLineLength);
    let lineOffset = 0;
    if (splitCount > 1) {
        lineOffset = maxLineLength;
    } else {
        lineOffset = str.length + indicatorLength;
    }
    for (let i = 0; i < splitCount; i++) {
        let subStr = str.substring(i * maxLineLength, (i + 1) * maxLineLength);
        splitStrings.push(subStr);
    }
    for (let i = 0; i < splitStrings.length; i++) {
        if (side == 'right') process.stdout.cursorTo(process.stdout.columns - lineOffset);
        if (i == 0) process.stdout.write(indicator);
        process.stdout.write(prefix + splitStrings[i] + suffix + '\n');
    }
}

/**
 * Prints a message to the message log by moving the cursor to above the prompt and then line feeding.
 * @param {string} str The message content.
 * @param {MessageType} type How to style the message (color, position, etc.)
 * @param {boolean} [isRedraw] Whether or not to move the cursor around willy-nilly. This is used for the {@link fullRedraw} function.
 */
function pushMessage(str, type, isRedraw) {
    if (!isRedraw) {
        process.stdout.moveCursor(0, -2); // Move cursor to above the prompt
    }
    process.stdout.cursorTo(0); // Set the cursor to the beginning of the line
    process.stdout.clearScreenDown(); // Clear the old prompt, do this cuz the command line overwrites old text instead of inserting it
    if (!isRedraw) {
        messageHistory.push({ content: str, type }); // Add to message history
    }
    switch (type) { // Change the style based on who sent the message
        case MessageType.MESSAGE_SYSINFO:
            printWithDirectionWrap(str, ANSI_FG_WHITE, ANSI_RESET, 'left');
            break;
        case MessageType.MESSAGE_SYSSUCCESS:
            printWithDirectionWrap(str, ANSI_FG_GREEN, ANSI_RESET, 'left');
            break;
        case MessageType.MESSAGE_SYSWARNING:
            printWithDirectionWrap(str, ANSI_FG_YELLOW, ANSI_RESET, 'left');
            break;
        case MessageType.MESSAGE_SYSERROR:
            printWithDirectionWrap(str, ANSI_FG_RED, ANSI_RESET, 'left');
            break;
        case MessageType.MESSAGE_INCOMING:
            printWithDirectionWrap(str, ANSI_FG_GREEN, ANSI_RESET, 'left', ANSI_FG_BWHITE + '> ', 2);
            break;
        case MessageType.MESSAGE_OUTGOING:
            printWithDirectionWrap(str, ANSI_FG_CYAN, ANSI_RESET, 'right', ANSI_FG_BWHITE + '> ', 2);
            break;
    }
    process.stdout.cursorTo(0); // Send the cursor back to the horizontal beginning again
    if (!isRedraw) {
        process.stdout.moveCursor(0, 1); // Move the cursor up (just as a spacer)
        regenPrompt(); // Make a new prompt
    }
    return;
}

// Initialize the client
rl.resume();
rl.on('SIGINT', quit); // Allow users to quit properly.
rl.on('line', line => {
    process.stdout.moveCursor(0, -1); // Offset the newline that gets added to the screen
    if (messageSocket != null && line.trim().length > 0) {
        messageSocket.write(line); // Send our message over the 'net
        pushMessage(line, MessageType.MESSAGE_OUTGOING); // Add to screen
    } else {
        fullRedraw(); // Whitespace is broken, redraw the screen.
        // regenPrompt();
    }
});
process.stdout.on('resize', fullRedraw); // Redraw the window if it changes size
fullRedraw(); // Redraw the window to actually initialize it

for (let i = 2; i < process.argv.length; i++) {
    switch (process.argv[i].toLowerCase()) {
        case "-s":
            pushMessage("Hosting server...", MessageType.MESSAGE_SYSINFO);
            // Create a server
            const server = net.createServer(handleSocket);
            chatServer = server;
            server.maxConnections = 1; // Limit the connection to direct messages
            server.listen(2022); // Use port 2022
            server.on('error', err => {
                quit(err);
            });
            i = process.argv.length; // Stop searching params
            break;
        case "-ip":
            // Create connection
            if (!process.argv[++i]) {
                pushMessage("No adress specified!", MessageType.MESSAGE_SYSERROR)
                break;
            }
            pushMessage("Joining server...", MessageType.MESSAGE_SYSINFO)
            if (net.isIP(process.argv[i])) {
                const socket = net.createConnection({ host: process.argv[i], port: 2022 });
                handleSocket(socket);
            }
            i = process.argv.length;
            break;
        default:
            pushMessage("Unrecognized parameter \"", process.argv[i].toLowerCase(), "\"!", MessageType.MESSAGE_SYSWARNING);
            break;
    }
}