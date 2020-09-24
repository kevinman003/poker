const pokerTableReducer = (state = null, action) => {
  switch (action.type) {
    case 'UPDATE':
      return action.data;
    default:
      return state;
  }
};

const socketReducer = (state = null, action) => {
  switch (action.type) {
    case 'ADD':
      return action.data;
    default:
      return state;
  }
};

const currPlayerReducer = (state = null, action) => {
  switch (action.type) {
    case 'SET':
      return action.data;
    case 'ADD_CARDS':
      return { ...state, holeCards: action.data };
    case 'SIT':
      return { ...state, seated: action.data };
    default:
      return state;
  }
};

export { pokerTableReducer, socketReducer, currPlayerReducer };
