const Table = require('./Table');

const tables = { play: new Table('play') };

const playerTable = {};

const addTable = (id, name) => {
  tables[id] = new Table(id, name);
};

const getTable = id => {
  return tables[id];
};

const getAllTables = () => {
  return tables;
};

const addPlayer = (playerId, socketId) => {
  playerSockets[playerId] = socketId;
};

const getPlayerTable = () => playerTable;

module.exports = {
  addTable,
  getTable,
  getAllTables,
  addPlayer,
  getPlayerTable,
};
