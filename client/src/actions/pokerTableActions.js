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

export { updatePokerTableAction, addSocketAction, setCurrPlayerAction };
