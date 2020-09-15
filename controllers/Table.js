const CardRanker = require('./CardRanker');
const Deck = require('./Deck');
const { STREETS } = require('./constants');
const LinkedList = require('../client/src/data/LinkedList');

// Contains array of total players, community cards
// TODO complete the switch case
class Table {
  constructor(id) {
    this.id = id;
    this.cards = [];
    this.players = [];
    this.toCall = 0;
    this.chips = 0;
    this.deck = new Deck();
    this.bigBlind = 0;
    this.smallBlind = 0;
    this.lastAction = 0;
    this.currAction = 0;
    this.street = STREETS.PREFLOP;
    this.winner = null;
    this.blind = 10;
  }

  getPlayers() {
    return this.players;
  }

  getActivePlayers() {
    return this.players.filter(player => player.playing);
  }

  getPlayer(id) {
    return this.players.find(player => player.id === id);
  }

  getCards() {
    return this.cards;
  }

  nextAction() {
    this.currAction =
      this.currAction + 1 === this.players.length ? 0 : this.currAction + 1;
  }

  setToCall(toCall) {
    this.toCall = toCall;
  }

  addPlayer(player) {
    this.players.push(player);
  }

  dealPlayerCards(player) {
    const currPlayer = this.players.find(p => p.id === player.id);
    this.deck.dealPlayerCards(currPlayer);
  }

  start() {
    this.players.forEach(player => {
      this.dealPlayerCards(player);
    });
    this.toCall = this.blind;

    this.bigBlind = Math.floor(Math.random() * this.players.length);
    this.resetBlinds();
  }

  resetBlinds() {
    this.smallBlind =
      this.bigBlind - 1 < 0 ? this.players.length - 1 : this.bigBlind - 1;
    this.lastAction = this.bigBlind;
    this.currAction =
      this.bigBlind + 1 === this.players.length ? 0 : this.bigBlind + 1;
    this.players[this.smallBlind].addChips(this.blind / 2);
    this.players[this.bigBlind].addChips(this.blind);
  }

  raise(id, amount) {
    const player = this.getPlayer(id);
    this.toCall = amount;
    player.addChips(amount - player.playedChips);
    this.lastAction =
      this.currAction - 1 < 0 ? this.players.length - 1 : this.currAction - 1;
    this.nextAction();
  }

  checkCall(id) {
    const player = this.getPlayer(id);
    console.log('PLAYER:', player.name);
    const moreChips = this.toCall - player.playedChips;
    if (moreChips) {
      player.addChips(moreChips);
    }
    const beforeNextAction = this.currAction;
    this.nextAction();
    if (this.lastAction === beforeNextAction) {
      this.nextStreet();
    }
  }

  nextStreet() {
    this.handlePot();
    this.toCall = 0;
    switch (this.street) {
      case STREETS.PREFLOP:
        this.cards = this.deck.dealFlop();
        this.street = STREETS.FLOP;
        this.lastAction =
          this.getActivePlayers() == 2
            ? this.smallBlind
            : this.smallBlind - 1 < 0
            ? this.players.length - 1
            : this.smallBlind - 1;
        break;
      case STREETS.FLOP:
        this.street = STREETS.TURN;
        this.cards.push(this.deck.dealOneCard());
        break;
      case STREETS.TURN:
        this.street = STREETS.RIVER;
        this.cards.push(this.deck.dealOneCard());
        break;
      case STREETS.RIVER:
        console.log('AFTER RIVER');
        this.street = STREETS.PREFLOP;
        const winner = this.findWinner();
        this.won(winner);
        break;
    }
  }

  handlePot() {
    this.players.forEach(player => {
      this.chips += player.playedChips;
      player.playedChips = 0;
    });
  }

  fold(id) {
    const activePlayers = this.getActivePlayers();
    if (activePlayers.length === 2) {
      const winner = activePlayers.filter(player => player.id !== id);
      this.won(winner);
    } else {
      this.getPlayer(id).playing = false;
      this.nextAction();
    }
  }

  won(player) {
    this.winner = player;
    player.chips += this.chips;
    this.deck.reset();
    this.chips = 0;
    this.cards = [];
    this.players.forEach(player => {
      this.deck.dealPlayerCards(player);
    });
    this.bigBlind =
      this.bigBlind + 1 === this.players.length ? 0 : this.bigBlind + 1;
    this.resetBlinds();
  }

  findWinner() {
    const ranker = new CardRanker(this.getActivePlayers(), this.cards);
    return ranker.findWinner();
  }
}

module.exports = Table;
