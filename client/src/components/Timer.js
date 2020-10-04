import React from 'react';
import { connect } from 'react-redux';

const Timer = props => {
  const { socket, pokerTable, selectedPlayer } = props;
  const [maxTime, setMaxTime] = React.useState();
  const [timer, setTimer] = React.useState();
  let count = React.useRef();

  const timerStyle = {
    backgroundColor:
      timer / maxTime > 0.5 ? '#0f0' : timer / maxTime > 0.15 ? '#ff0' : '#f00',
    width: `${(timer / maxTime) * 100}%`,
  };

  const startCount = () => {
    count = setTimeout(() => {
      if (timer) {
        if (timer <= 0) {
          clearInterval(count.current);
          socket.emit('time', { table: pokerTable.id });
        } else {
          setTimer(timer - 0.1);
        }
      }
    }, 100);
  };

  React.useEffect(() => {
    if (pokerTable) {
      if (pokerTable.players[pokerTable.currAction].id === selectedPlayer.id)
        startCount();
    }
    return () => {
      clearInterval(count.current);
    };
  });

  React.useEffect(() => {
    if (pokerTable) {
      const time = pokerTable.time;
      setMaxTime(time);
      setTimer(time);
    }
  }, [pokerTable]);

  return (
    <div className="timer">
      <div className="timer-outer">
        <div className="timer-inner" style={timerStyle}></div>
      </div>
    </div>
  );
};

const mapStateToProps = state => {
  return {
    pokerTable: state.pokerTable,
    socket: state.socket,
  };
};
export default connect(mapStateToProps, null)(Timer);
