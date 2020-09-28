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
    this.playing = true;
    this.bestCards = [];
    this.seated = -1;
    this.showCards = false;
    this.premove = {
      check: false,
      fold: false,
      raise: false,
    };
  }

  addCards(cards) {
    this.holeCards = cards;
  }

  addChips(addedChips) {
    this.chips -= addedChips;
    this.playedChips += addedChips;
  }
}

module.exports = Player;
