const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const socketio = require('socket.io');
const http = require('http');

const router = require('./routes');
// const TableRooms = require('./controllers/TableRooms');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const socketConnection = require('./socket');

socketConnection(io);

// Middleware
app.use(router);

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

// Starting server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
