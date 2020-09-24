import React from 'react';
import { connect } from 'react-redux';

import Card from './Card';

const Player = props => {
  const { seatNumber, currPlayer, socket, pokerTable } = props;

  const handleSit = () => {
    socket.emit('sit', {
      table: pokerTable.id,
      currPlayer,
      seatNumber: seatNumber,
    });
  };

  let selected =
    pokerTable &&
    Object.keys(pokerTable.playerPositions).some(p => p === seatNumber);
  return currPlayer ? (
    <div>
      <div className={`seat seat-${seatNumber}`}>
        <p className="player-name"> {currPlayer.name} </p>
        <div className="player-chips">
          <p> {currPlayer.playedChips} </p>
        </div>
        <div className="card-container">
          {currPlayer.holeCards.map(card => {
            return <Card card={card} />;
          })}
        </div>
      </div>
    </div>
  ) : (
    <div className="no-seat" onClick={handleSit}>
      {' '}
      lmao
    </div>
  );
};

const mapStateToProps = state => {
  return {
    pokerTable: state.pokerTable,
    socket: state.socket,
    currPlayer: state.currPlayer,
  };
};

export default connect(mapStateToProps, null)(Player);
