class Table {
  constructor(id) {
    this.id = id;
    this.cards = [];
  }

  addCards(card) {
    this.cards = this.cards.concat(card);
  }

  printID() {
    console.log(this.id);
  }

  analyzeHand(){
    let faces = this.cards.map( card => card[0] );
    let suits = this.cards.map( card => card[1] );
    console.log(faces);
    console.log(suits);

    if( this.cards.some( (card, i, self) => i !== self.indexOf(card) ) || faces.some(face => face === -1) || suits.some(suit => suit === -1) ) 
      return 'invalid';
   
    let flush    = this.findFlush(suits);
    console.log(flush);
    let groups   = FACES.map( (face,i) => faces.filter(j => i === j).length).sort( (x, y) => y - x );
    let shifted  = faces.map(x => (x + 1) % 13);
    let distance = Math.min( Math.max(...faces) - Math.min(...faces), Math.max(...shifted) - Math.min(...shifted));
    let straight = groups[0] === 1 && distance < 5;
   
    if (straight && flush)                       return 'straight-flush'
    else if (groups[0] === 4)                    return 'four-of-a-kind'
    else if (groups[0] === 3 && groups[1] === 2) return 'full-house'
    else if (flush)                              return 'flush'
    else if (straight)                           return 'straight'
    else if (groups[0] === 3)                    return 'three-of-a-kind'
    else if (groups[0] === 2 && groups[1] === 2) return 'two-pair'
    else if (groups[0] === 2)                    return 'one-pair'
    else                                         return 'high-card';
  }

  findFlush(suits) {
    let suitSet = new Set(suits);
    for (let suit in suitSet) {
      if(this.cards.filter(suit => suit == suit).length >= 5) {
        return true;
      }
    }
    return false;
  }
}

module.exports = Table;
