const { addTable, getTable } = require('./controllers/TableRooms');
const Player = require('./controllers/Player');

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

    socket.on('raise', ({ currPlayer, table, raise }, callback) => {
      const currTable = getTable(table);
      const toCall = currTable.toCall;
      const players = currTable.getPlayers();
      const player = players.find(player => player.id === currPlayer.id);
      currTable.raise(raise);
      player.chips -= toCall + raise;
      player.playedChips += toCall + raise;
      callback(currTable.getPlayers());
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
