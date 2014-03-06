
var http = require("http");
var url = require('url');
var fs = require('fs');
var nicknames = [];

var server = http.createServer(function(request, response) {

    var path = url.parse(request.url).pathname;

    switch (path) {

        case '/':
            response.writeHead(200, {'Content-Type': 'text/html'});
            response.write('hello world');
            response.end();
            break;

        default:
            fs.readFile(__dirname + path, function(error, data) {
                if (error) {
                    response.writeHead(404);
                    response.write("opps this doesn't exist - 404");
                    response.end();
                }
                else {
                    response.writeHead(200, {'Content-Type': 'text/html'});
                    response.end(data);
                }
            });
            break;
    }

});

server.listen(8002);

var io = require('socket.io').listen(server);

io.set('log level', 1);

io.sockets.on('connection', function(socket) {

    //recieve client data
    socket.on('client_data', function(data) {
        // send client data
        io.sockets.emit('message', {'message': data, 'user': socket.nickname});

    });

    // when username is added
    socket.on('username', function(data, callback) {

        // if nickname already exists in array then return false
        if (nicknames.indexOf(data) != -1) {
            callback(false);
        } else {
            callback(true);
            socket.nickname = data;
            nicknames.push(socket.nickname);
            io.sockets.emit('usernames', nicknames);
        }
    });

    socket.on('disconnect', function(data) {
        if (!socket.nickname) {
            return
        } else {
            nicknames.splice(nicknames.indexOf(socket.nickname), 1);
            io.sockets.emit('usernames', nicknames);
        }
    });

});