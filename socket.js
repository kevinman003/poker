const { addTable, getTable } = require('./controllers/TableRooms');
const Player = require('./controllers/Player');

const join = (socket, table, id, callback) => {
  if (!getTable(table)) addTable(table);
  const currTable = getTable(table);
  const players = currTable.getPlayers(); 
  if (!players.some(player => player.id === id)) currTable.addPlayer(new Player('player1', id));
  console.log('PLAYERS: ', currTable.getPlayers());
  socket.emit('updatePlayer', { currPlayers: currTable.getPlayers() });
  socket.join(table);
};

module.exports = { join };