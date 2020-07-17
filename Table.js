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

// Contains array of players, community cards 
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
    return result;
  }

  printID() {
    console.log(this.id);
  }

  addPlayer(player) {
    this.players.push(player);
  }

  findWinner() {
    this.players.map(player => {
      player.cardRank = this.analyzeHand(player);
      console.log(`${player.name} has ${player.cardRank}`);
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
    console.log('player: ', player);

    if(straight && flush)  return CARD_RANKS.STRAIGHT_FLUSH;
    if(player.quads.length) return CARD_RANKS.QUADS;
    if(player.trips.length && player.pair.length) return CARD_RANKS.FULL_HOUSE;
    if(player.trips.length) return CARD_RANKS.TRIPS;
    if(player.pair.length >= 2) return CARD_RANKS.TWO_PAIR;
    if(player.pair.length) return CARD_RANKS.PAIR;
    return CARD_RANKS.HIGH_CARD;
  }

  findFlush(suits) {
    let suitSet = new Set(suits);
    for (let suit of suitSet) {
      if(this.cards.filter(card => card.suit == suit).length >= 5) {
        return true;
      }
    }
    return false;
  }

  findStraight(cards) {
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
      player.quads = repeats === 4 ? player.quads.concat(value) : player.quads;
      player.trips = repeats === 3 ? player.trips.concat(value) : player.trips;
      player.pair = repeats === 2 ? player.pair.concat(value) : player.pair;
    });
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
