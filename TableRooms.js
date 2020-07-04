const Table = require('./Table');

class TableRooms {
  constructor() {
    this.tables = {};
  }
  createTable(id) {
    this.tables[id] = new Table(id);
    console.log(this.tables);
  }
}


module.exports = TableRooms;