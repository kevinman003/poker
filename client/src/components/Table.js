import React, { useState, useEffect } from 'react';

import Seat from './Seat';
import CardAction from './CardAction';

const createSeats = seats => {
  const seatComponents = [];
  for (var i = 0; i < 8 / 2; i++) {
    seatComponents.push(
      <div className={`seat-container seat-container-${i}`}>
        <Seat seatNumber={i * 2} />
        <Seat seatNumber={i * 2 + 1} />
      </div>
    );
  }
  seatComponents.push(
    <div className="seat-container seat-container-4">
      {' '}
      <Seat seatNumber={9} />
    </div>
  );
  return seatComponents;
};

const Table = () => {
  return (
    <div>
      <div className="table-container">
        <div className="seat-outer-container">
          <div className="table">
            <div className="table-middle"></div>
          </div>
          {createSeats(9)}
        </div>
      </div>
    </div>
  );
};

export default Table;
