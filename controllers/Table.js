const http = require('http');
const CardRanker = require('./CardRanker');
const Deck = require('./Deck');
const { STREETS } = require('./constants');
const LinkedList = require('../client/src/data/LinkedList');

// Contains array of total players, community cards
// TODO complete the switch case
class Table {
  constructor(id, name) {
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
    this.playerPositions = {};
    this.disabled = true;
    this.time = 10;
    this.timeCount = 10;
    this.name;
    if (name) {
      this.name = name;
    } else {
      const getName = new Promise((resolve, reject) => {
        http.get(
          'http://names.drycodes.com/1?nameOptions=objects&combine=%202',
          res => {
            let data = '';

            res.on('data', chunk => {
              data += chunk;
            });

            res.on('end', () => {
              const result = JSON.parse(data);
              this.name = result[0].replace('Hnad', 'Hand').split('_').join('');
              resolve(this);
            });

            res.on('error', () => {
              reject('error');
            });
          }
        );
      });
    }
  }

  getPlayers() {
    return this.players;
  }

  // for testing
  addCards(cards) {
    this.cards = cards;
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
    const activePlayers = this.getActivePlayers();
    let currIndex = activePlayers.findIndex(
      player => player.id === this.players[this.currAction].id
    );
    currIndex = currIndex + 1 === activePlayers.length ? 0 : currIndex + 1;
    this.currAction = this.players.findIndex(
      player => player.id === activePlayers[currIndex].id
    );
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
    this.disabled = false;
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
    this.toCall = this.blind;
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
    this.resetTimer();
  }

  checkCall(id) {
    const player = this.getPlayer(id);
    const moreChips = this.toCall - player.playedChips;
    if (moreChips) {
      player.addChips(moreChips);
    }
    const beforeNextAction = this.currAction;
    this.nextAction();
    if (this.lastAction === beforeNextAction) {
      this.nextStreet();
    }
    this.resetTimer();
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
    console.log('fold:', id);
    if (activePlayers.length === 2) {
      const winner = activePlayers.filter(player => player.id !== id)[0];
      this.handlePot();
      this.won(winner);
    } else {
      this.getPlayer(id).playing = false;
      this.nextAction();
    }
    this.resetTimer();
  }

  won(player) {
    this.winner = player;
    player.chips += this.chips;
    this.deck.reset();
    if (this.street === STREETS.RIVER) {
      this.players.forEach(player => {
        player.showCards = true;
      });
    }
    this.disabled = true;
  }

  resetTimer() {
    this.timeCount = this.time;
  }

  resetGame() {
    this.chips = 0;
    this.cards = [];
    this.players.forEach(player => {
      player.showCards = false;
      this.deck.dealPlayerCards(player);
    });
    this.bigBlind =
      this.bigBlind + 1 === this.players.length ? 0 : this.bigBlind + 1;
    this.winner = null;
    this.resetBlinds();
    this.disabled = false;
  }

  findWinner() {
    const ranker = new CardRanker(this.getActivePlayers(), this.cards);
    return ranker.findWinner();
  }
}

module.exports = Table;
