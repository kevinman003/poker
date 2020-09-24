import React, { useState, useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  updatePokerTableAction,
  addSocketAction,
  setCurrPlayerAction,
  addHoleCardsAction,
} from '../actions/pokerTableActions';

import queryString from 'query-string';
import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

import CardAction from './CardAction';
import Player from './Player';
import Table from './Table';
let socket;

const TablePage = props => {
  // const [pokerTable, setPokerTable] = useState();
  const {
    pokerTable,
    addSocket,
    updatePokerTable,
    currPlayer,
    setCurrPlayer,
    addHoleCards,
    location,
  } = props;
  const ENDPOINT = 'localhost:5000';
  const { table } = queryString.parse(location.search);

  useEffect(() => {
    let id;
    if (localStorage.id) id = localStorage.id;
    else {
      id = uuidv4();
      localStorage.setItem('id', id);
    }
    socket = io(ENDPOINT);
    addSocket(socket);
    socket.emit('join', { table, id }, player => setCurrPlayer(player));

    return () => {
      // TODO: implement functional disconnect
      socket.emit('disconnect', { table, id: localStorage.id });
      socket.off();
    };
  }, [location.search]);

  useEffect(() => {
    socket.on('updateTable', ({ currTable }) => {
      updatePokerTable(currTable);
    });
  }, [pokerTable]);

  useEffect(() => {
    socket.on('dealCards', ({ currTable }) => {
      if (currPlayer) {
        const player = currTable.players.find(
          player => player.id === currPlayer.id
        );
        addHoleCards(player.holeCards);
      }
    });
  }, [currPlayer]);
  const handleCheckCall = e => {
    e.preventDefault();
    socket.emit('checkCall', { currPlayer, table });
  };

  const handleFold = e => {
    e.preventDefault();
    socket.emit('fold', { currPlayer, table });
  };

  const handleRaise = (e, raise) => {
    e.preventDefault();
    socket.emit('raise', {
      currPlayer,
      table,
      raise,
    });
  };

  const start = () => {
    socket.emit('start', { table });
  };
  return (
    <div className="tablePage">
      <button onClick={start}> start </button>
      {/* {pokerTable &&
        pokerTable.players.map(player => {
          return (
            <Player
              player={player}
              disabled={
                pokerTable.players[pokerTable.currAction].id !== player.id ||
                localStorage.id !== player.id
              }
              handleCheckCall={handleCheckCall}
              handleFold={handleFold}
              handleRaise={handleRaise}
            />
          );
        })} */}
      POT: {pokerTable && pokerTable.chips}
      <div className="cards">
        {pokerTable &&
          pokerTable.cards.map(card => {
            return (
              <p>
                {card.value} {card.suit}{' '}
              </p>
            );
          })}
      </div>
      WINNER:{' '}
      {pokerTable &&
        pokerTable.winner &&
        `${pokerTable.winner.name} WITH ${pokerTable.winner.cardRank}`}
      <Table />
      <CardAction
        handleCheckCall={handleCheckCall}
        handleFold={handleFold}
        handleRaise={handleRaise}
      />
    </div>
  );
};

const mapStateToProps = state => {
  return {
    pokerTable: state.pokerTable,
    currPlayer: state.currPlayer,
  };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    {
      updatePokerTable: updatePokerTableAction,
      addSocket: addSocketAction,
      setCurrPlayer: setCurrPlayerAction,
      addHoleCards: addHoleCardsAction,
    },
    dispatch
  );
};
export default connect(mapStateToProps, mapDispatchToProps)(TablePage);
