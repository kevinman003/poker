import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  updatePokerTableAction,
  addSocketAction,
  setCurrPlayerAction,
  addHoleCardsAction,
  sitPlayerAction,
} from '../actions/pokerTableActions';

import queryString from 'query-string';
import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

import Lobby from './Lobby';
import CardAction from './CardAction';
import Nav from './Nav';
import Table from './Table';
let socket;

const TablePage = props => {
  // const [pokerTable, setPokerTable] = useState();
  const {
    pokerTable,
    addSocket,
    updatePokerTable,
    currPlayer,
    setCurrPlayer,
    addHoleCards,
    sitPlayer,
    location,
  } = props;
  const ENDPOINT = 'localhost:5000';
  const { table } = queryString.parse(location.search);
  const [modal, setModal] = React.useState(false);
  const [allTables, setAllTables] = React.useState();

  React.useEffect(() => {
    let id;
    if (localStorage.id) id = localStorage.id;
    else {
      id = uuidv4();
      localStorage.setItem('id', id);
    }
    socket = io(ENDPOINT);
    addSocket(socket);
    socket.emit('join', { table, id }, (player, tables) => {
      setCurrPlayer(player);
      setAllTables(tables);
    });

    return () => {
      // TODO: implement functional disconnect
      socket.emit('disconnect', { table, id: localStorage.id });
      socket.off();
    };
  }, [location.search]);

  React.useEffect(() => {
    socket.on('updateTable', ({ currTable }) => {
      console.log('curr:', currTable);
      updatePokerTable(currTable);
    });
  }, [pokerTable]);

  React.useEffect(() => {
    socket.on('dealCards', ({ currTable }) => {
      if (currPlayer) {
        const player = currTable.players.find(
          player => player.id === currPlayer.id
        );
        addHoleCards(player.holeCards);
      }
    });

    socket.on('sit', ({ seatNumber, id }) => {
      if (currPlayer && currPlayer.id === id) sitPlayer(seatNumber);
    });
  }, [currPlayer]);

  const toggleModal = () => {
    setModal(!modal);
  };

  return (
    <div className="table-page">
      <Lobby tables={allTables} shown={modal} toggleModal={toggleModal} />
      <Nav toggleModal={toggleModal} />
      <Table />
      <CardAction
        thisTurn={
          pokerTable &&
          currPlayer &&
          pokerTable.players[pokerTable.currAction].id === currPlayer.id
        }
        enabled={pokerTable && pokerTable.isStarted}
        table={table}
      />
    </div>
  );
};

const mapStateToProps = state => {
  return {
    pokerTable: state.pokerTable,
    currPlayer: state.currPlayer,
  };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    {
      updatePokerTable: updatePokerTableAction,
      addSocket: addSocketAction,
      setCurrPlayer: setCurrPlayerAction,
      addHoleCards: addHoleCardsAction,
      sitPlayer: sitPlayerAction,
    },
    dispatch
  );
};
export default connect(mapStateToProps, mapDispatchToProps)(TablePage);
