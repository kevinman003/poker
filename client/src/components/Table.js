import React, { useState, useEffect } from 'react';
import queryString from 'query-string';
import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';


const Table = ({ location }) => {
  const [cards, setCards] = useState([]);
  const [hands, setHands] = useState([]);
  const [players, setPlayers] = useState([]);

  const ENDPOINT = 'http://localhost:5000';
  let socket = io(ENDPOINT);

  // joining logic 
  useEffect(() => {
    let id;
    const { table } = queryString.parse(location.search);
    if (localStorage.id) id = localStorage.id;
    else { 
      id = uuidv4();
      localStorage.setItem('id', id);
    }
    socket.emit('join', { table, id }, players => setPlayers(players));
    setHands(hands => [...hands, [5, 6]]);
    return() => {
      socket.emit('disconnect');
      socket.off();
    }
  }, [location.search]);

  socket.on('updatePlayer', ({currPlayers}) => {
    console.log('UPDATED: ', currPlayers);
    setPlayers(...players, currPlayers);
  });

  const handlePlayerAction = e => {
    e.preventDefault();
    console.log(e.target.id);
  };

  return(
    <div className='table'>
      {players.map(player => {
        return(
          <div className="player">
            {player.holeCards.map(card => {
              return(
                <p>{card.value} {card.suit}</p>
              )
            })}
            <button id='checkCall' onClick={handlePlayerAction}> check/call </button>
            <button id='fold' onClick={handlePlayerAction}> fold </button>
            <button id='raise' onClick={handlePlayerAction}> raise </button>
          </div>
        );
      })}
    </div>
  );
}

export default Table;
