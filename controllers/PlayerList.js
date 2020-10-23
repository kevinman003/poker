const List = require('./structures/List');

class PlayerList {
  constructor() {
    this.length = 0;
    this.players = new List();
  }

  addPlayer(player) {
    this.length++;
    return this.players.add(player);
  }

  getPlayer(id) {
    return this.players.find(player => player.id === id);
  }

  getPlayers() {
    return this.players.toArray();
  }

  // getActivePlayers() {
  //   return this.player.filter(player => player.playing);
  // }

  nextAction(id) {
    let curr = this.players.root;
    while (curr.next != this.root) {
      if (curr.val.id === id) break;
      curr = curr.next;
    }
    let nextCurr = curr.next;
    while (!nextCurr.val.playing) {
      nextCurr = nextCurr.next;
    }
    return nextCurr.val.id;
  }

  resetAction(bigBlind) {
    const res = {};
    let curr = this.players.root;
    while (curr.next != this.root) {
      if (curr.val.id === bigBlind) break;
      curr = curr.next;
    }
    let smallCurr = curr.prev;
    while (!smallCurr.val.playing) {
      smallCurr = smallCurr.prev;
    }
    res.smallBlind = smallCurr.val.id;
    let nextCurr = curr.next;
    while (!nextCurr.val.playing) {
      nextCurr = nextCurr.next;
    }
    res.currAction = nextCurr.val.id;
    return res;
  }
}

module.exports = PlayerList;
