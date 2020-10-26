import React from 'react';
import { connect } from 'react-redux';

const CardAction = props => {
  const { enabled, thisTurn, socket, currPlayer, table, pokerTable } = props;
  const [raise, setRaise] = React.useState(0);
  const [display, setDisplay] = React.useState({});

  const [selectedPlayer, setSelectedPlayer] = React.useState();

  React.useEffect(() => {
    if (thisTurn) {
      setDisplay({
        check: 'check',
        fold: 'fold',
        raise: 'raise',
      });
    } else {
      setDisplay({
        check: 'check  call',
        fold: 'check fold',
        raise: 'check any',
      });
    }
  }, [thisTurn]);

  // setting raise slider and selectedPlayer
  React.useEffect(() => {
    if (pokerTable) {
      setSelectedPlayer(
        pokerTable.players.find(player => player.id === currPlayer.id)
      );
      setRaise(pokerTable.toCall);
    }
  }, [pokerTable]);

  const handleCheckCall = () => {
    if (pokerTable && !pokerTable.disabled) {
      if (thisTurn) {
        socket.emit('checkCall', { currPlayer, table });
      } else {
        const selectedPlayer = pokerTable.players.find(
          player => player.id === currPlayer.id
        );
        if (selectedPlayer.premove.check) {
          socket.emit('stopPremove', { currPlayer, table }, () => {});
        } else {
          socket.emit('premove', { currPlayer, table, move: 'check' });
        }
      }
    }
  };

  const handleFold = () => {
    if (pokerTable && !pokerTable.disabled) {
      if (thisTurn) {
        socket.emit('fold', { currPlayer, table });
      } else {
        const selectedPlayer = pokerTable.players.find(
          player => player.id === currPlayer.id
        );
        if (selectedPlayer.premove.fold) {
          socket.emit('stopPremove', { currPlayer, table }, () => {});
        } else {
          socket.emit('premove', { currPlayer, table, move: 'fold' });
        }
      }
    }
  };

  const handleRaise = () => {
    if (pokerTable && !pokerTable.disabled) {
      if (thisTurn) {
        let newRaise;

        if (raise <= pokerTable.toCall) {
          newRaise = pokerTable.toCall + pokerTable.blind;
        }
        socket.emit('raise', {
          currPlayer,
          table,
          raise: newRaise || raise,
        });
      } else {
        const selectedPlayer = pokerTable.players.find(
          player => player.id === currPlayer.id
        );
        if (selectedPlayer.premove.raise) {
          socket.emit('stopPremove', { currPlayer, table }, () => {});
        } else {
          socket.emit('premove', { currPlayer, table, move: 'raise' });
        }
      }
    }
  };

  const handleSlider = e => {
    const raiseAmount =
      Math.floor(e.target.value / pokerTable.blind) * pokerTable.blind;
    setRaise(raiseAmount);
  };

  const handleTextRaise = e => {
    const maxChips = selectedPlayer.chips + selectedPlayer.playedChips;
    const raiseAmount = e.target.value > maxChips ? maxChips : e.target.value;
    setRaise(raiseAmount);
  };

  const maxRange = () => {
    const maxChips = selectedPlayer && selectedPlayer.chips;
    return maxChips;
  };

  return (
    currPlayer &&
    currPlayer.seated >= 0 &&
    enabled && (
      <div className="card-actions">
        <div
          className={`action-button ${
            selectedPlayer && selectedPlayer.premove.fold
              ? 'action-button-active'
              : ''
          }`}
          id="fold"
          onClick={handleFold}
        >
          <p>{display.fold} </p>
        </div>
        <div
          className={`action-button ${
            selectedPlayer && selectedPlayer.premove.check
              ? 'action-button-active'
              : ''
          }`}
          id="checkCall"
          onClick={handleCheckCall}
        >
          {display.check}
        </div>

        <div className="raise-container">
          <div
            className={`action-button ${
              selectedPlayer && selectedPlayer.premove.raise
                ? 'action-button-active'
                : ''
            }`}
            id="raise"
            onClick={e => handleRaise(e, raise)}
          >
            {display.raise}
          </div>
          <div className="raise-choose">
            <input
              type="range"
              min={pokerTable && pokerTable.blind}
              max={maxRange()}
              value={raise}
              onChange={handleSlider}
              className="raise-slider"
            />
            <input
              className="raise-input"
              onChange={handleTextRaise}
              type="text"
              value={raise}
            />
          </div>
        </div>
      </div>
    )
  );
};

const mapStateToProps = state => {
  return {
    socket: state.socket,
    currPlayer: state.currPlayer,
    pokerTable: state.pokerTable,
  };
};

export default connect(mapStateToProps, null)(CardAction);
