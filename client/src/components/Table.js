import React from 'react';
import { connect } from 'react-redux';

import Player from './Player';
import Chips from './Chips';
import CommunityCards from './CommunityCards';

import { currPlayerReducer } from '../reducers/pokerTableReducer';

const Table = props => {
  const { pokerTable, currPlayer } = props;
  const [seats, setSeats] = React.useState([]);
  const [selectedPlayer, setSelectedPlayer] = React.useState(null);

  React.useEffect(() => {
    if (pokerTable) {
      const player = pokerTable.players.find(
        player => player.id === currPlayer.id
      );
      setSelectedPlayer(player);
    }
  }, [pokerTable]);

  React.useEffect(() => {
    if (pokerTable) {
      setSeats(Object.keys(pokerTable.playerPositions));
    }
  }, [pokerTable]);

  const findWinner = () => {
    let result;
    if (pokerTable && pokerTable.winner) {
      const name = pokerTable.winner.name;
      if (name.length > 20) {
        result = name.substring(0, 21) + '...';
      } else result = name;
      result += `with a ${pokerTable.winner.cardRank}`;
    }
    return result;
  };

  const createSeats = seats => {
    const seatComponents = [];
    for (var i = 0; i < 8 / 2; i++) {
      seatComponents.push(
        <div className={`seat-container seat-container-${i}`} key={`seat-${i}`}>
          <Player seatNumber={i * 2} key={`player-${i * 2}`} />
          <Player seatNumber={i * 2 + 1} key={`player-${i * 2 + 1}`} />
        </div>
      );
    }
    seatComponents.push(
      <div className="seat-container seat-container-4" key="seat-9">
        <Player seatNumber={9} key="player-9" />
      </div>
    );
    return seatComponents;
  };
  return (
    <div>
      <div className="table-container">
        {seats.map(position => {
          if (pokerTable) {
            const playerId = pokerTable.playerPositions[position];
            const player = pokerTable.players.find(p => p.id === playerId);
            return (
              <Chips value={player.playedChips} position={player.seated} />
            );
          }
        })}
        <div className="seat-outer-container">
          <div className="table">
            <div className="table-middle">
              <div className="winner-container">
                {findWinner()}
                <div className="pot-container">
                  <Chips value={pokerTable && pokerTable.chips} />
                </div>
              </div>

              <CommunityCards />
            </div>
          </div>
          {/* <Player seatNumber={0} /> */}
          {createSeats(9)}
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = state => {
  return {
    pokerTable: state.pokerTable,
    currPlayer: state.currPlayer,
  };
};
export default connect(mapStateToProps, null)(Table);
