import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';

import Player from './Player';
import Chips from './Chips';

const Table = props => {
  const { pokerTable } = props;

  const createSeats = seats => {
    const seatComponents = [];
    for (var i = 0; i < 8 / 2; i++) {
      seatComponents.push(
        <div className={`seat-container seat-container-${i}`}>
          <Player seatNumber={i * 2} />
          <Player seatNumber={i * 2 + 1} />
        </div>
      );
    }
    seatComponents.push(
      <div className="seat-container seat-container-4">
        {' '}
        <Player seatNumber={9} />
      </div>
    );
    return seatComponents;
  };

  const test = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  return (
    <div>
      <div className="table-container">
        {test.map(position => (
          <Chips value={60} position={position} />
        ))}
        {/* <Chips value={60} position={6} /> */}
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

const mapStateToProps = state => {
  return {
    pokerTable: state.pokerTable,
  };
};
export default connect(mapStateToProps, null)(Table);
