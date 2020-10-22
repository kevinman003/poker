const {
  addTable,
  getTable,
  getAllTables,
  addPlayer,
  getPlayerTable,
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
      updateTable(io, table, currTable);
    } else {
      io.to(table).emit('time', { time: currTable.timeCount });
      currTable.timeCount -= 0.1;
    }
    if (currTable.winner.length) {
      clearInterval(timer);
      setTimeout(() => {
        currTable.resetGame();
        updateTable(io, table, currTable);
        startTimer(table, currTable, io);
      }, 2000);
    }
  }, 100);
};

const updateTable = (io, table, currTable) => {
  currTable.players = currTable.players.toArray();
  io.to(table).emit('updateTable', { currTable });
};

const socketConnection = io => {
  io.on('connection', socket => {
    console.log('New connection', socket.id);
    // ========== JOINING AND DISCONNECTING ROOMS BELOW =============
    socket.on('join', ({ table, name }, callback) => {
      const id = socket.id;
      console.log('join table:', table);
      if (!getTable(table)) addTable(table);
      const playerTable = getPlayerTable();
      if (playerTable[id]) playerTable[id].push(table);
      else playerTable[id] = [table];

      const currTable = getTable(table);
      const players = currTable.getPlayers();

      if (!players.some(player => player.id === id)) {
        const currPlayer = new Player(name, id, socket.id);
        currTable.addPlayer(currPlayer);
        callback(currPlayer);
      } else {
        callback(players.find(player => player.id === id));
      }
      socket.join(table);

      updateTable(io, table, currTable);
      currTable.players = currTable.players.toArray();
      socket.emit('updateTable', { currTable });
    });

    socket.on('joinTable', ({ table, leaveTable, currPlayer }) => {
      const currTable = getTable(table);
      currTable.addPlayer(currPlayer);
      socket.leave(leaveTable);
      socket.join(table);
      updateTable(io, table, currTable);
    });

    socket.on('disconnect', ({}) => {
      const playerTable = getPlayerTable();
      playerTable[socket.id] &&
        playerTable[socket.id].map(table => {
          const currTable = getTable(table);
          currTable.removePlayer(socket.id);
          updateTable(io, table, currTable);
          if (currTable.players.length <= 1) {
            currTable.stop();
            clearInterval(timer);
          }
          if (currTable.winner.length) {
            clearInterval(timer);
            setTimeout(() => {
              currTable.resetGame();
              updateTable(io, table, currTable);
            }, 2000);
          }
        });
      console.log('User left', socket.id);
    });

    // ========== TABLE ACTIONS BELOW ===========
    socket.on('getTable', ({ table }, callback) => {
      const currTable = getTable(table);
      callback(currTable);
    });

    socket.on('getTables', ({}, callback) => {
      const tables = getAllTables();
      Object.keys(tables).map(table => console.log('id: ', table));
      callback(tables);
    });

    socket.on('addTable', ({ table, leaveTable, name }, callback) => {
      socket.leave(leaveTable);
      socket.join(table);
      addTable(table, name);
      callback();
    });

    socket.on('sit', ({ table, currPlayer, seatNumber }) => {
      console.log('socket sit');
      // const currTable = getTable(table);
      // console.log('seating');
      // currTable.seat(currPlayer.id, seatNumber);
      // console.log('sat');
      // const seatedPlayers = currTable.players.filter(
      //   player => player.seated >= 0
      // );
      // if (seatedPlayers.length === 2) {
      //   currTable.start();
      //   startTimer(table, currTable, io);
      //   io.to(table).emit('dealCards', { currTable });
      // }

      // updateTable(io, table, currTable);
      // io.to(table).emit('sit', { seatNumber, id: currPlayer.id });
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
      updateTable(io, table, currTable);
    });

    socket.on('stopPremove', ({ currPlayer, table }, cb) => {
      const currTable = getTable(table);
      const player = currTable.getPlayer(currPlayer.id);
      Object.keys(player.premove).map(premove => {
        player.premove[premove] = false;
      });
      cb(player);
      updateTable(io, table, currTable);
    });

    socket.on('checkCall', ({ currPlayer, table }) => {
      const currTable = getTable(table);
      currTable.checkCall(currPlayer.id);
      updateTable(io, table, currTable);

      if (currTable.winner.length) {
        clearInterval(timer);
        setTimeout(() => {
          console.log('checked');
          currTable.resetGame();
          updateTable(io, table, currTable);
          startTimer(table, currTable, io);
        }, 2000);
      }
    });

    socket.on('raise', ({ currPlayer, table, raise }) => {
      const currTable = getTable(table);
      currTable.raise(currPlayer.id, parseInt(raise));
      updateTable(io, table, currTable);
    });

    socket.on('fold', ({ currPlayer, table }) => {
      const currTable = getTable(table);
      currTable.fold(currPlayer.id);
      updateTable(io, table, currTable);
      if (currTable.winner.length) {
        clearInterval(timer);
        setTimeout(() => {
          startTimer(table, currTable, io);
          currTable.resetGame();
          updateTable(io, table, currTable);
        }, 2000);
      }
    });

    // socket.on('time', ({ table, currPlayer }) => {
    //   const currTable = getTable(table);
    //   if (currTable.toCall - currPlayer.playedChips) {
    //     currTable.fold(currPlayer.id);
    //   } else {
    //     currTable.checkCall(currPlayer.id);
    //   }
    //   if (currTable.winner.length) {
    //     setTimeout(() => {
    //       console.log('timed out');
    //       currTable.resetGame();
    //     updateTable(io, table, currTable)
    //     }, 2000);
    //   }
    // updateTable(io, table, currTable)
    // });
  });
};

module.exports = socketConnection;
