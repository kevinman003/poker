import React, { useState, useEffect } from 'react';
import queryString from 'query-string';
import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

import CardAction from './CardAction';

let socket;

const Table = ({ location }) => {
  const [currPlayer, setCurrPlayer] = useState(null);
  const [pokerTable, setPokerTable] = useState();

  const ENDPOINT = 'localhost:5000';
  const { table } = queryString.parse(location.search);

  useEffect(() => {
    let id;
    if (localStorage.id) id = localStorage.id;
    else {
      id = uuidv4();
      localStorage.setItem('id', id);
    }
    let socket = io(ENDPOINT);
    socket.emit('join', { table, id }, player => setCurrPlayer(player));

    return () => {
      // TODO: implement functional disconnect
      socket.emit('disconnect', { table, id: localStorage.id });
      socket.off();
    };
  }, [location.search]);

  useEffect(() => {
    socket.on('updateTable', ({ currTable }) => {
      setPokerTable(currTable);
    });
  }, [pokerTable]);

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
    <div className="table">
      <button onClick={start}> start </button>
      {pokerTable &&
        pokerTable.players.map(player => {
          console.log('values: ', localStorage.id, player.id);
          console.log(localStorage.id !== player.id);
          return (
            <CardAction
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
        })}
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
    </div>
  );
};

export default Table;
