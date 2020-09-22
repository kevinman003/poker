class Node {
  constructor(data) {
    this.data = data;
    this.prev = null;
    this.next = null;
  }
}

const LinkedList = () => {
  this.root = null;
  this.tailNode = null;
  this.count = 0;

  this.add = data => {
    const newNode = new Node(data);
    if (!this.root) this.root = newNode;
    else {
      this.tailNode.next = newNode;
      newNode.prev = this.tailNode;
    }
    this.count++;
    this.tailNode = newNode;
    newNode.next = this.root;
  };

  this.get = index => {
    if (index > -1 && index < this.count) {
      let curr = this.root;
      let i = 0;
      while (i < this.count && i < index) {
        curr = curr.next;
        i++;
      }
      return curr.data;
    } else return undefined;
  };
  LinkedList.prototype.some = fn => {
    const res = new LinkedList();
    let curr = this.root;
    let i = 0;
    while (i < this.count) {
      if (fn(curr.value)) return true;
      curr = curr.next;
      i++;
    }
    return false;
  };
};

module.exports = LinkedList;
