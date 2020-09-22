import { combineReducers } from 'redux';

import {
  pokerTableReducer,
  socketReducer,
  currPlayerReducer,
} from './pokerTableReducer';

const combinedReducers = combineReducers({
  pokerTable: pokerTableReducer,
  socket: socketReducer,
  currPlayer: currPlayerReducer,
});

export default combinedReducers;
