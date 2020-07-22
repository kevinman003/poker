const Table = require('./Table');

class TableRooms {
  constructor() {
    this.tables = {};
  }
  createTable(id) {
    this.tables[id] = new Table(id);
  }
}


module.exports = TableRooms;