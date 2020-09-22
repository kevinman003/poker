import React from 'react';
import { connect } from 'react-redux';

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
  return selected ? (
    <div>
      <div className={`seat seat-${seatNumber}`}>
        <p className="player-name"> {currPlayer.name} </p>
        <div className="player-chips">
          <p> {currPlayer.playedChips} </p>
        </div>
        {currPlayer.holeCards.map(card => {
          return (
            <p key={`${currPlayer.id}-${card.value}-${card.suit}`}>
              {card.value} {card.suit}
            </p>
          );
        })}
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
