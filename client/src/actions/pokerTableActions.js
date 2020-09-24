const updatePokerTableAction = pokerTable => {
  return {
    type: 'UPDATE',
    data: pokerTable,
  };
};

const addSocketAction = socket => {
  return {
    type: 'ADD',
    data: socket,
  };
};

const setCurrPlayerAction = currPlayer => {
  return {
    type: 'SET',
    data: currPlayer,
  };
};

const addHoleCardsAction = holeCards => {
  return {
    type: 'ADD_CARDS',
    data: holeCards,
  };
};

const sitPlayerAction = sit => {
  return {
    type: 'SIT',
    data: sit,
  };
};
export {
  updatePokerTableAction,
  addSocketAction,
  setCurrPlayerAction,
  addHoleCardsAction,
  sitPlayerAction,
};
