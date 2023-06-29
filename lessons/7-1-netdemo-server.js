const net = require('node:net');

const PORT = 2023;

/**
 * Print the data we get.
 * The `Buffer` type represents binary data.
 * @param {Buffer} data
*/
function onData(data) {
    console.log("Got data from client:", data.toString());
}

// Create the server!
const server = net.createServer(onConnection);

/**
 * @param {net.Socket} socket
 */
function onConnection(socket) {

    // Make the server stop accepting new connections.
    // This is fine,
    // because the server will keep pre-existing connections
    // (like the one represented by the socket parameter!)
    server.close();

    // Close the connection
    function doClose() {
        console.log("Disconnecting client/server!");
        console.log("Closing server!");
        // Disconnect the socket by "destroying" it
        socket.destroy();
    }

    // Register a callback for when data is received
    socket.on('data', onData)

    // Send data over the socket
    socket.write("I am the server, hello!");

    // Wait 1000ms (1 second), then close the socket
    setTimeout(doClose, 1000);
}

// Print a message when the server is listening
function onListen() {
    console.log("Server listening on port", PORT);
}

// Make the server start listening on port PORT,
// run the onListen callback when finished 
server.listen(PORT, onListen);
