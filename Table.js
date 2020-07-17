const CARD_RANKS = {
  ROYAL_FLUSH: 10,
  STRAIGHT_FLUSH: 9,
  QUADS: 8,
  FULL_HOUSE: 7,
  FLUSH: 6,
  STRAIGHT: 5,
  TRIPS: 4,
  TWO_PAIR: 3,
  PAIR: 2,
  HIGH_CARD: 1
};

class Table {
  constructor(id) {
    this.id = id;
    this.cards = [];
    this.hasAce = false;
    this.players = [];
  }

  addCard(card) {
    if(card.value === 14) this.hasAce = true;
    this.cards = this.cards.concat(card);
  }

  addCards(cards) {
    cards.map(card => this.addCard(card));
  }

  sortCards(holeCards) {
    const result = this.cards.concat(holeCards);
    result.sort((a, b) => {a.value - b.value});
    console.log('RESULT', result);
    return result;
  }

  printID() {
    console.log(this.id);
  }

  addPlayer(player) {
    this.players.concat(player);
  }

  findWinner() {
    this.players.map(player => {
      player.cardRank = this.analyzeHand(player);
    });
  }
  
  analyzeHand(player){
    const holeCards = player.holeCards;
    let values = this.cards.map( card => card.value );
    values = values.concat(holeCards.map(card => card.value));
    let suits = this.cards.map( card => card.suit );
    suits = suits.concat(holeCards.map(card => card.suit));

    const sortedCards = this.sortCards(holeCards);
   
    const flush    = this.findFlush(suits);
    const straight = this.findStraight(sortedCards);
    const groups   = this.createGroups(values);
    this.findGroups(player, groups);
    if(straight && flush)  return CARD_RANKS.STRAIGHT_FLUSH;
    if(player.hasQuads) return player.cardRank = CARD_RANKS.QUADS;
    if(player.hasTrips && player.hasPair) return player.cardRank = CARD_RANKS.FULL_HOUSE;
    if(player.hasPair.length >= 2) return player.cardRank = CARD_RANKS.TWO_PAIR;
    if(player.hasPair) return player.cardRank = CARD_RANKS.PAIR;
    return player.cardRank = CARD_RANKS.HIGH_CARD;
  }

  findFlush(suits) {
    let suitSet = new Set(suits);
    for (let suit of suitSet) {
      console.log(suit);
      if(this.cards.filter(card => card.suit == suit).length >= 5) {
        return true;
      }
    }
    return false;
  }

  findStraight(cards) {
    console.log('CARDS ', cards);
    let maxCount = 0;
    let count = 1;
    let connected = false;
    for(let i = 0; i < cards.length - 1; i++) {
      if(cards[i + 1].value - cards[i].value == 1) {
        count++;
        connected = true;
      } else {
        count = 1;
        connected = false;
      }
      maxCount = Math.max(count, maxCount);
    }
    return maxCount >= 5;
  }

  findGroups(player, groups) {
    Object.keys(groups).map(value => {
      let repeats = groups[value];
      player.hasQuads = repeats === 4 ? player.hasQuads.push(value) : player.hasQuads;
      player.hasTrips = repeats === 3 ? player.hasTrips.push(value) : player.hasTrips;
      player.hasPair = repeats === 3 ? player.hasPair.push(value) : player.hasPair;
    });
  }

  getKeyByValue(object, value) {
    return Object.keys(object).filter(key => object[key] === value);
  }

  createGroups(cards) {
    const groups = {};
    cards.map(card => {
      if(groups[card]) {
        groups[card] += 1;
      } else {
        groups[card] = 1;
      }
    });
    return groups;
  }
}

module.exports = Table;
