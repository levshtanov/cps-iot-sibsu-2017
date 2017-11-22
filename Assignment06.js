var http = require("http").createServer(handler); // on req - hand
var io = require("socket.io").listen(http); // socket library
var fs = require("fs"); // variable for file system for providing html
var firmata = require("firmata");

console.log("Starting the code");

var board = new firmata.Board("/dev/ttyACM0", function(){
    console.log("Connecting to Arduino");
    console.log("Enabling analog Pin 0");
    board.pinMode(0, board.MODES.ANALOG); // analog pin 0
    console.log("Enabling analog Pin 1");
    board.pinMode(1, board.MODES.ANALOG); // analog pin 1
});

function handler(req, res) {
    fs.readFile(__dirname + "/Assignment06.html",
    function (err, data) {
        if (err) {
            res.writeHead(500, {"Content-Type": "text/plain"});
            return res.end("Error loading html page.");
        }
    res.writeHead(200);
    res.end(data);
    })
}

var actualValue = 0; // variable for actual value (output value)
var desiredValue = 0; // desired value var

http.listen(8080); // server will listen on port 8080

board.on("ready", function() {
    
    board.analogRead(1, function(value) {
        actualValue = value; // continuous read of pin A1
    });
    
    board.analogRead(0, function(value){
        desiredValue = value; // continuous read of analog pin 0
    });
    
    io.sockets.on("connection", function(socket) {
        socket.emit("messageToClient", "Server connected, board ready.");
        setInterval(sendValues, 40, socket); // na 40ms we send message to client
    }); // end of sockets.on connection

}); // end of board.on(ready)

function sendValues (socket) {
    socket.emit("clientReadValues",
    { // json notation between curly braces
        "desiredValue": desiredValue,
        "actualValue": actualValue
    });
};


