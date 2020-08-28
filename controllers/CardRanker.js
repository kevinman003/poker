const Card = require("./Card");

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
  HIGH_CARD: 1,
  NONE: 0
};

class CardRanker {

  constructor(activePlayers, cards) {
    this.activePlayers = activePlayers;
    this.cards = cards;
  }

  sortCards(holeCards) {
    const result = this.cards.concat(holeCards);
    result.sort((a, b) => (a.value > b.value) ? 1 : -1);
    return result;
  }

  findWinner() {
    let bestHandRank = 'NONE';
    let bestPlayers = [];
    this.activePlayers.map(player => {
      player.cardRank = this.analyzeHand(player);
      let handRank = CARD_RANKS[player.cardRank];
      if (handRank > CARD_RANKS[bestHandRank]) {
        bestHandRank = player.cardRank;
        bestPlayers = [player];
      } else if (handRank === CARD_RANKS[bestHandRank]) {
        bestPlayers.push(player);
      }
    });
    if (bestPlayers.length === 1) {
      return bestPlayers[0];
    } else {
      switch (bestHandRank) {
        case 'STRAIGHT_FLUSH':
        case 'STRAIGHT':
        case 'FLUSH':
        case 'HIGH_CARD':
          return this.breakTie(bestPlayers);
        case 'TWO_PAIR':
          bestPlayers = this.breakTwoPairTie(bestPlayers);
          if (bestPlayers.length === 1) return bestPlayers[0];
          return this.breakTie(bestPlayers);
        case 'FULL_HOUSE':
        case 'QUADS':
        case 'TRIPS':
        case 'PAIR':
          bestPlayers = this.breakPairedTie(bestPlayers, bestHandRank);
          if (bestPlayers.length === 1) return bestPlayers[0];
          return this.breakTie(bestPlayers);
        default: return {};
      }
    }

  }

  breakPairedTie(bestPlayers, type, times = 0) {
    const pairType = type !== 'FULL_HOUSE' ? type : 'TRIPS';
    let bestPaired = 0;
    let players = [];
    
    bestPlayers.forEach(player => {
      const paired = player.paired[pairType][player.paired[pairType].length - 1 - times];
      if (paired > bestPaired) {
        bestPaired = paired;
        players = [player];
      } else if (paired === bestPaired) {
        players.push(player);
      }
    });
    return players;
  }

  breakTwoPairTie(bestPlayers) {
    const players = this.breakPairedTie(bestPlayers, 'PAIR');
    if (players.length > 1) {
      return this.breakPairedTie(bestPlayers, 'PAIR', 1);
    }
    return players;
  }

  // Returns player with the highest cards
  // returns all players if equal
  breakTie(bestPlayers) {
    let highCard = 0;
    let maxPlayer = bestPlayers[0];
    let index = bestPlayers[0].bestCards.length - 1;
    while (index > 0) {
      for (let i = bestPlayers.length - 1; i >= 0; i--) {
        let currBestCard = bestPlayers[i].bestCards[index];
        let maxBestCard = maxPlayer.bestCards[index];
        if (currBestCard > maxBestCard) {
          maxPlayer = bestPlayers[i];
        } else if (currBestCard < maxBestCard) {
          bestPlayers.splice(i, 1);
        }
      }
      if (bestPlayers.length === 1) {
        return bestPlayers[0];
      }
      index--;
    }
    return bestPlayers;
  }

  analyzeHand(player) {
    const holeCards = player.holeCards;
    let values = this.cards.map(card => card.value);
    values = values.concat(holeCards.map(card => card.value));
    let suits = this.cards.map(card => card.suit);
    suits = suits.concat(holeCards.map(card => card.suit));
    const sortedCards = this.sortCards(holeCards);

    const flush    = this.findFlush(suits, this.cards.concat(holeCards));

    const straight = this.findStraight(sortedCards, player);
    const straightFlush = flush && straight ? this.newStraightFlush(sortedCards, player) : null;

    const groups = this.createGroups(sortedCards);
    this.findGroups(player, groups);

    if (straightFlush) {
      if (player.bestCards[player.bestCards.length - 1] === 15) {
        return "ROYAL_FLUSH";
      }
      return "STRAIGHT_FLUSH";  
    }
    if (player.paired['QUADS']) return'QUADS';
    if (player.paired['TRIPS'] && player.paired['PAIR']) return "FULL_HOUSE";
    if (flush) return "FLUSH";
    if (straight) return "STRAIGHT";
    if (player.paired['TRIPS']) return "TRIPS";
    if (player.paired['PAIR'] && player.paired['PAIR'].length >= 2) return "TWO_PAIR";
    if (player.paired['PAIR']) return "PAIR";
    return "HIGH_CARD";
  }

  newStraightFlush(sortedCards, player) {
    const suits = {};
    sortedCards.forEach(card => {
      if(suits[card.suit]) suits[card.suit].push(card);
      else suits[card.suit] = [card];
    });
    let straightFlushSuit = '';
    Object.keys(suits).some(suit => {
      let thisSuit = suits[suit];
      if (thisSuit.length >= 5 && this.findStraight(thisSuit, player)) {
        straightFlushSuit = suit;
        return;
      } 
    });
    return !!straightFlushSuit.length;
  }

  findFlush(suits, cards) {
    let suitSet = new Set(suits);
    for (let suit of suitSet) {
      if (cards.filter(card => card.suit == suit).length >= 5) {
        return true;
      }
    }
    return false;
  }

  findStraight(cards, player) {
    let maxCount = 0;
    let count = 1;
    let connected = true;
    let end = 0;
    for (let i = 0; i < cards.length - 1; i++) {
      if (cards[i + 1].value - cards[i].value === 1) {
        count++;
        end = connected ? i + 1 : end;
        connected = true;
      } else if (cards[i + 1].value - cards[i].value === 0) {
        end = connected ? i + 1 : end;
        continue;
      } else {
        count = 1;
        connected = false;
      }
      maxCount = Math.max(count, maxCount);
    }
    if (maxCount >= 5) {
      const startValue = cards[end].value;
      const result = [];
      for (let i = startValue; i > startValue - 5; i--) {
        result.unshift(i);
      }
      player.bestCards = result;
      return true;
    }
    if (cards.some(card => card.value === 15) && cards[0].value !== 1) {
      let newCards = JSON.parse(JSON.stringify(cards)); // preventing pop affecting var cards
      const ace = newCards.pop();
      newCards = [new Card(1, ace.suit), ...cards];
      return this.findStraight(newCards, player);
    }
    return false;
  }

  findGroups(player, groups) {
    Object.keys(groups).forEach(value => {
      let repeats = groups[value];
      if (repeats === 4) player.paired['QUADS'] = [value];
      if (repeats === 3) player.paired['TRIPS'] = player.paired['TRIPS'] ? player.paired['TRIPS'].concat(value) : [value]
      if (repeats === 2) player.paired['PAIR'] = player.paired['PAIR'] ?  player.paired['PAIR'].concat(value) : [value] 
    });
  }

  createGroups(cards) {
    const groups = {};
    cards.map(card => {
      if (groups[card.value]) {
        groups[card.value] += 1;
      } else {
        groups[card.value] = 1;
      }
    });
    return groups;
  }
}
module.exports = CardRanker