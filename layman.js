// For input/output, exiting the program, and command line arguments
const process = require('node:process');
const { stdin, stdout } = process;
// For networking
const net = require('node:net');
// For user input
const readline = require('node:readline');

const CLIENT_ADDRESS = 'localhost';
const PORT = 2023;

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

// Our input controller
const rl = readline.createInterface({
    input: stdin,
    output: stdout,
    prompt: '',
});

function regenPrompt() {
    let out = '';
    for (var i = 0; i < stdout.columns; i++) {
        out += '\u2588';
    }
    out += '\n';
    stdout.write(out);
    stdout.cursorTo(rl.getCursorPos().cols, stdout.rows);
    rl.prompt(true);
}

// Sends an ANSI escape command to clear the screen, then re-prints all past messages and regenerates the prompt. 
function fullRedraw() {
    // Clear the screen using special characters
    stdout.write('\x1b[2J\x1b[3J');
    stdout.cursorTo(0, stdout.rows); // Move the cursor to the bottom to start
    for (const msg of messageHistory) {
        pushMessage(msg.content, msg.type, true);
    };
    stdout.write('\n');
    regenPrompt();
}

/**
 * @param {string} str The string to print
 * @param {'right' | 'left'} [side] The side of the screen
 * @param {string} [indicator] The message indicator (like '> ')
 */
function printWithDirectionWrap(str, side = 'left', indicator = '') {
    let splitStrings = [];
    let maxLineLength = Math.floor(stdout.columns / 2);
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
        if (side == 'right') stdout.cursorTo(stdout.columns - lineOffset);
        if (i == 0) stdout.write(indicator);
        stdout.write(splitStrings[i] + '\n');
    }
}

/**
 * Prints a message to the message log by moving the cursor to above the prompt and then line feeding.
 * @param {string} str The message content.
 * @param {MessageType} [type] How to style the message (color, position, etc.)
 * @param {boolean} [isRedraw] Whether or not to move the cursor around willy-nilly and add message to history. This is used for the {@linkcode fullRedraw} function.
 */
function pushMessage(str, type = 'system', isRedraw) {
    if (!isRedraw) stdout.moveCursor(0, -2);
    stdout.cursorTo(0);
    stdout.clearScreenDown();
    if (!isRedraw) messageHistory.push({ content: str, type });
    switch (type) {
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
    stdout.cursorTo(0);
    if (!isRedraw) {
        stdout.moveCursor(0, 1);
        regenPrompt();
    }
    return;
}

/**
 * Quits the program and closes any open connections
 * @param {boolean} [error] If there was an error
 */
function quit(error) {
    closeSocket();
    rl.close();
    process.exitCode = !!error;
}

/**
 * Closes the server.
 */
function closeServer() {
    if (chatServer) {
        chatServer.unref();
        chatServer.close();
    }
}

/**
 * Closes the shared socket connection.
 */
function closeSocket() {
    if (messageSocket) {
        messageSocket.unref();
        messageSocket.end();
        messageSocket.destroy();
    }
}

/**
 * When we receive a message
 * @param {Buffer} data The message data
 */
function onReceiveMessage(data) {
    pushMessage(data.toString(), 'incoming');
}

/**
 * When the shared socket connection closes
 * @param {boolean} didErr Whether or not it closed with an error
 */
function onSocketClose(didErr) {
    closeSocket();
    pushMessage('Connection closed.', 'system');
    quit(didErr);
}

/**
 * When we request to close the chat (run only once)
 */
function onQuit() {
    if (messageSocket) {
        pushMessage('Issued close.', 'system');
        closeSocket();
    } else if (chatServer) {
        closeServer();
        pushMessage('Stopped listening for connections.', 'system');
        quit(true);
    }
}

/**
 * When we press enter (to send a message)
 * @param {string} line The content of the line
 */
function onSubmit(line) {
    stdout.moveCursor(0, -1);
    if (messageSocket != null && line.trim().length > 0) {
        messageSocket.write(line);
        pushMessage(line, 'outgoing');
    } else {
        fullRedraw();
    }
}

/**
 * Handles the initial server/client socket connection.
 * @param {net.Socket} socket
 * @param {boolean} isReady
 */
 function handleSocket(socket, isReady) {
    // We aren't accepting any more connections, so close the server
    closeServer();
    // Store the socket connection as a global variable
    messageSocket = socket;
    pushMessage(`Now connected to ${socket.remoteAddress || socket.localAddress}`, 'system');
    
    // When we receive a message, run "onReceiveMessage"
    socket.on('data', onReceiveMessage);
    // When the socket closes, run "onSocketClose"
    socket.on('close', onSocketClose);
}

/**
 * When the listen server receives its first connection (run only once)
 * @param {net.Socket} socket 
 */
function onServerConnection(socket) {
    handleSocket(socket, true);
    closeServer();
}

// When we press enter, run "onSubmit"
rl.on('line', onSubmit);

// When we press Ctrl + C, run "onQuit"
rl.once('SIGINT', onQuit);

// When the window is resized, run "fullRedraw"
stdout.on('resize', fullRedraw);

rl.resume(); // Start accepting user input
fullRedraw(); // Redraw once to put something on the screen

if (process.argv.includes('server')) {
    pushMessage("Waiting for a connection...", 'system');
    const server = net.createServer();
    chatServer = server;
    server.maxConnections = 1;
    server.once('connection', onServerConnection);
    server.listen(2023);
} else {
    pushMessage("Joining server...", 'system')
    handleSocket(
        net.createConnection({
            host: CLIENT_ADDRESS,
            port: PORT
        })
    );
}