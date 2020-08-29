const uuid = require('uuid');

// Contains hole cards, id, five best cards for determining draws
class Player {
  constructor(name, id) {
    this.name = name;
    this.id = id || uuid.v4();
    this.holeCards = [];
    this.cardRank = '';
    this.paired = {};
    this.chips = 500;
    this.playedChips = 0;
  }

  addCards(cards) {
    this.holeCards = cards;
    console.log('hole cards: ', this.holeCards);
  }
}

module.exports = Player;
