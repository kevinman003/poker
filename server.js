const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const socketio = require('socket.io');
const http = require('http');

const routes = require('./routes');
const { addTable, getTable } = require('./controllers/TableRooms');

const Player = require('./controllers/Player');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Socket connections
io.on('connection', (socket) => {
  console.log('New connection');
  socket.on('join', ({ table, id }, callback) => {
    if (!getTable(table)) addTable(table);
    const currTable = getTable(table);
    const players = currTable.getPlayers();

    if (!players.some((player) => player.id === id)) {
      const currPlayer = new Player('player1', id);
      currTable.addPlayer(currPlayer);
      callback(currPlayer);
    } else {
      callback(players.find((player) => player.id === id));
    }
    const newPlayers = currTable.getPlayers();
    io.to(table).emit('updatePlayer', { newPlayers });
    socket.emit('updatePlayer', { newPlayers });
    callback(newPlayers);
    socket.join(table);
  });

  socket.on('start', ({ table }, callback) => {
    const currTable = getTable(table);
    currTable.dealFlop();
    callback(currTable.getCards());
  });

  // dummy functions
  socket.on('playerAction', ({ action, currPlayer }, callback) => {
    console.log(action, currPlayer.name);
    // switch (action) {
    //   case "checkCall":
    //   case "fold":
    //   case "raise":
    // }
    callback();
  });
  socket.on('disconnect', () => {
    console.log('User left');
  });
});

// const table = 'abc';
// tableRooms.createTable(table);
// const cards = [];
// cards.push(new Card(3, 's'));
// cards.push(new Card(3, 's'));
// cards.push(new Card(8, 's'));
// cards.push(new Card(7, 'd'));
// cards.push(new Card(4, 'd'));
// const player1 = new Player('lmao');
// player1.addCards([new Card(8, 'h'), new Card(8, 'h')]);
// const player2 = new Player('xd');
// player2.addCards([new Card(7, 's'), new Card(7, 'h')]);
// tableRooms.tables.abc.addCards(cards);
// tableRooms.tables.abc.addPlayer(player1);
// tableRooms.tables.abc.addPlayer(player2);
// const winner = tableRooms.tables.abc.findWinner();
// // console.log('WINNER: ', winner);
// tableRooms.tables.abc.dealFlop();

// Middleware
app.use(routes);

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

// Starting server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
