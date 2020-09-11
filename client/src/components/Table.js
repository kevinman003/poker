import React, { useState, useEffect } from 'react';
import queryString from 'query-string';
import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

import CardAction from './CardAction';

const STREETS = {
  PREFLOP: 'PREFLOP',
  FLOP: 'FLOP',
  TURN: 'TURN',
  RIVER: 'RIVER',
  NEXT: 'NEXT',
};

const Table = ({ location }) => {
  const [cards, setCards] = useState([]);
  const [players, setPlayers] = useState([]);
  const [currPlayer, setCurrPlayer] = useState(null);
  const [bigBlind, setBigBlind] = useState(0);
  const [currAction, setCurrAction] = useState(0);
  const [pot, setPot] = useState(0);
  const [bigBlindAmnt, setBigBlindAmnt] = useState(10);
  const [lastAction, setLastAction] = useState(0);
  const [street, setStreet] = useState(STREETS.PREFLOP);
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
      // TODO: implement functional disconnect
      socket.emit('disconnect', { table, id: localStorage.id });
      socket.off();
    };
  }, [location.search]);

  useEffect(() => {
    socket.on('updatePlayer', ({ newPlayers }) => {
      setPlayers(newPlayers);
    });
  }, [players]);

  useEffect(() => {
    socket.on('dealCards', ({ newCards }) => {
      setCards(newCards);
    });
  }, [cards]);

  useEffect(() => {
    socket.on('updateCurrAction', ({ currActionIdx }) => {
      // console.log('currplayer: ', currPlayer);
      // console.log('players: ', players);
      // const currPlayerIdx = players.findIndex(
      //   player => player.id === currPlayer.id
      // );
      // console.log('CURR INDEX: ', currPlayerIdx);
      // const actionPlayerIdx =
      //   currPlayerIdx + 1 === players.length ? 0 : currPlayerIdx + 1;
      // console.log('BEFORE: ', currAction, 'AFTER: ', actionPlayerIdx);
      setCurrAction(currActionIdx);
    });
  }, [currAction]);

  const handleCheckCall = e => {
    e.preventDefault();
    if (lastAction === currAction) {
      socket.emit('nextStreet', { street, table }, nextStreet => {
        console.log(nextStreet);
        setStreet(STREETS[nextStreet]);
      });
    }
    socket.emit('checkCall', { currPlayer, table }, () => {
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
    setLastAction(bigBlind);
    const smallBlind = bigBlind - 1 === -1 ? players.length - 1 : bigBlind - 1;
    const currActionIdx = bigBlind + 1 === players.length ? 0 : bigBlind + 1;
    console.log('BEFORE RAISE: ', players);
    socket.emit('blinds', {
      currPlayer: players[smallBlind],
      table,
      raise: bigBlindAmnt / 2,
      currActionIdx,
    });
    socket.emit('blinds', {
      currPlayer: players[bigBlind],
      table,
      raise: bigBlindAmnt / 2,
      currActionIdx,
    });
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
