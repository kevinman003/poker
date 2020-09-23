const Card = require('./Card');

// Handles the logic for the deck of a table
class Deck {
  constructor() {
    this.currCard = 0;
    const suits = ['s', 'c', 'h', 'd'];
    this.deck = [];
    suits.forEach(suit => {
      for (let i = 2; i <= 15; i++) {
        this.deck.push(new Card(i, suit));
      }
    });
    this.shuffle();
  }

  shuffle() {
    let i = this.deck.length;
    let j = 0;
    let temp;

    while (i--) {
      j = Math.floor(Math.random() * (i + 1));

      temp = this.deck[i];
      this.deck[i] = this.deck[j];
      this.deck[j] = temp;
    }
  }

  dealFlop() {
    const cards = this.deck.slice(this.currCard, this.currCard + 3);
    this.currCard += 3;
    return cards;
  }

  // for turn and river
  dealOneCard() {
    const card = this.deck[this.currCard];
    this.currCard += 1;
    return card;
  }

  reset() {
    this.currCard = 0;
    this.chips = 0;
    this.shuffle();
  }

  dealPlayerCards(player) {
    player.addCards(this.deck.slice(this.currCard, this.currCard + 2));
    this.currCard += 2;
  }
}

module.exports = Deck;
