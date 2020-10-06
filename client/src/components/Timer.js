import React from 'react';
import { connect } from 'react-redux';

const Timer = props => {
  const { socket, pokerTable, selectedPlayer, currPlayer } = props;
  const [maxTime, setMaxTime] = React.useState();
  const [timer, setTimer] = React.useState();
  let count = React.useRef();

  const timerStyle = {
    backgroundColor:
      timer / maxTime > 0.5 ? '#0f0' : timer / maxTime > 0.15 ? '#ff0' : '#f00',
    width: `${(timer / maxTime) * 100}%`,
  };

  React.useEffect(() => {
    socket &&
      socket.on('time', ({ time }) => {
        setTimer(time);
      });
  }, [socket]);

  React.useEffect(() => {
    if (pokerTable) {
      setMaxTime(pokerTable.time);
      setTimer(pokerTable.timeCount);
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
    currPlayer: state.currPlayer,
  };
};
export default connect(mapStateToProps, null)(Timer);
