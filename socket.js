const { addTable, getTable } = require('./controllers/TableRooms');
const Player = require('./controllers/Player');

const socketConnection = io => {
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

    socket.on('start', ({ table, bigBlindAmnt }) => {
      const currTable = getTable(table);
      currTable.newDeck();
      currTable.players.forEach(player => {
        currTable.dealPlayerCards(player);
      });
      currTable.dealFlop();
      const newCards = currTable.getCards();
      const newPlayers = currTable.getPlayers();
      io.to(table).emit('dealCards', { newCards });
      io.to(table).emit('updatePlayer', { newPlayers });
    });

    socket.on('raise', ({ currPlayer, table, raise }, callback) => {
      const currTable = getTable(table);
      const players = currTable.getPlayers();
      const player = players.find(player => player.id === currPlayer.id);
      player.chips -= raise;
      player.playedChips += raise;
      callback(currTable.getPlayers());
    });
    socket.on('disconnect', () => {
      console.log('User left');
    });
  });
};

module.exports = socketConnection;
