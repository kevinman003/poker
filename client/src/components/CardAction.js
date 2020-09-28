import React from 'react';
import { connect } from 'react-redux';
import { useStateWithCallbackLazy } from 'use-state-with-callback';

const CardAction = props => {
  const { enabled, thisTurn, socket, currPlayer, table, pokerTable } = props;
  const [raise, setRaise] = React.useState(0);
  const [display, setDisplay] = React.useState({});
  const [active, setActive] = useStateWithCallbackLazy({
    check: false,
    fold: false,
    raise: false,
  });

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

  React.useEffect(() => {
    const deactivate = () => {
      const result = {};
      Object.keys(active).map(key => (result[key] = false));
      setActive(result);
    };
    if (
      pokerTable &&
      pokerTable.players[pokerTable.currAction].id === currPlayer.id
    ) {
      const selectedPlayer = pokerTable.players.find(
        player => player.id === currPlayer.id
      );
      if (
        (active.check && !(pokerTable.toCall - selectedPlayer.playedChips)) ||
        active.raise
      ) {
        socket.emit('checkCall', { currPlayer, table });
      }
      if (active.fold && pokerTable.toCall - selectedPlayer.playedChips) {
        socket.emit('fold', { currPlayer, table });
      }
    }
    deactivate();
  }, [pokerTable]);

  const handleCheckCall = e => {
    if (thisTurn) {
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
    if (thisTurn) {
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
    if (thisTurn) {
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

  const handleTextRaise = e => {
    const selectedPlayer =
      pokerTable &&
      pokerTable.players.find(player => player.id === currPlayer.id);
    const maxChips = selectedPlayer.chips + selectedPlayer.playedChips;
    const raiseAmount = e.target.value > maxChips ? maxChips : e.target.value;
    setRaise(raiseAmount);
  };

  const maxRange = () => {
    const selectedPlayer =
      pokerTable &&
      pokerTable.players.find(player => player.id === currPlayer.id);
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
