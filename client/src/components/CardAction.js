import React from 'react';
import { connect } from 'react-redux';

const CardAction = props => {
  const { enabled, socket, currPlayer, table, pokerTable } = props;
  const [raise, setRaise] = React.useState(0);
  const [display, setDisplay] = React.useState({});
  const [active, setActive] = React.useState({
    check: false,
    fold: false,
    raise: false,
  });

  React.useEffect(() => {
    if (enabled) {
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
  }, [enabled]);

  React.useEffect(() => {
    socket &&
      socket.on('nextTurn', ({ id, currTable }) => {
        if (currPlayer.id === id) {
          const selectedPlayer = currTable.players.find(
            player => player.id === currPlayer.id
          );
          activeButtons(currTable, selectedPlayer);
        }
      });
  }, [active]);

  const activeButtons = (currTable, selectedPlayer) => {
    if (
      (active.check && !(currTable.toCall - selectedPlayer.playedChips)) ||
      active.raise
    ) {
      socket.emit('checkCall', { currPlayer, table });
    }
    if (active.fold && !(currTable.toCall - selectedPlayer.playedChips)) {
      socket.emit('fold', { currPlayer, table });
    }
    const result = {};
    Object.keys(active).map(key => (result[key] = false));
    setActive(result);
  };

  const handleCheckCall = e => {
    if (enabled) {
      socket.emit('checkCall', { currPlayer, table });
    } else {
      const result = { check: !active.check };
      Object.keys(active).map(key => {
        if (key !== 'check') result[key] = false;
      });
      setActive(result);
    }
  };

  const handleFold = e => {
    if (enabled) {
      socket.emit('fold', { currPlayer, table });
    } else {
      const result = { fold: !active.fold };
      Object.keys(active).map(key => {
        if (key !== 'fold') result[key] = false;
      });
      setActive(result);
    }
  };

  const handleRaise = (e, raise) => {
    if (enabled) {
      socket.emit('raise', {
        currPlayer,
        table,
        raise,
      });
    } else {
      const result = { raise: !active.raise };
      Object.keys(active).map(key => {
        if (key !== 'raise') result[key] = false;
      });
      setActive(result);
    }
  };

  const handleSlider = e => {
    const raiseAmount =
      Math.floor(e.target.value / pokerTable.blind) * pokerTable.blind;
    setRaise(raiseAmount);
  };

  return (
    currPlayer &&
    currPlayer.seated >= 0 && (
      <div className="card-actions">
        <div
          className={`action-button ${
            active.fold ? 'action-button-active' : ''
          }`}
          id="fold"
          onClick={handleFold}
        >
          <p>{display.fold} </p>
        </div>
        <div
          className={`action-button ${
            active.check ? 'action-button-active' : ''
          }`}
          id="checkCall"
          onClick={handleCheckCall}
        >
          {display.check}
        </div>

        <div className="raise-container">
          <div
            className={`action-button ${
              active.raise ? 'action-button-active' : ''
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
              max={currPlayer && currPlayer.chips}
              value={raise}
              onChange={handleSlider}
              className="raise-slider"
            />
            <input
              className="raise-input"
              onChange={e => setRaise(e.target.value)}
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
