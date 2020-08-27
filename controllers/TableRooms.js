const Table = require('./Table');

const tables = {};

const addTable = id => {
  tables[id] = new Table(id);
};

const getTable = id => {
  return tables[id];
};

module.exports = { 
  addTable, 
  getTable 
}