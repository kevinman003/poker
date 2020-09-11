const { addTable, getTable } = require('./controllers/TableRooms');
const Player = require('./controllers/Player');
const STREETS = require('./controllers/constants');

const socketConnection = io => {
  io.on('connection', socket => {
    console.log('New connection', socket.id);
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

    socket.on('start', ({ table, bigBlindAmnt }) => {
      const currTable = getTable(table);
      currTable.newDeck();
      currTable.players.forEach(player => {
        currTable.dealPlayerCards(player);
      });
      const newCards = currTable.getCards();
      const newPlayers = currTable.getPlayers();
      io.to(table).emit('updatePlayer', { newPlayers });
    });

    socket.on('flop', ({ table }) => {
      const currTable = getTable(table);
      currTable.dealFlop();
      io.to(table).emit('dealCards', { newCards });
    });

    socket.on('nextStreet', ({ street, table }, callback) => {
      const currTable = getTable(table);
      let nextStreet;
      switch (street) {
        case STREETS.PREFLOP:
          currTable.dealFlop();
          nextStreet = STREETS.FLOP;
          io.to(table).emit('dealCards', { newCards });
          break;
        case STREETS.FLOP:
          nextStreet = STREETS.TURN;

          break;
        case STREETS.TURN:
          nextStreet = STREETS.RIVER;

          break;
        case STREETS.RIVER:
          nextStreet = STREETS.NEXT;

          break;
      }
      callback(nextStreet);
    });

    socket.on('checkCall', ({ currPlayer, table }, callback) => {
      const currTable = getTable(table);
      const player = currTable.getPlayer(currPlayer.id);
      console.log('TO CALL: ', currTable.toCall);
      player.addChips(currTable.toCall);
      const newPlayers = currTable.getPlayers();
      io.to(table).emit('updatePlayer', { newPlayers });
      callback();
    });

    socket.on('raise', ({ currPlayer, table, raise }) => {
      raiseFn(currPlayer, table, raise);
      const currTable = getTable(table);
      const activePlayers = currTable.getActivePlayers();
      io.to(table).emit('updateCurrAction', { currPlayer });
    });

    socket.on('blinds', ({ currPlayer, table, raise, currActionIdx }) => {
      raiseFn(currPlayer, table, raise);
      io.to(table).emit('updateCurrAction', { currActionIdx });
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

const raiseFn = (currPlayer, table, raise) => {
  const currTable = getTable(table);
  const toCall = currTable.toCall;
  const player = currTable.getPlayer(currPlayer.id);
  currTable.raise(raise);
  player.addChips(toCall + raise);
  currTable.toCall = raise;
};

module.exports = socketConnection;
