const http = require('http');
const app = require('./app');


const BullObject = require('./server/modules/users/helpers/queueHelper');

const server = http.createServer(app);

const io = require('socket.io')(server);

app.set('socketio', io);

const port = 3000;

BullObject.addRepeatableJobToQueue();

server.listen(port, 'localhost'); //localhost:3000

/*io.on('connection', socket => {
    console.log(socket.id);
    socket.emit('pay-message', 'Hi payment done')
});*/

