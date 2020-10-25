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
    while (curr.val.id !== bigBlind) {
      curr = curr.next;
    }
    // let smallCurr = curr.prev;
    // while (!smallCurr.val.playing) {
    //   smallCurr = smallCurr.prev;
    // }
    // let nextCurr = curr.next;
    // while (!nextCurr.val.playing) {
    //   nextCurr = nextCurr.next;
    // }
    if (this.length === 2) {
      res.smallBlind = curr.val.id;
      res.currAction = res.smallBlind;
    } else {
      res.smallBlind = curr.val.id;
      res.currAction = curr.next.next.val.id;
    }
    res.bigBlind = curr.next.val.id;
    return res;
  }

  postFlopLastAction(smallBlind) {
    const res = {};
    let curr = this.players.root;
    while (curr.val.id !== smallBlind) {
      curr = curr.next;
    }
    const activePlayers = this.getPlayers().length;
    if (activePlayers === 2) {
      res.lastAction = curr.val.id;
      res.currAction = curr.next.val.id;
    } else {
      res.lastAction = curr.prev.val.id;
      res.currAction = curr.val.id;
    }
    return res;
  }

  seat(id) {
    let curr = this.players.root;
    if (this.length === 1) return;
    while (curr.val.id !== id) {
      curr = curr.next;
    }
    if (
      curr.val.seated > curr.prev.val.seated &&
      curr.val.seated < curr.next.val.seated
    )
      return;
    let insertNode = this.players.root;
    while (insertNode.val.seated < curr.val.seated) {
      insertNode = insertNode.next;
    }
    if (this.length > 2) {
      curr.prev.next = curr.next;
      curr.next.prev = curr.prev;
      insertNode.prev.next = curr;
      curr.next = insertNode;
      curr.prev = insertNode.prev;
      insertNode.prev = curr;
    }
    this.resetRoot();
  }

  resetRoot() {
    let curr = this.players.root;
    let smallestNode = curr;
    curr = curr.next;
    while (curr.next !== this.players.root) {
      if (curr.val.seated < smallestNode.val.seated) {
        smallestNode = curr;
      }
      curr = curr.next;
    }
    this.players.root = smallestNode;
  }

  findNextPlaying(node) {
    let curr = node;
    while (!curr.val.playing) {
      curr = curr.next;
    }
    return curr;
  }
}

module.exports = PlayerList;
