const {
  addTable,
  getTable,
  getAllTables,
} = require('./controllers/TableRooms');
const Player = require('./controllers/Player');
const { STREETS } = require('./controllers/constants');

let timer;

const startTimer = (table, currTable, io) => {
  timer = setInterval(() => {
    const currPlayer = currTable.players[currTable.currAction];
    if (currTable.timeCount < 0) {
      clearInterval(timer);
      currTable.timeCount = currTable.time;
      if (currTable.toCall - currPlayer.playedChips) {
        currTable.fold(currPlayer.id);
      } else {
        currTable.checkCall(currPlayer.id);
      }
      io.to(table).emit('updateTable', { currTable });
    } else {
      io.to(table).emit('time', { time: currTable.timeCount });
      currTable.timeCount -= 0.1;
    }
    if (currTable.winner.length) {
      clearInterval(timer);
      setTimeout(() => {
        currTable.resetGame();
        io.to(table).emit('updateTable', { currTable });
        startTimer(table, currTable, io);
      }, 2000);
    }
  }, 100);
};

const socketConnection = io => {
  io.on('connection', socket => {
    console.log('New connection', socket.id);
    // ========== JOINING AND DISCONNECTING ROOMS BELOW =============
    socket.on('join', ({ table, id, name }, callback) => {
      if (!getTable(table)) addTable(table);
      const currTable = getTable(table);
      const players = currTable.getPlayers();

      if (!players.some(player => player.id === id)) {
        const currPlayer = new Player(name, id);
        currTable.addPlayer(currPlayer);
        callback(currPlayer);
      } else {
        callback(players.find(player => player.id === id));
      }
      socket.join(table);
      socket.emit('updateTable', { currTable });
      io.to(table).emit('updateTable', { currTable });
    });

    socket.on('joinTable', ({ table, leaveTable, currPlayer }) => {
      const currTable = getTable(table);
      currTable.addPlayer(currPlayer);
      socket.leave(leaveTable);
      socket.join(table);
      io.to(table).emit('updateTable', { currTable });
    });

    socket.on('disconnect', ({ table, id }) => {
      // console.log('ID: ', id);
      // const currTable = getTable(table);
      // const players = currTable.getPlayers();
      // const newPlayers = players.filter(player => player.id !== id);
      // io.to(table).emit('updatePlayer', { newPlayers });
      console.log('User left', socket.id);
    });

    // ========== TABLE ACTIONS BELOW ===========
    socket.on('getTables', ({}, callback) => {
      callback(getAllTables());
    });

    socket.on('addTable', ({ table, leaveTable, name }, callback) => {
      socket.leave(leaveTable);
      socket.join(table);
      addTable(table, name);
      callback();
    });

    socket.on('sit', ({ table, currPlayer, seatNumber }) => {
      const currTable = getTable(table);
      currTable.playerPositions[seatNumber] = currPlayer.id;
      const player = currTable.getPlayer(currPlayer.id);
      player.seated = seatNumber;

      const seatedPlayers = currTable.players.filter(
        player => player.seated >= 0
      );
      if (seatedPlayers.length === 2) {
        currTable.start();
        startTimer(table, currTable, io);
        io.to(table).emit('dealCards', { currTable });
      }

      io.to(table).emit('updateTable', { currTable });
      io.to(table).emit('sit', { seatNumber, id: currPlayer.id });
    });

    // ======== GAMEPLAY SOCKET ACTIONS BELOW ===========
    socket.on('premove', ({ currPlayer, table, move }) => {
      const currTable = getTable(table);
      const player = currTable.getPlayer(currPlayer.id);
      Object.keys(player.premove).map(action => {
        if (player.premove[action] === move)
          player.premove[action] = !player.premove[action];
        else player.premove[action] = false;
      });
      player.premove[move] = !player.premove[move];
      io.to(table).emit('updateTable', { currTable });
    });

    socket.on('stopPremove', ({ currPlayer, table }, cb) => {
      const currTable = getTable(table);
      const player = currTable.getPlayer(currPlayer.id);
      Object.keys(player.premove).map(premove => {
        player.premove[premove] = false;
      });
      cb(player);
      io.to(table).emit('updateTable', { currTable });
    });

    socket.on('checkCall', ({ currPlayer, table }) => {
      const currTable = getTable(table);
      currTable.checkCall(currPlayer.id);
      io.to(table).emit('updateTable', { currTable });

      if (currTable.winner.length) {
        clearInterval(timer);
        setTimeout(() => {
          currTable.resetGame();
          io.to(table).emit('updateTable', { currTable });
          startTimer(table, currTable, io);
        }, 2000);
      }
    });

    socket.on('raise', ({ currPlayer, table, raise }) => {
      const currTable = getTable(table);
      currTable.raise(currPlayer.id, parseInt(raise));
      io.to(table).emit('updateTable', { currTable });
    });

    socket.on('fold', ({ currPlayer, table }) => {
      const currTable = getTable(table);
      currTable.fold(currPlayer.id);
      io.to(table).emit('updateTable', { currTable });
      io.to(table).emit('nextTurn', {
        id: currTable.players[currTable.currAction].id,
      });
    });

    socket.on('time', ({ table, currPlayer }) => {
      const currTable = getTable(table);
      if (currTable.toCall - currPlayer.playedChips) {
        currTable.fold(currPlayer.id);
      } else {
        currTable.checkCall(currPlayer.id);
      }
      if (currTable.winner.length) {
        setTimeout(() => {
          currTable.resetGame();
          io.to(table).emit('updateTable', { currTable });
        }, 2000);
      }
      io.to(table).emit('updateTable', { currTable });
    });
  });
};

module.exports = socketConnection;
