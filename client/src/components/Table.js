import React, { useState, useEffect } from 'react';
import queryString from 'query-string';
import io from 'socket.io-client';

let socket;

const Table = ({ location }) => {
  const [cards, setCards] = useState([]);
  const [hands, setHands] = useState([]);
  const ENDPOINT = 'localhost:5000';

  useEffect(() => {
    const { table } = queryString.parse(location.search);
    console.log(table);
    socket = io(ENDPOINT);
    socket.emit('join', { table });
    setHands(hands => [...hands, [5, 6]]);

    return() => {
      socket.emit('disconnect');
      socket.off();
    }
  }, [location.search]);

  const addHands = () => {
    setHands(hands => [...hands, [1, 2]]);
  }
  
  return(
    <div className='table'>
      <button onClick={addHands}>Lmao</button>
      <p>cards {cards}</p>
      <p>hands {hands}</p>
      <h1>lmao</h1>
    </div>
  );
}

export default Table;
