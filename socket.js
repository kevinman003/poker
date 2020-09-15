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
    });

    socket.on('flop', ({ table }) => {
      const currTable = getTable(table);
      currTable.dealFlop();
      io.to(table).emit('dealCards', { newCards });
    });

    const won = (table, winner) => {
      const currTable = getTable(table);
      const winnerPlayer = currTable.getPlayer(winner.id);
      winnerPlayer.chips += currTable.chips;
      currTable.reset();
      const players = currTable.getPlayers();
      const newPlayers = players.map(player => {
        player.playedChips = 0;
        return player;
      });
      io.to(table).emit('pot', { newPot: 0 });
      io.to(table).emit('dealCards', { newCards: [] });
      io.to(table).emit('updatePlayer', { newPlayers });
      io.to(table).emit('winner', { newWinner: winner, newPlayers });
    };

    // socket.on('nextStreet', ({ street, table, pot }, callback) => {
    //   const currTable = getTable(table);
    //   handlePot(table, currTable, pot);
    //   currTable.toCall = 0;
    //   let nextStreet;
    //   switch (street) {
    //     case STREETS.PREFLOP:
    //       currTable.dealFlop();
    //       nextStreet = STREETS.FLOP;
    //       break;
    //     case STREETS.FLOP:
    //       nextStreet = STREETS.TURN;
    //       currTable.dealOneCard();
    //       break;
    //     case STREETS.TURN:
    //       nextStreet = STREETS.RIVER;
    //       currTable.dealOneCard();
    //       break;
    //     case STREETS.RIVER:
    //       console.log('AFTER RIVER');
    //       nextStreet = STREETS.FLOP;
    //       const winner = currTable.findWinner();
    //       won(table, winner);
    //       break;
    //   }
    //   const newCards = currTable.getCards();
    //   io.to(table).emit('dealCards', { newCards });
    //   callback(nextStreet);
    // });

    socket.on('checkCall', ({ currPlayer, table }) => {
      const currTable = getTable(table);
      currTable.checkCall(currPlayer.id);
      io.to(table).emit('updateTable', { currTable });
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
    });

    socket.on('winner', ({ table, winner }) => {
      won(table, winner);
    });

    socket.on('blinds', ({ currPlayer, table, raise, nextAction }) => {
      // raiseFn(currPlayer, table, raise);
      const currTable = getTable(table);
      const player = currTable.getPlayer(currPlayer.id);
      currTable.setToCall(raise);
      currTable.chips += raise;
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
