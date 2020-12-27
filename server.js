const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const socketio = require('socket.io');
const http = require('http');
const path = require('path');

const router = require('./routes');
// const TableRooms = require('./controllers/TableRooms');

const app = express();

// Middleware
app.use(cors());

app.use(router);

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

const server = http.createServer(app);
const io = socketio(server);

const socketConnection = require('./socket');

socketConnection(io);

if (process.env.NODE_ENV === 'production') {
    app.use(express.static('client/build'));

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
    });
}

// Starting server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
