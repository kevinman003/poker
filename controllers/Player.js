const uuid = require('uuid');

// Contains hole cards, id, five best cards for determining draws
class Player {
  constructor(name, id) {
    this.name = name;
    this.id = id ? id : uuid.v4();
    this.holeCards = [];
    this.cardRank = '';
    this.paired = {};
  }

  addCards(cards) {
    this.holeCards = this.holeCards.concat(cards);
  }
}

module.exports = Player;