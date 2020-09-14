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
        const currPlayer = new Player(`player${id}`, id);
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

    const handlePot = (table, currTable, pot) => {
      const players = currTable.getPlayers();
      let newPot = pot;
      players.forEach(player => {
        newPot += player.playedChips;
        player.playedChips = 0;
      });
      const newPlayers = currTable.getPlayers();
      io.to(table).emit('updatePlayer', { newPlayers });
      io.to(table).emit('pot', { newPot });
    };
    socket.on('nextStreet', ({ street, table, pot }, callback) => {
      const currTable = getTable(table);
      handlePot(table, currTable, pot);
      currTable.toCall = 0;
      let nextStreet;
      console.log(STREETS.PREFLOP);
      switch (street) {
        case STREETS.PREFLOP:
          currTable.dealFlop();
          nextStreet = STREETS.FLOP;
          break;
        case STREETS.FLOP:
          nextStreet = STREETS.TURN;
          currTable.dealOneCard();
          break;
        case STREETS.TURN:
          nextStreet = STREETS.RIVER;
          currTable.dealOneCard();
          break;
        case STREETS.RIVER:
          nextStreet = STREETS.NEXT;
          break;
      }
      const newCards = currTable.getCards();
      io.to(table).emit('dealCards', { newCards });
      callback(nextStreet);
    });

    socket.on('checkCall', ({ currPlayer, table, nextAction }) => {
      const currTable = getTable(table);
      const player = currTable.getPlayer(currPlayer.id);
      const moreChips = currTable.toCall - player.playedChips;
      console.log('MORE CHIPS: ', currTable.toCall, player.playedChips);
      if (moreChips) {
        player.addChips(moreChips);
        const newPlayers = currTable.getActivePlayers();
        io.to(table).emit('updatePlayer', { newPlayers });
      }
      io.to(table).emit('updateCurrAction', { nextAction });
    });

    socket.on(
      'raise',
      ({ currPlayer, table, raise, lastActionIdx, nextAction }) => {
        const currTable = getTable(table);
        const player = currTable.getPlayer(currPlayer.id);
        const raiseInt = parseInt(raise);
        currTable.setToCall(raiseInt);
        player.addChips(raiseInt - player.playedChips);
        const newPlayers = currTable.getActivePlayers();
        io.to(table).emit('updatePlayer', { newPlayers });
        console.log('last action: ', lastActionIdx);
        io.to(table).emit('updateLastAction', { lastActionIdx });
        io.to(table).emit('updateCurrAction', { nextAction });
      }
    );

    socket.on('fold', ({ currPlayer, table, nextAction }) => {});
    socket.on('blinds', ({ currPlayer, table, raise, nextAction }) => {
      // raiseFn(currPlayer, table, raise);
      const currTable = getTable(table);
      const player = currTable.getPlayer(currPlayer.id);
      currTable.setToCall(raise);
      player.addChips(raise);
      currTable.activePlayers = currTable.players;
      io.to(table).emit('updateCurrAction', { nextAction });
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
