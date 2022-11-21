// For stdin/stdout and exit
const process = require('node:process');
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

/** Array of all past messages.
 * @type {MessageStruct[]} */
var messageHistory = [];
/** The socket messages are sent through 
 * @type {net.Socket} */
var messageSocket = null;
/** The server (if hosting).
 * @type {net.Server} */
var chatServer = null;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '',
});

function regenPrompt() {
    let out = '';
    for (var i = 0; i < process.stdout.columns; i++) {
        out += '\u2588';
    }
    out += '\n';
    process.stdout.write(out);
    process.stdout.cursorTo(rl.getCursorPos().cols, process.stdout.rows);
    rl.prompt(true);
}

// Sends an ANSI escape command to clear the screen, then re-prints all past messages and regenerates the prompt. 
function fullRedraw() {
    // Clear the screen using special characters
    process.stdout.write('\x1b[2J\x1b[3J');
    process.stdout.cursorTo(0, process.stdout.rows); // Move the cursor to the bottom to start
    messageHistory.forEach(msg => {
        pushMessage(msg.content, msg.type, true);
    });
    process.stdout.write('\n');
    regenPrompt();
}

/**
 * @param {string} str The string to print
 * @param {'right' | 'left'} [side] The side of the screen
 * @param {string} [indicator] The message indicator (like '> ')
 */
function printWithDirectionWrap(str, side = 'left', indicator = '') {
    let splitStrings = [];
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
    if (!isRedraw) process.stdout.moveCursor(0, -2);
    process.stdout.cursorTo(0);
    process.stdout.clearScreenDown();
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
    process.stdout.cursorTo(0);
    if (!isRedraw) {
        process.stdout.moveCursor(0, 1);
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

    socket.on('close', didErr => {
        closeSocket();
        pushMessage('Connection closed.', 'system');
        quit(didErr);
    });

    socket.on('data', data => {
        pushMessage(data.toString('utf-8'), 'incoming');
    });
}

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

rl.on('line', line => {
    process.stdout.moveCursor(0, -1);
    if (messageSocket != null && line.trim().length > 0) {
        messageSocket.write(line);
        pushMessage(line, 'outgoing');
    } else {
        fullRedraw();
    }
});

rl.resume();
process.stdout.on('resize', fullRedraw);
fullRedraw();

if (process.argv.includes('server')) {
    pushMessage("Waiting for a connection...", 'system');
    const server = net.createServer();
    chatServer = server;
    server.maxConnections = 1;
    server.once('connection', socket => {
        handleSocket(socket, true);
        closeServer();
    });
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