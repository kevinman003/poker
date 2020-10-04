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
        <div className="lobby-title">
          Lobby
          <div className="lobby-close" onClick={handleToggle}>
            x
          </div>
        </div>

        <div className="lobby-info">
          <div className="lobby-name"> Name </div>
          <span className="lobby-players"> Players </span>
          {tables &&
            Object.keys(tables).map(table => {
              return [
                <div className="lobby-item" id={tables[table].name}>
                  {tables[table].name}
                </div>,
                <div
                  className="lobby-item"
                  id={`${tables[table].name}-players`}
                >
                  {
                    tables[table].players.filter(player => player.seated >= 0)
                      .length
                  }
                  /9
                </div>,
              ];
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
