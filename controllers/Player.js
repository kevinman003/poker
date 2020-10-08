const uuid = require('uuid');

// Contains hole cards, id, five best cards for determining draws
class Player {
  constructor(name, socketId) {
    this.name = name;
    this.id = socketId;
    this.holeCards = [];
    this.cardRank = '';
    this.paired = {};
    this.chips = 500;
    this.playedChips = 0;
    this.playing = false;
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
