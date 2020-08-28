import React, { useState, useEffect } from 'react';
import queryString from 'query-string';
import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

import CardAction from './CardAction';

const Table = ({ location }) => {
  const [cards, setCards] = useState([]);
  const [hands, setHands] = useState([]);
  const [players, setPlayers] = useState([]);
  const [currPlayer, setCurrPlayer] = useState(null);
  const [bigBlind, setBigBlind] = useState(0);
  const [currAction, setCurrAction] = useState(0);

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
    console.log('JOINING!!');
    socket.emit('join', { table, id }, (player) => setCurrPlayer(player));
    socket.on('updatePlayer', ({ newPlayers }) => {
      setPlayers(...players, newPlayers);
    });

    setHands((hands) => [...hands, [5, 6]]);
    return () => {
      socket.emit('disconnect');
      socket.off();
    };
  }, [location.search]);

  const handlePlayerAction = (e) => {
    e.preventDefault();
    socket.emit('playerAction', { action: e.target.id, currPlayer }, () => {
      setCurrAction(currAction + 1 === players.length ? 0 : currAction + 1);
      console.log('BING BLIND: ', bigBlind);
    });
  };

  const start = () => {
    setBigBlind(Math.floor(Math.random() * players.length));
    setCurrAction(bigBlind + 1 === players.length ? 0 : bigBlind + 1);
    socket.emit('start', { table }, (cards) => setCards(cards));
  };

  return (
    <div className="table">
      <button onClick={start}> start </button>
      {players.map((player) => {
        return (
          <CardAction
            player={player}
            disabled={players[currAction].id !== player.id}
            handlePlayerAction={handlePlayerAction}
          />
        );
      })}
      <div className="cards">
        {cards.map((card) => {
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
