const net = require('node:net');

const PORT = 2023;

/**
 * Print the data we get.
 * The `Buffer` type represents binary data.
 * @param {Buffer} data
*/
function onData(data) {
    console.log("Got data from server:", data.toString());
}

// Create the client connection!
// NOTE: this will FAIL and cause an error if
// the server isn't ALREADY RUNNING!!!
// Run the server first,
// then run the client ALONG SIDE the server! 
const socket = net.createConnection(PORT, "localhost", onConnection);

// Close the client
function doClose() {
    console.log("Disconnecting client!")
    // Disconnect the socket by "destroying" it
    socket.destroy();
}

// Run when the connection is established.
// NOTE: The server's onConnection function takes an argument,
// "socket". The client's function uses the variable defined earlier
// (const socket = net.createConnection [...])
function onConnection() {
    // Register a callback for when data is received
    socket.on('data', onData)
    
    // Send data over the socket
    socket.write("I am the client, hello!");
    
    // Wait 1000ms (1 second), then close the socket
    setTimeout(doClose, 1000);
}
