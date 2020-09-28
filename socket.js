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
      // const newPlayers = currTable.getPlayers();
      // io.to(table).emit('updatePlayer', { newPlayers });
      // socket.emit('updatePlayer', { newPlayers });
      // callback(newPlayers);
      socket.join(table);
      io.to(table).emit('updateTable', { currTable });
    });

    // TODO: put some code here in table object
    socket.on('start', ({ table }) => {
      const currTable = getTable(table);
      currTable.start();
      io.to(table).emit('updateTable', { currTable });
      io.to(table).emit('dealCards', { currTable });
    });

    socket.on('sit', ({ table, currPlayer, seatNumber }) => {
      const currTable = getTable(table);
      currTable.playerPositions[seatNumber] = currPlayer.id;
      const player = currTable.getPlayer(currPlayer.id);
      player.seated = seatNumber;
      io.to(table).emit('updateTable', { currTable });
      io.to(table).emit('sit', { seatNumber, id: currPlayer.id });
    });

    socket.on('checkCall', ({ currPlayer, table }) => {
      const currTable = getTable(table);
      let isNextStreet;
      if (currPlayer.id === currTable.players[currTable.currAction].id) {
        isNextStreet = currTable.checkCall(currPlayer.id);
        io.to(table).emit('updateTable', { currTable });
      }
      const nextPlayer =
        currTable.currAction + 1 === currTable.players.length
          ? 0
          : currTable.currAction + 1;
      if (isNextStreet) {
        io.to(table).emit('nextStreet', { currTable });
      } else if (currPlayer.id === currTable.players[nextPlayer].id) {
        io.to(table).emit('nextTurn', {
          id: currTable.players[currTable.currAction].id,
          currTable,
        });
      }
    });

    socket.on('raise', ({ currPlayer, table, raise }) => {
      const currTable = getTable(table);
      currTable.raise(currPlayer.id, parseInt(raise));
      io.to(table).emit('updateTable', { currTable });
      console.log('curr:', currTable);
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
