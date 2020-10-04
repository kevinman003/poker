import React from 'react';
import { connect } from 'react-redux';

import CreateTable from './CreateTable';

const Lobby = props => {
  const { shown, handleToggle, handleTableToggle, socket } = props;
  const [tables, setTables] = React.useState();
  const [createShown, setCreateShown] = React.useState(false);
  React.useEffect(() => {
    socket &&
      socket.emit('getTables', {}, tables => {
        setTables(tables);
      });
  }, [shown]);

  const handleCreateTable = () => {
    handleToggle();
    handleTableToggle();
  };

  return (
    <div>
      {shown ? (
        <div className="lobby">
          <div className="modal-background" onClick={handleToggle}></div>
          <div className="modal-content">
            <div className="modal-title">
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
                        tables[table].players.filter(
                          player => player.seated >= 0
                        ).length
                      }
                      /9
                    </div>,
                  ];
                })}
            </div>
            <div onClick={handleCreateTable} className="create-table">
              + Create Table
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const mapStateToProps = state => {
  return {
    socket: state.socket,
  };
};

export default connect(mapStateToProps, null)(Lobby);
