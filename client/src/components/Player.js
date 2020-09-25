import React from 'react';
import { connect } from 'react-redux';

import Card from './Card';

const Player = props => {
  const { seatNumber, currPlayer, socket, pokerTable } = props;
  const [selectedPlayer, setSelectedPlayer] = React.useState(null);
  const [enabled, setEnabled] = React.useState(false);

  React.useEffect(() => {
    if (pokerTable) {
      const selected = pokerTable && pokerTable.playerPositions[seatNumber];

      if (selected) {
        const seatedPlayer = pokerTable.players.find(
          player => player.id === selected
        );
        setSelectedPlayer(seatedPlayer);
        setEnabled(
          pokerTable &&
            currPlayer &&
            pokerTable.players[pokerTable.currAction].id === seatedPlayer.id
        );
      }
    }
  }, [pokerTable]);

  const handleSit = () => {
    socket.emit('sit', {
      table: pokerTable.id,
      currPlayer,
      seatNumber: seatNumber,
    });
  };

  return (
    <div>
      {selectedPlayer && (
        <div className={`seat-inner-container`}>
          <div className={`seat ${enabled ? 'player-active' : undefined}`}>
            <p className="player-name"> {selectedPlayer.name} </p>
            <div className="player-chips">
              <p> {selectedPlayer.chips} </p>
            </div>
          </div>
          <div className="card-container">
            {selectedPlayer.holeCards.map(card => {
              return <Card card={card} />;
            })}
          </div>
        </div>
      )}
      {currPlayer && !selectedPlayer && currPlayer.seated < 0 && (
        <div className="no-seat" onClick={handleSit}>
          SIT
        </div>
      )}
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
