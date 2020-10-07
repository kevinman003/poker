import React from 'react';
import { connect } from 'react-redux';

import Card from './Card';
import Timer from './Timer';

const Player = props => {
  const { seatNumber, currPlayer, socket, pokerTable } = props;
  const [selectedPlayer, setSelectedPlayer] = React.useState(null);
  const [enabled, setEnabled] = React.useState(false);

  // Display player on seat if it is taken
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
            !pokerTable.disabled &&
            pokerTable.players[pokerTable.currAction].id === seatedPlayer.id
        );
      } else {
        setSelectedPlayer(null);
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
          {enabled && pokerTable && !pokerTable.length && (
            <Timer selectedPlayer={selectedPlayer} />
          )}
          <div className={`seat ${enabled ? 'player-active' : ''}`}>
            <p className="player-name"> {selectedPlayer.name} </p>
            <div className="player-chips">
              <p> {selectedPlayer.chips} </p>
            </div>
          </div>
          <div className="card-container">
            {selectedPlayer.holeCards.map(card => {
              return (
                <Card
                  key={`${selectedPlayer.id}-${selectedPlayer.holeCards.indexOf(
                    card
                  )}`}
                  shown={
                    selectedPlayer.id === currPlayer.id ||
                    selectedPlayer.showCards
                  }
                  card={card}
                />
              );
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
