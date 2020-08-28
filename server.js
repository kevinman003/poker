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
io.on('connection', socket => {
  console.log('New connection');
  socket.on('join', ({ table, id }, callback) => {
    if (!getTable(table)) addTable(table);
    const currTable = getTable(table);
    const players = currTable.getPlayers();

    if (!players.some(player => player.id === id)) {
      const currPlayer = new Player('player1', id);
      currTable.addPlayer(currPlayer);
      callback(currPlayer);
    } else {
      callback(players.find(player => player.id === id));
    }
    const newPlayers = currTable.getPlayers();
    io.to(table).emit('updatePlayer', { newPlayers });
    socket.emit('updatePlayer', { newPlayers });
    callback(newPlayers);
    socket.join(table);
  });

  socket.on('start', ({ table, bigBlindAmnt }, callback) => {
    const currTable = getTable(table);
    currTable.dealFlop();
    callback(currTable.getCards());
  });

  socket.on('raise', ({ currPlayer, raise }, callback) => {
    currPlayer.chips -= raise;
    currPlayer.playedChips += raise;
    callback();
  });
  socket.on('disconnect', () => {
    console.log('User left');
  });
});

// Middleware
app.use(routes);

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

// Starting server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
