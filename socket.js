const { addTable, getTable } = require('./controllers/TableRooms');
const Player = require('./controllers/Player');
const { STREETS } = require('./controllers/constants');

const socketConnection = io => {
  io.on('connection', socket => {
    console.log('New connection', socket.id);
    socket.on('join', ({ table, id }, callback) => {
      if (!getTable(table)) addTable(table);
      const currTable = getTable(table);
      const players = currTable.getPlayers();

      if (!players.some(player => player.id === id)) {
        const currPlayer = new Player(`player-${id}`, id);
        currTable.addPlayer(currPlayer);
        callback(currPlayer);
      } else {
        callback(players.find(player => player.id === id));
      }
      socket.join(table);
      io.to(table).emit('updateTable', { currTable });
    });

    socket.on('sit', ({ table, currPlayer, seatNumber }) => {
      const currTable = getTable(table);
      currTable.playerPositions[seatNumber] = currPlayer.id;
      const player = currTable.getPlayer(currPlayer.id);
      player.seated = seatNumber;

      const seatedPlayers = currTable.players.filter(
        player => player.seated >= 0
      );
      console.log(currTable.players);
      if (seatedPlayers.length === 2) {
        currTable.start();
        io.to(table).emit('dealCards', { currTable });
      }

      io.to(table).emit('updateTable', { currTable });
      io.to(table).emit('sit', { seatNumber, id: currPlayer.id });
    });

    socket.on('checkCall', ({ currPlayer, table }) => {
      const currTable = getTable(table);
      if (currPlayer.id === currTable.players[currTable.currAction].id) {
        currTable.checkCall(currPlayer.id);
        io.to(table).emit('updateTable', { currTable });
      }
    });

    socket.on('raise', ({ currPlayer, table, raise }) => {
      const currTable = getTable(table);
      currTable.raise(currPlayer.id, parseInt(raise));
      io.to(table).emit('updateTable', { currTable });
      io.to(table).emit('nextTurn', {
        id: currTable.players[currTable.currAction].id,
        currTable,
      });
    });

    socket.on('fold', ({ currPlayer, table }) => {
      const currTable = getTable(table);
      currTable.fold(currPlayer.id);
      io.to(table).emit('updateTable', { currTable });
      io.to(table).emit('nextTurn', {
        id: currTable.players[currTable.currAction].id,
      });
    });

    socket.on('disconnect', ({ table, id }) => {
      // console.log('ID: ', id);
      // const currTable = getTable(table);
      // const players = currTable.getPlayers();
      // const newPlayers = players.filter(player => player.id !== id);
      // io.to(table).emit('updatePlayer', { newPlayers });
      console.log('User left', socket.id);
    });
  });
};

module.exports = socketConnection;
