const Table = require('./Table');

const tables = { play: new Table('play') };

const addTable = (id, name) => {
  tables[id] = new Table(id, name);
};

const getTable = id => {
  return tables[id];
};

const getAllTables = () => {
  return tables;
};

module.exports = {
  addTable,
  getTable,
  getAllTables,
};
