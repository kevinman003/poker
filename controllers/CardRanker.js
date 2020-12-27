const Card = require('./Card');

const CARD_RANKS = {
  ROYAL_FLUSH: 10,
  STRAIGHT_FLUSH: 9,
  FOUR_OF_A_KIND: 8,
  FULL_HOUSE: 7,
  FLUSH: 6,
  STRAIGHT: 5,
  THREE_OF_A_KIND: 4,
  TWO_PAIR: 3,
  PAIR: 2,
  HIGH_CARD: 1,
  NONE: 0,
};

class CardRanker {
  constructor(activePlayers, cards) {
    this.activePlayers = activePlayers;
    this.cards = cards;
  }

  sortCards(holeCards) {
    const result = this.cards.concat(holeCards);
    result.sort((a, b) => (a.value > b.value ? 1 : -1));
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
      return bestPlayers;
    } else {
      switch (bestHandRank) {
        case 'STRAIGHT_FLUSH':
        case 'STRAIGHT':
        case 'FLUSH':
        case 'HIGH_CARD':
          return this.breakTie(bestPlayers);
        case 'TWO_PAIR':
          bestPlayers = this.breakTwoPairTie(bestPlayers);
          if (bestPlayers.length === 1) return bestPlayers;
          return this.breakTie(bestPlayers);
        case 'FULL_HOUSE':
        case 'FOUR_OF_A_KIND':
        case 'THREE_OF_A_KIND':
        case 'PAIR':
          bestPlayers = this.breakPairedTie(bestPlayers, bestHandRank);
          if (bestPlayers.length === 1) return bestPlayers;
          return this.breakTie(bestPlayers);
        default:
          return {};
      }
    }
  }

  breakPairedTie(bestPlayers, type, times = 0) {
    const pairType = type !== 'FULL_HOUSE' ? type : 'THREE_OF_A_KIND';
    let bestPaired = 0;
    let players = [];

    bestPlayers.forEach(player => {
      const paired =
        player.paired[pairType][player.paired[pairType].length - 1 - times];
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
        return bestPlayers;
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

    const flush = this.findFlush(suits, sortedCards, player);

    const straight = this.findStraight(sortedCards, player);
    const straightFlush =
      flush && straight ? this.newStraightFlush(sortedCards, player) : null;

    const groups = this.createGroups(sortedCards);
    this.findGroups(player, groups, sortedCards);

    if (straightFlush) {
      if (player.bestCards[player.bestCards.length - 1] === 14) {
        return 'ROYAL_FLUSH';
      }
      return 'STRAIGHT_FLUSH';
    }
    if (player.paired['FOUR_OF_A_KIND']) return 'FOUR_OF_A_KIND';
    if (player.paired['THREE_OF_A_KIND'] && player.paired['PAIR'])
      return 'FULL_HOUSE';
    if (flush) return 'FLUSH';
    if (straight) return 'STRAIGHT';
    if (player.paired['THREE_OF_A_KIND']) return 'THREE_OF_A_KIND';
    if (player.paired['PAIR'] && player.paired['PAIR'].length >= 2)
      return 'TWO_PAIR';
    if (player.paired['PAIR']) return 'PAIR';
    return 'HIGH_CARD';
  }

  newStraightFlush(sortedCards, player) {
    const suits = {};
    sortedCards.forEach(card => {
      if (suits[card.suit]) suits[card.suit].push(card);
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

  findFlush(suits, cards, player) {
    let suitSet = new Set(suits);
    for (let suit of suitSet) {
      const suitedCards = cards.filter(card => card.suit == suit);
      if (suitedCards.length >= 5) {
        const bestCards = suitedCards.slice(
          suitedCards.length - 5,
          suitedCards.length
        );
        player.bestCards = bestCards.map(card => card.value);
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
    if (cards.some(card => card.value === 14) && cards[0].value !== 1) {
      let newCards = JSON.parse(JSON.stringify(cards)); // preventing pop affecting var cards
      const ace = newCards.pop();
      newCards = [new Card(1, ace.suit), ...cards];
      return this.findStraight(newCards, player);
    }
    return false;
  }

  findGroups(player, groups, sortedCards) {
    let bestCards = [];
    Object.keys(groups).forEach(value => {
      let repeats = groups[value];
      if (repeats === 4) player.paired['FOUR_OF_A_KIND'] = [value];
      if (repeats === 3)
        player.paired['THREE_OF_A_KIND'] = player.paired['THREE_OF_A_KIND']
          ? player.paired['THREE_OF_A_KIND'].concat(value)
          : [value];
      if (repeats === 2)
        player.paired['PAIR'] = player.paired['PAIR']
          ? player.paired['PAIR'].concat(value)
          : [value];
      if (repeats > 1) {
        for (var i = 0; i < repeats; i++) {
          bestCards.push(value);
        }
      }
    });

    let addCards = sortedCards.slice(
      sortedCards.length - 5 + bestCards.length,
      sortedCards.length
    );
    addCards = addCards.map(card => card.value);
    player.bestCards = bestCards.concat(addCards);
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
module.exports = CardRanker;
