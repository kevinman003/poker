const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const socketio = require('socket.io');
const http = require('http');

const router = require('./router');
const TableRooms  = require('./TableRooms');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const tableRooms = new TableRooms();

// Socket connections
io.on('connection', (socket) => {
  console.log('New connection');

  socket.on('join', ({ table }, callback) => {
    console.log(table);
    tableRooms.createTable(table);
    tableRooms.tables.abc.addCards(['ac', '2d', '4c', '5c', '6c', '7c', '8c']);
    tableRooms.tables.abc.analyzeHand();
    socket.join(table);
  })

  socket.on('disconnect', () => {
    console.log('User left'); 
  })
});

// Middleware 
app.use(router);

app.use(cors());

app.use(bodyParser.urlencoded({extended: true}));

app.use(bodyParser.json());

// Starting server 
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

