const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const socketio = require('socket.io');
const http = require('http');

const router = require('./router');
const TableRooms  = require('./TableRooms');
const Card = require('./Card');
const Player = require('./Player');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const tableRooms = new TableRooms();

// Socket connections
io.on('connection', (socket) => {
  console.log('New connection');

  socket.on('join', ({ table }, callback) => {
    tableRooms.createTable(table);
    const cards = [];
    cards.push(new Card(2, 's'));
    cards.push(new Card(3, 's'));
    cards.push(new Card(4, 's'));
    cards.push(new Card(5, 's'));
    cards.push(new Card(9, 'h'));
    const player1 = new Player('lmao');
    player1.addCards([new Card(6, 'h'), new Card(10, 'h')]);
    const player2 = new Player('xd');
    player2.addCards([new Card(7, 'c'), new Card(8, 'd')]);
    tableRooms.tables.abc.addCards(cards);
    tableRooms.tables.abc.addPlayer(player1);
    //tableRooms.tables.abc.addPlayer(player2);
    tableRooms.tables.abc.findWinner();
    socket.join(table);
  });

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

