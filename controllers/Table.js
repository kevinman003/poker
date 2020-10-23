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
    this.winner = [];
    this.blind = 10;
    this.playerPositions = {};
    this.disabled = true;
    this.time = 10;
    this.timeCount = 10;
    this.toJoin = [];
    this.name;
    if (name) {
      this.name = name;
    } else {
      new Promise((resolve, reject) => {
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
    const activePlayers = this.getActivePlayers().filter(
      player => player.holeCards.length
    );
    // currIndex: index of player in active player list
    const currIndex = activePlayers.findIndex(
      player => player.id === this.players[this.currAction].id
    );
    let nextIndex = currIndex + 1 === activePlayers.length ? 0 : currIndex + 1;
    let nextPlayer = this.players[nextIndex];
    this.currAction = this.players.findIndex(
      player => player.id === activePlayers[nextIndex].id
    );
    if (
      ((nextPlayer.premove.check || nextPlayer.premove.fold) &&
        !(this.toCall - nextPlayer.playedChips)) ||
      nextPlayer.premove.raise
    ) {
      return this.checkCall(nextPlayer.id);
    } else if (
      nextPlayer.premove.fold &&
      pokerTable.toCall - nextPlayer.playedChips
    ) {
      return this.fold(nextPlayer.id);
    }
  }

  setToCall(toCall) {
    this.toCall = toCall;
  }

  seat(id, seatNumber) {
    this.playerPositions[seatNumber] = id;
    const player = this.getPlayer(id);
    player.seated = seatNumber;
    const activePlayers = this.getActivePlayers();
    if (activePlayers.length >= 2) {
      this.toJoin.push(id);
    } else {
      player.playing = true;
    }
  }

  addPlayer(player) {
    this.players.push(player);
  }

  removePlayer(id) {
    this.fold(id);
    this.players = this.players.filter(player => player.id !== id);
    Object.keys(this.playerPositions).map(position => {
      if (this.playerPositions[position] === id)
        delete this.playerPositions[position];
    });
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

  stop() {
    this.disabled = true;
  }

  resetPremove(player) {
    player.premove = {
      check: false,
      fold: false,
      raise: false,
    };
  }

  resetBlinds() {
    console.log('reset blinds');
    const activePlayers = this.getActivePlayers();
    const activeBigBlind = activePlayers.findIndex(
      player => player.id === this.players[this.bigBlind].id
    );

    this.smallBlind =
      activeBigBlind - 1 < 0 ? activePlayers.length - 1 : activeBigBlind - 1;
    this.lastAction = this.bigBlind;
    this.currAction =
      this.bigBlind + 1 === activePlayers.length ? 0 : this.bigBlind + 1;
    this.toCall = this.blind;
    this.players[this.smallBlind].addChips(this.blind / 2);
    this.players[this.bigBlind].addChips(this.blind);
    this.toJoin.map(player => {
      const selectedPlayer = this.players.find(p => p.id === player);
      if (!selectedPlayer.chips) {
        selectedPlayer.addChips(this.blind);
      }
    });
    this.toJoin = [];
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
    if (this.lastAction === this.currAction) {
      this.nextStreet();
    } else {
      this.nextAction();
    }
    this.resetTimer();
  }

  nextStreet() {
    this.handlePot();
    this.toCall = 0;
    const activePlayers = this.getActivePlayers();
    activePlayers.map(player => {
      this.resetPremove(player);
    });
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
        this.showCards();
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
      this.handlePot();
      this.won(winner);
    } else if (this.players[this.lastAction].id === id) {
      this.nextStreet();
    }
    if (!this.disabled) {
      const player = this.getPlayer(id);
      this.nextAction();
      player.playing = false;
    }
    this.resetTimer();
  }

  won(players) {
    this.winner = players;
    if (players.length === 1) {
      players[0].chips += this.chips;
    } else {
      players.map(player => {
        player.chips += Math.floor(this.chips / players.length);
      });
    }
    this.deck.reset();
    this.disabled = true;
  }

  showCards() {
    this.players.forEach(player => {
      player.showCards = true;
    });
  }
  resetTimer() {
    this.timeCount = this.time;
  }

  resetGame() {
    this.street = STREETS.PREFLOP;
    this.chips = 0;
    this.cards = [];
    this.players.forEach(player => {
      player.cardRank = undefined;
      player.paired = {};
      player.bestCards = [];
      player.showCards = false;
      player.holeCards = [];
      if (player.chips > 0) {
        player.playing = true;
        if (this.players.length > 1) this.deck.dealPlayerCards(player);
      }
      this.resetPremove(player);
    });

    const activePlayers = this.getActivePlayers();
    const bigBlindActive = activePlayers.findIndex(
      player => player.id === this.players[this.bigBlind].id
    );
    const setBigBlind =
      bigBlindActive + 1 === activePlayers.length ? 0 : bigBlindActive + 1;
    this.bigBlind = this.players.findIndex(
      player => player.id === activePlayers[setBigBlind].id
    );
    this.winner = [];
    if (this.players.length > 1) {
      this.resetBlinds();
      this.disabled = false;
    }
    this.players.sort((a, b) => (a.seated > b.seated ? 1 : -1));
  }

  findWinner() {
    const ranker = new CardRanker(this.getActivePlayers(), this.cards);
    return ranker.findWinner();
  }
}

module.exports = Table;
