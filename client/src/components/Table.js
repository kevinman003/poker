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
  const [bigBlind, setBigBlind] = useState();
  const [smallBlind, setSmallBlind] = useState(0);
  const [currAction, setCurrAction] = useState(0);
  const [pot, setPot] = useState(0);
  const [lastAction, setLastAction] = useState(0);
  const [street, setStreet] = useState(STREETS.PREFLOP);
  const [winner, setWinner] = useState();
  const [pokerTable, setPokerTable] = useState();

  const nextAction = currAction + 1 === players.length ? 0 : currAction + 1;
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
      console.log('update player bb: ', bigBlind);
      setPlayers(newPlayers);
    });
  }, [players]);

  useEffect(() => {
    socket.on('dealCards', ({ newCards }) => {
      setCards(newCards);
    });
  }, [cards]);

  useEffect(() => {
    socket.on('updateCurrAction', ({ nextAction }) => {
      console.log('CURR ACTION: ', bigBlind);
      setCurrAction(nextAction);
    });
  }, [currAction]);

  useEffect(() => {
    socket.on('updateLastAction', ({ lastActionIdx }) => {
      setLastAction(lastActionIdx);
    });
  });
  useEffect(() => {
    socket.on('pot', ({ newPot }) => {
      setPot(newPot);
    });
  }, [pot]);

  useEffect(() => {
    socket.on('updateTable', ({ currTable }) => {
      setPokerTable(currTable);
    });
  });

  useEffect(() => {
    socket.on('winner', ({ newWinner, newPlayers }) => {
      console.log('winner big: ', bigBlind);
      const bigBlindIdx = bigBlind + 1 === newPlayers.length ? 0 : bigBlind + 1;
      setBigBlind(bigBlindIdx);
      console.log('winner big idx: ', bigBlindIdx);
      setWinner(newWinner);
    });
  }, [winner]);

  useEffect(() => {
    if (players.length >= 2) {
      console.log('TEST:', players[currAction].id);
      console.log('USEEFFECT:', bigBlind);
      start();
    }
  }, [bigBlind]);

  const handleCheckCall = e => {
    e.preventDefault();
    socket.emit('checkCall', { currPlayer, table });
    // const lastToAct = lastAction === currAction;
    // socket.emit('checkCall', { currPlayer, table, nextAction, lastToAct });
    // if (lastToAct) {
    //   const lastActionIdx =
    //     smallBlind - 1 < 0 ? players.length - 1 : smallBlind - 1;
    //   setLastAction(lastActionIdx);
    //   socket.emit('nextStreet', { street, table, pot }, nextStreet => {
    //     setStreet(STREETS[nextStreet]);
    //   });
    // }
  };

  const handleFold = e => {
    e.preventDefault();
    const activePlayers = players.filter(player => player.playing);
    if (activePlayers.length === 2) {
      const winner = activePlayers.find(player => player.id !== currPlayer.id);
      console.log(winner);
      socket.emit('winner', { table, winner });
      // TODO: finish else
    } else {
      socket.emit('fold', { currPlayer, table, nextAction }, () => {
        setCurrAction(currAction + 1 === players.length ? 0 : currAction + 1);
      });
    }
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

  console.log(
    'curr action: ',
    pokerTable && pokerTable.players[pokerTable.currAction].name
  );
  return (
    <div className="table">
      <button onClick={start}> start </button>
      {pokerTable &&
        pokerTable.players.map(player => {
          return (
            <CardAction
              player={player}
              disabled={
                pokerTable.players[pokerTable.currAction].id !== player.id
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
