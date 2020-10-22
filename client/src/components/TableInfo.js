import React from 'react';
import { connect } from 'react-redux';

const TableInfo = props => {
  const { pokerTable } = props;

  const playerInfo = () => {
    let result = '';
    if (pokerTable) {
      console.log(pokerTable.players);
      const numPlayers = pokerTable.players.filter(player => player.seated >= 0)
        .length;
      result += numPlayers;
      result += numPlayers === 1 ? ' player' : ' players';
    }
    return result;
  };

  return (
    <div className="table-info">
      <div className="table-name">{pokerTable && pokerTable.name}</div>
      <div className="table-info-players">{playerInfo()}</div>
    </div>
  );
};

const mapStateToProps = state => {
  return {
    pokerTable: state.pokerTable,
  };
};

export default connect(mapStateToProps, null)(TableInfo);
