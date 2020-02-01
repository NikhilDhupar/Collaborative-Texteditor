var express = require('express')
var app = express()
var server = require('http').Server(app);
var io = require('socket.io')(server);
// var session = require('express-session');

// app.use(session({
//     secret: "xYzIAMNikhil",
//     resave: false,
//     saveUninitialized: true,
// }));

app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

var socketmapping = []
var istyping = 0;

io.on('connection', (socket) => {

    socket.on('typing', (data) => {
        if (istyping === 0 && socketmapping.length === 0) {
            istyping = 1;
            socketmapping.push(socket.id);
            //io.to(socket.id).emit('allowed','allowed');
        }
        else if(socketmapping[0] === socket.id)
        {
            //io.to(socket.id).emit('allowed','allowed');
        }
        else
        {
            io.to(socket.id).emit('not allowed');
        }
    })

    socket.on('not-typing', () => {
        if (istyping === 1 && socketmapping[0] === socket.id) {
            socketmapping.pop();
            istyping = 0;
            socket.broadcast.emit('allowed');
        }
    })

    socket.on('get-data',()=>{
        if (istyping === 1 && socketmapping[0])
            io.to(socketmapping[0]).emit('get-data');
    })

    socket.on('contentchanges', (delta) => {
        socket.broadcast.emit('contentchanges', delta);
    })

    socket.on('disconnect', () => {
        if (istyping === 1 && socketmapping[0] === socket.id) {
            socketmapping.pop();
            istyping = 0;
            socket.broadcast.emit('allowed');
        }
    });
});

server.listen(3000);
console.log('Running on port 3000');