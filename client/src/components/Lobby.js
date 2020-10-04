import React from 'react';
import { connect } from 'react-redux';

const Lobby = props => {
  const { shown, handleToggle, socket } = props;
  const [tables, setTables] = React.useState();

  React.useEffect(() => {
    socket &&
      socket.emit('getTables', {}, tables => {
        setTables(tables);
      });
  }, [shown]);

  return shown ? (
    <div className="lobby">
      <div className="lobby-background" onClick={handleToggle}></div>
      <div className="lobby-modal">
        <div className="lobby-title"> Lobby </div>
        <div className="lobby-info">
          <div className="lobby-name"> Name </div>
          <div className="lobby-players"> Players </div>
          {tables &&
            Object.keys(tables).map(table => {
              return <div className="lobby-item"> {tables[table].name} </div>;
            })}

          {tables &&
            Object.keys(tables).map(table => {
              return (
                <div className="lobby-item">
                  {
                    tables[table].players.filter(player => player.seated >= 0)
                      .length
                  }
                  /9
                </div>
              );
            })}
        </div>
      </div>
    </div>
  ) : null;
};

const mapStateToProps = state => {
  return {
    socket: state.socket,
  };
};

export default connect(mapStateToProps, null)(Lobby);
