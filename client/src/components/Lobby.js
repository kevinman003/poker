import React from 'react';

const Lobby = props => {
  const { shown, handleToggle, tables } = props;

  return (
    shown && (
      <div className="lobby">
        <div className="lobby-background" onClick={toggleModal}></div>
        <div className="lobby-modal">
          <div className="lobby-title"> Lobby </div>
          <div className="lobby-info">
            <div className="lobby-name"> Name </div>
            <div className="lobby-players"> Players </div>
            {/* {tables &&
              Object.keys(tables).forEach(table => {
                return [
                  <div className="lobby-item"> {table.name} </div>,
                  <div className="lobby-item">
                    {
                      tables[table].players.filter(player => player.seated >= 0)
                        .length
                    }
                    /9
                  </div>,
                ];
              })} */}
          </div>
        </div>
      </div>
    )
  );
};

export default Lobby;
