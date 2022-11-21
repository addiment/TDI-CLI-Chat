// For stdin/stdout and exit
const process = require('node:process');
// For networking
const net = require('node:net');
// For user input
const readline = require('node:readline');

// Configuration file
const cfg = require('./cfg.json');

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms = 1000));
}

/** @typedef {'system'|'incoming'|'outgoing'} MessageType */

/**
 * @typedef {object} MessageStruct
 * @property {string} content The content of the message. Just a string.
 * @property {MessageType} type Whether the message is something we sent, something we received, or something like an error message.
*/

/**
 * Array of all past messages.
 * @type {MessageStruct[]}
 */
var messageHistory = [];
/**
 * The socket messages are sent through 
 * @type {net.Socket}
 */
var messageSocket = null;
/**
 * The server (if hosting).
 * @type {net.Server}
 */
var chatServer = null;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '',
});

// Regenerates and prints the prompt.
function regenPrompt() {
    // Creates a bar (string) the width of the screen
    let out = '';
    for (var i = 0; i < process.stdout.columns; i++) {
        out += '\u2588'; // The Unicode "full block" character, U+2588
    }
    // Make a new line
    out += '\n';
    // Write the bar to the screen
    process.stdout.write(out);
    // Move the cursor back to where it was (the text input)
    process.stdout.cursorTo(rl.getCursorPos().cols, process.stdout.rows);
    // Regenerate the readline module prompt
    rl.prompt(true);
}

// Sends an ANSI escape command to clear the screen, then re-prints all past messages and regenerates the prompt. 
function fullRedraw() {
    // Clear the screen using special characters
    process.stdout.write('\x1b[2J\x1b[3J');
    process.stdout.cursorTo(0, process.stdout.rows); // Move the cursor to the bottom to start
    messageHistory.forEach(msg => {
        pushMessage(msg.content, msg.type, true); // Print old messages
    });
    process.stdout.write('\n');
    regenPrompt(); // Generate a prompt
}

/**
 * @param {string} str The string to print
 * @param {'right' | 'left'} [side] The side of the screen
 * @param {string} [indicator] The message indicator (like '> ')
 */
function printWithDirectionWrap(str, side = 'left', indicator = '') {
    let splitStrings = [];
    // process.stdout.columns = good for max
    let maxLineLength = Math.floor(process.stdout.columns / 2);
    let splitCount = Math.ceil((str.length + indicator.length) / maxLineLength);
    let lineOffset = 0;
    if (splitCount > 1) {
        lineOffset = maxLineLength;
    } else {
        lineOffset = str.length + indicator.length;
    }
    for (let i = 0; i < splitCount; i++) {
        let subStr = str.substring(i * maxLineLength, (i + 1) * maxLineLength);
        splitStrings.push(subStr);
    }
    for (let i = 0; i < splitStrings.length; i++) {
        if (side == 'right') process.stdout.cursorTo(process.stdout.columns - lineOffset);
        if (i == 0) process.stdout.write(indicator);
        process.stdout.write(splitStrings[i] + '\n');
    }
}

/**
 * Prints a message to the message log by moving the cursor to above the prompt and then line feeding.
 * @param {string} str The message content.
 * @param {MessageType} [type] How to style the message (color, position, etc.)
 * @param {boolean} [isRedraw] Whether or not to move the cursor around willy-nilly and add message to history. This is used for the {@linkcode fullRedraw} function.
 */
function pushMessage(str, type = 'system', isRedraw) {
    if (!isRedraw) process.stdout.moveCursor(0, -2); // Move cursor up twice (above the prompt bar)
    process.stdout.cursorTo(0); // Move the cursor all the way to the left
    process.stdout.clearScreenDown(); // Clear the old prompt, do this cuz the command line overwrites old text instead of inserting it
    if (!isRedraw) messageHistory.push({ content: str, type }); // Add to message history
    switch (type) { // Change the style based on who sent the message
        case 'system':
            printWithDirectionWrap(str, 'left', '');
            break;
        case 'incoming':
            printWithDirectionWrap(str, 'right', '(them)> ');
            break;
        case 'outgoing':
            printWithDirectionWrap(str, 'left', '(you)> ');
            break;
        default:
            throw new Error(`"${type}" is not a valid message type!`);
    }
    process.stdout.cursorTo(0); // Send the cursor back to the horizontal beginning again
    if (!isRedraw) {
        process.stdout.moveCursor(0, 1); // Move the cursor up (just as a spacer)
        regenPrompt(); // Make a new prompt
    }
    return;
}

/**
 * Quits the program and closes any open connections
 * @param {boolean} [error] An error, if any.
 */
function quit(error) {
    closeSocket();
    // Close readline
    rl.close();
    // Exit gracefully
    process.exitCode = !!error;
}

function closeServer() {
    if (chatServer) {
        chatServer.unref();
        chatServer.close();
    }
}

function closeSocket() {
    if (messageSocket) {
        messageSocket.unref();
        messageSocket.end();
        messageSocket.destroy();
    }
}

/**
 * Handles server/client connections.
 * @param {net.Socket} socket
 * @param {boolean} isReady
 */
function handleSocket(socket, isReady) {
    messageSocket = socket;
    closeServer();

    socket.once('connect', () => {
        pushMessage(`Now connected to ${socket.remoteAddress || socket.localAddress}`, 'system');
    });
    if (isReady) socket.emit('connect', false);

    // When the socket closes
    socket.on('close', didErr => {
        closeSocket();
        pushMessage('Connection closed.', 'system');
        quit(didErr);
    });

    // new message
    socket.on('data', data => {
        // Add to screen
        pushMessage(data.toString('utf-8'), 'incoming');
    });
}

// When we hit Ctrl+C (aka. SIGINT), close the connection.
// The program will close on its own when the close event is emitted.
rl.once('SIGINT', () => {
    if (messageSocket) {
        pushMessage('Issued close.', 'system');
        closeSocket();
    } else if (chatServer) {
        closeServer();
        pushMessage('Stopped listening for connections.', 'system');
        quit(true);
    }
});

// When we press enter, do stuff
rl.on('line', line => {
    // Offset the newline that gets added to the screen when we press enter
    process.stdout.moveCursor(0, -1);
    if (messageSocket != null && line.trim().length > 0) {
        // Send our message over the 'net
        messageSocket.write(line);
        // Add to screen
        pushMessage(line, 'outgoing');
    } else {
        fullRedraw(); // Whitespace is broken, redraw the screen.
    }
});

// Initialize the client
rl.resume();

// Redraw the window if it changes size
process.stdout.on('resize', fullRedraw);

// Redraw the screen
fullRedraw();

if (process.argv.includes('server')) {
    pushMessage("Waiting for a connection...", 'system');
    // Create a server
    const server = net.createServer();
    chatServer = server;
    // Limit the server to one connection
    server.maxConnections = 1;
    server.once('connection', socket => {
        handleSocket(socket, true);
        closeServer();
    });
    // Start server on port 2023
    server.listen(2023);
} else {
    // Create connection
    pushMessage("Joining server...", 'system')
    handleSocket(
        net.createConnection({
            host: cfg.clientAddress,
            port: 2023
        })
    );
}