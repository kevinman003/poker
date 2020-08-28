import React, { useState, useEffect } from 'react';
import queryString from 'query-string';
import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

import CardAction from './CardAction';

const Table = ({ location }) => {
  const [cards, setCards] = useState([]);
  const [players, setPlayers] = useState([]);
  const [currPlayer, setCurrPlayer] = useState(null);
  const [bigBlind, setBigBlind] = useState(0);
  const [currAction, setCurrAction] = useState(0);
  const [pot, setPot] = useState(0);
  const [bigBlindAmnt, setBigBlindAmnt] = useState(10);

  // change later
  const ENDPOINT = 'http://localhost:5000';
  let socket = io(ENDPOINT);
  const { table } = queryString.parse(location.search);

  // joining logic
  useEffect(() => {
    let id;
    if (localStorage.id) id = localStorage.id;
    else {
      id = uuidv4();
      localStorage.setItem('id', id);
    }
    socket.emit('join', { table, id }, player => setCurrPlayer(player));

    return () => {
      socket.emit('disconnect');
      socket.off();
    };
  }, [location.search]);

  useEffect(() => {
    socket.on('updatePlayer', ({ newPlayers }) => {
      setPlayers(...players, newPlayers);
    });
  }, [players]);
  const handleCheckCall = e => {
    e.preventDefault();
    socket.emit('checkCall', { currPlayer }, () => {
      setCurrAction(currAction + 1 === players.length ? 0 : currAction + 1);
    });
  };

  const handleFold = e => {
    e.preventDefault();
    socket.emit('fold', { currPlayer }, () => {
      setCurrAction(currAction + 1 === players.length ? 0 : currAction + 1);
    });
  };

  const handleRaise = (e, raise) => {
    e.preventDefault();
    socket.emit('raise', { currPlayer, raise }, () => {
      setCurrAction(currAction + 1 === players.length ? 0 : currAction + 1);
    });
  };

  const start = () => {
    setBigBlind(Math.floor(Math.random() * players.length));
    const smallBlind = bigBlind - 1 === -1 ? players.length - 1 : bigBlind - 1;
    socket.emit('raise', {
      currPlayer: players[smallBlind],
      raise: bigBlindAmnt / 2,
    });
    socket.emit('raise', {
      currPlayer: players[bigBlind],
      raise: bigBlindAmnt / 2,
    });
    setCurrAction(bigBlind + 1 === players.length ? 0 : bigBlind + 1);
    socket.emit('start', { table, bigBlindAmnt }, cards => setCards(cards));
  };

  return (
    <div className="table">
      <button onClick={start}> start </button>
      {players.map(player => {
        return (
          <CardAction
            player={player}
            disabled={players[currAction].id !== player.id}
            handleCheckCall={handleCheckCall}
            handleFold={handleFold}
            handleRaise={handleRaise}
          />
        );
      })}
      POT: {pot}
      <div className="cards">
        {cards.map(card => {
          return (
            <p>
              {card.value} {card.suit}{' '}
            </p>
          );
        })}
      </div>
    </div>
  );
};

export default Table;
