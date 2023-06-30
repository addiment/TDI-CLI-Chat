// For input/output, exiting the program, and command line arguments
const process = require('node:process');
const stdout = process.stdout;
const stdin = process.stdin;
// For user input
const readline = require('node:readline');
// For networking
const net = require('node:net');

// The address of the client.
// Change this to the IP address of whoever you want to connect to (if you're the client)
const SERVER_ADDRESS = 'localhost';
// The port to use for connections
const SERVER_PORT = 2023;

// Our input controller
const rl = readline.createInterface({
    input: stdin,
    output: stdout,
    prompt: '',
});

function regenPrompt() {
    // Kind of like console.log, but without formatting (we control everything)
    stdout.write('\n');
    rl.setPrompt("> ");
    // make sure the readline interface is accepting input 
    rl.prompt(true);
}

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

/**
 * Quits the program and closes any open connections
 * @param {boolean} [error] If there was an error
 */
function quit(error) {
    // FILL IN: Call the closeSocket function
    // FILL IN: Tell readline to stop listening for input with the interface's close function
    if (error) {
        process.exitCode = 1;
    }
    else {
        process.exitCode = 0;
    }
}

/**
 * Closes the server.
 */
function closeServer() {
    if (chatServer) {
        chatServer.unref();
        // FILL IN: Close the chat server with its close function
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
 * When the shared socket connection closes
 * @param {boolean} didErr Whether or not it closed with an error
 */
function onSocketClose(didErr) {
    // FILL IN: Close our socket with the closeSocket function
    console.log('\n--- Connection closed. ---');
    // FILL IN: Call our quit function with the boolean argument of whether the program closed with an error
}

/**
 * When we request to close the chat (will only run once)
 */
function onQuit() {
    if (messageSocket) {
        // FILL IN: Close our socket with the closeSocket function
    } else if (chatServer) {
        // FILL IN: Close our server with the closeSocket function
        console.log('--- Stopped listening for connections. ---');
        // FILL IN: Call our quit function with the argument false, for no error
    }
}

/**
 * When we press enter (usually to send a message)
 * @param {string} line The content of the line
 */
function onSubmit(line) {
    stdout.moveCursor(0, -2);
    stdout.cursorTo(0);
    stdout.clearScreenDown()
    // FILL IN: Write the string of the line to the messageSocket using its write function
    console.log("You: " + line);
    // FILL IN: Regenerate our > propt with the regenPrompt function
}

/**
 * When we receive a message
 * @param {Buffer} data The message data
 */
function onReceiveMessage(data) {
    // make sure we don't accidentally overwrite anything
    rl.pause()
    // move the cursor up one and all the way to the left
    stdout.moveCursor(0, -1);
    stdout.cursorTo(0);
    // clear everything downwards
    stdout.clearScreenDown();
    // Print out the message we received
    console.log("Them: " + data.toString());
    // Restore the message prompt
    // FILL IN: Regenerate our > propt with the regenPrompt function
}

/**
 * Handles the initial server/client socket connection.
 * @param {net.Socket} socket
 * @param {boolean} isReady
 */
function handleSocket(socket, isReady) {
    // We aren't accepting any more connections, so close the server
    // FILL IN: Close the server with the closeServer function

    // Store the socket connection as a global variable
    messageSocket = socket;

    // Don't be fooled- this "motd" function is only
    // usable inside of this "handleSocket" function!
    function connectCallback() {
        // Some JavaScript trickery: the "or" operator (aka. the two pipes) evaluates to whichever statement is true.
        console.log("--- Now connected to", (socket.remoteAddress || socket.localAddress), "---\n");
        // When we receive a message, run "onReceiveMessage"
        socket.on('data', onReceiveMessage);
        // When the socket closes, run "onSocketClose"
        socket.on('close', onSocketClose);
        // Restore the message prompt
        // FILL IN: Regenerate our > propt with the regenPrompt function
    }

    if (isReady) {
        // if connected, print the motd
        // FILL IN: Call the function we just declared inside of the handleSocket function
    } else {
        // if waiting to connect, print the motd when connected
        socket.once('connect', connectCallback);
    }
}

/**
 * When the listen server receives its first connection (run only once)
 * @param {net.Socket} socket 
 */
function onServerConnection(socket) {
    handleSocket(socket, true);
    // Nobody else is connecting... why keep the server up? 
    // FILL IN: Close the server with the closeServer function
}

// When we press enter, run "onSubmit"
rl.on('line', onSubmit);

// When we press Ctrl + C, run "onQuit"
rl.once('SIGINT', onQuit);

// Start accepting user input
// FILL IN: Listen for user input with the readline interface's resume() function

function doServerStuff() {
    console.log("--- Waiting for a connection... ---");
    // Create a TCP server
    chatServer = net.createServer();
    // allow only one connection (this is one-on-one)
    chatServer.maxConnections = 1;
    chatServer.once('connection', onServerConnection);
    // FILL IN: Tell our chatServer to listen() to port SERVER_PORT
}

function doClientStuff() {
    console.log("--- Joining server... ---");
    // Create a socket connection and then give it to the handleSocket function 
    handleSocket(
        net.createConnection({
            host: SERVER_ADDRESS,
            port: SERVER_PORT
        })
    );
}

if (process.argv.includes('client')) {
    // FILL IN: Call the function that does client stuff
} else {
    // FILL IN: Call the function that does server stuff
}