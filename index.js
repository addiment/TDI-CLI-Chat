const process = require('node:process');
const net = require('node:net');
const readline = require('node:readline');

/**
 * @typedef {object} MessageStruct
 * @property {string} content The content of the message. Just a string.
 * @property {boolean} isOutgoing Whether the message is something we sent or something we received. Outgoing is something we sent ourselves.
*/

const ANSI_ESCAPE = '\x1b[';
const ANSI_RESET = ANSI_ESCAPE + '0m';
const ANSI_FG_CYAN = ANSI_ESCAPE + '36m';
const ANSI_FG_GREEN = ANSI_ESCAPE + '32m';
const ANSI_FG_BWHITE = ANSI_ESCAPE + '97m';
const ANSI_BG_BWHITE = ANSI_ESCAPE + '107m';
const ANSI_FG_BLACK = ANSI_ESCAPE + '30m';

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

rl.pause(); // Disable console input at first.

/**
 * Quits the program and closes any open connections
 * @param {Error} [error] An error, if present.
 */
async function quit(error) {
    process.stdout.write(ANSI_RESET); // Reset any lingering styles.
    if (chatServer) {
        chatServer.unref(); // RTFM for .unref()
        chatServer.close();
    }
    if (messageSocket) {
        messageSocket.unref();
        if (!messageSocket.destroyed) messageSocket.destroy();
    }
    if (error) {
        console.log('\n', error);
        process.exit(1);
    } else {
        process.stdout.write(ANSI_FG_GREEN + "Connection closed!" + ANSI_RESET);
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
        createConsole(); // If we were given an already-connected socket, create the user interface.
    } else { // If we were given a connecting socket, wait until it gets connected.
        socket.on('connect', () => {
            if (chatServer) chatServer.close(); // server.close will still maintain currently opened connections
            messageSocket = socket;
            createConsole();
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
        messageHistory.push({ content: data.toString('utf-8'), isOutgoing: false }); // Add to message history
        pushMessage(data.toString('utf-8'), false); // Add the message to the screen
    });
}

/**
 * Creates the interface initially. This is where the 'line' (line feed) event is.
 */
async function createConsole() {
    // Initialize the client
    rl.resume();
    rl.on('line', line => {
        process.stdout.moveCursor(0, -1); // Offset the newline that gets added to the screen
        if (line.trim().length > 0) {
            messageSocket.write(line); // Send our message over the 'net
            messageHistory.push({ content: line, isOutgoing: true }); // Add to message history
            pushMessage(line, true); // Add to screen
        } else {
            fullRedraw(); // Whitespace is fucked, redraw the screen.
            // regenPrompt();
        }
    });
    process.stdout.on('resize', fullRedraw); // Redraw the window if it changes size
    fullRedraw(); // Redraw the window to "initialize" it
}

// Regenerates and prints the prompt.
function regenPrompt() {
    // Creates a bar (string) the width of the screen 
    let p = ANSI_BG_BWHITE + ANSI_FG_BLACK + '*' + ANSI_FG_BWHITE;
    for (var i = 0; i < process.stdout.columns - 2; i++) {
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
        pushMessage(msg.content, msg.isOutgoing, true); // Print old messages
    });
    process.stdout.write('\n');
    regenPrompt(); // Generate a prompt
}

/**
 * Prints a message to the message log by moving the cursor to above the prompt and then line feeding.
 * @param {string} str The message content.
 * @param {boolean} outgoing Whether or not to style the message as if we sent it.
 * @param {boolean} noPrompt Whether or not to move the cursor around willy-nilly. This is used for the {@link fullRedraw} function.
 */
function pushMessage(str, outgoing, noPrompt) {
    if (!noPrompt) process.stdout.moveCursor(0, -2); // Move cursor to above the prompt
    process.stdout.cursorTo(0); // Set the cursor to the beginning of the line
    process.stdout.clearScreenDown(); // Clear the old prompt, do this cuz the command line overwrites old text instead of inserting it
    if (outgoing) { // Change the style based on who sent the message
        process.stdout.write(ANSI_FG_CYAN + str + ANSI_RESET + '\n'); // Write the message
    } else {
        process.stdout.write(ANSI_FG_GREEN + str + ANSI_RESET + '\n');
    }
    process.stdout.cursorTo(0); // Send the cursor back to the beginning again
    if (!noPrompt) {
        process.stdout.moveCursor(0, 1); // Move the cursor up (just as a spacer)
        regenPrompt(); // Make a new prompt
    }
    return;
}

rl.on('SIGINT', quit); // Allow users to quit properly.

for (let i = 2; i < process.argv.length; i++) {
    switch (process.argv[i].toLowerCase()) {
        case "-s":
            console.log("Hosting server");
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
            console.log("Joining server");
            // Create connection
            if (!process.argv[++i]) {
                console.log("Needs IP parameter!");
                break;
            }
            if (net.isIP(process.argv[i])) {
                const socket = net.createConnection({ host: process.argv[i], port: 2022 });
                handleSocket(socket);
            }
            i = process.argv.length;
            break;
        default:
            console.log("Unrecognized parameter \"", process.argv[i].toLowerCase(), "\"!");
            break;
    }
}