
const CardRanker = require('./CardRanker');
const Card = require('./Card');
// Contains array of total players, active players, community cards 
// TODO complete the switch case 
class Table {
  constructor(id) {
    this.id = id;
    this.cards = [];
    this.players = [];
    this.activePlayers = [];
    this.deck = [];
    const suits = ['s', 'c', 'h', 'd'];
    suits.forEach(suit => {
      for (let i = 2; i <= 15; i++) {
        this.deck.push(new Card(i, suit));
      }
    });
    this.shuffle();
    this.currCard = 0;
  }

  getPlayers() {
    return this.players;
  }
  
  getCards() {
    return this.cards;
  }
  printID() {
    console.log(this.id);
  }

  addPlayer(player) {
    this.players.push(player);
    this.activePlayers.push(player);
    player.addCards(this.deck.slice(this.currCard, this.currCard + 2));
    this.currCard += 2;
  }
  


  findWinner() {
    const ranker = new CardRanker(this.activePlayers, this.cards);
    return ranker.findWinner();
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
    this.shuffle();
    this.cards = this.deck.slice(this.currCard, this.currCard + 3);
    this.currCard += 3;
  }

  // for turn and river
  dealOneCard() {
    this.cards.push(this.deck[this.currCard]);
    this.currCard += 1;
  }
}

module.exports = Table;
