// For input/output, exiting the program, and command line arguments
const process = require('node:process');
// This syntax is called "destructuring assignment." 
// Basically, it takes the variables we list from the object we put on the right side.
// You can see more examples here:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
const { printMessage, regenPrompt, fullRedraw } = require('console.js');

// The address of the client.
// Change this to the IP address of whoever you want to connect to (if you're the client)
const SERVER_ADDRESS = 'localhost';

/** 
 * Array of all past messages.
 * @type {string[]}
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
    printMessage(data.toString(), 'incoming');
}

/**
 * When the shared socket connection closes
 * @param {boolean} didErr Whether or not it closed with an error
 */
function onSocketClose(didErr) {
    closeSocket();
    printMessage('Connection closed.');
    quit(didErr);
}

/**
 * When we request to close the chat (run only once)
 */
function onQuit() {
    if (messageSocket) {
        printMessage('Issued close.');
        closeSocket();
    } else if (chatServer) {
        closeServer();
        printMessage('Stopped listening for connections.');
        quit(true);
    }
}

/**
 * When we press enter (usually to send a message)
 * @param {string} line The content of the line
 */
function onSubmit(line) {
    stdout.moveCursor(0, -1);
    if (messageSocket != null && line.trim().length > 0) {
        messageSocket.write(line);
        printMessage('(you) > ' + line);
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

    // Don't be fooled- this "motd" function is only
    // usable inside of this "handleSocket" function!
    function motd () {
        printMessage(`Now connected to ${socket.remoteAddress || socket.localAddress}`, 'system');
    };

    if (isReady) {
        motd()
    } else {
        socket.once('connect', motd);
    }

    
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
    printMessage("Waiting for a connection...", 'system');
    const server = net.createServer();
    chatServer = server;
    server.maxConnections = 1;
    server.once('connection', onServerConnection);
    server.listen(2023);
} else {
    printMessage("Joining server...", 'system')
    handleSocket(
        net.createConnection({
            host: SERVER_ADDRESS,
            port: 2023
        })
    );
}