import React from 'react';
import { connect } from 'react-redux';

import Card from './Card';

const Player = props => {
  const { seatNumber, currPlayer, socket, pokerTable } = props;
  const [selectedPlayer, setSelectedPlayer] = React.useState(null);

  React.useEffect(() => {
    if (pokerTable) {
      const selected = pokerTable && pokerTable.playerPositions[seatNumber];

      if (selected) {
        const seatedPlayer = pokerTable.players.find(
          player => player.id === selected
        );
        setSelectedPlayer(seatedPlayer);
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

  console.log('currPlayer:', currPlayer);
  return (
    <div>
      {selectedPlayer && (
        <div>
          <div className="player-container">
            <div className={`seat seat-${seatNumber}`}>
              <p className="player-name"> {selectedPlayer.name} </p>
              <div className="player-chips">
                <p> {selectedPlayer.chips} </p>
              </div>
              <div className="card-container">
                {selectedPlayer.holeCards.map(card => {
                  return <Card card={card} />;
                })}
              </div>
            </div>
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
