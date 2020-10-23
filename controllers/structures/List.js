function Node(val, prev, next) {
  this.val = val;
  this.prev = prev;
  this.next = next || this;
}

function List() {
  this.root = null;

  this.add = val => {
    const lastNode = this.findLast();
    const newNode = new Node(val, lastNode, this.root);
    if (!lastNode) {
      this.root = newNode;
    } else {
      lastNode.next = newNode;
    }
    this.root.prev = newNode;
    return newNode;
  };

  List.prototype.findLast = () => {
    let curr = this.root;
    while (curr && curr.next && curr.next !== this.root) {
      curr = curr.next;
    }
    return curr;
  };

  this.map = callback => {
    const res = [];

    let curr = this.root;
    if (!curr) return false;
    while (curr && curr.next !== this.root) {
      res.push(callback(curr.val));
      curr = curr.next;
    }
    res.push(callback(curr.val));
    return res;
  };

  this.some = callback => {
    let curr = this.root;
    if (!curr) return false;

    while (curr && curr.next !== this.root) {
      if (callback(curr.val)) {
        return true;
      }
      curr = curr.next;
    }

    return callback(curr.val);
  };

  this.find = callback => {
    let curr = this.root;
    if (!curr) return undefined;

    while (curr && curr.next !== this.root) {
      if (callback(curr.val)) {
        return curr.val;
      }
      curr = curr.next;
    }
    if (callback(curr.val)) {
      return curr.val;
    }
    return undefined;
  };

  this.toArray = () => {
    const res = [];
    let curr = this.root;
    if (!curr) return res;
    while (curr.next !== this.root) {
      res.push(curr.val);
      curr = curr.next;
    }
    res.push(curr.val);
    return res;
  };

  this.detach = () => {
    if (this.root.prev) this.root.prev.next = null;
    this.root.prev = null;
  };

  this.reattach = () => {
    const lastNode = this.findLast();
    if (lastNode) lastNode.next = this.root;
    this.root.prev = lastNode;
  };

  this.filter = callback => {
    const res = [];
    let curr = this.root;
    if (!curr) return res;
    while (curr.next !== this.root) {
      if (callback(curr.val)) {
        res.push(curr.val);
      }
      curr = curr.next;
    }
    res.push(curr.val);
    return res;
  };
}

module.exports = List;
