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

import Nav from './Nav';
import Lobby from './Lobby';
import CreateTable from './CreateTable';

import CardAction from './CardAction';
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
    history,
  } = props;
  const ENDPOINT = 'localhost:5000';
  const { table } = queryString.parse(location.search);
  const [toggleLobby, setToggleLobby] = React.useState(false);
  const [toggleTable, setToggleTable] = React.useState(false);

  const makeid = length => {
    var result = '';
    var characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };

  React.useEffect(() => {
    let id;
    if (localStorage.id) id = localStorage.id;
    else {
      id = uuidv4();
      localStorage.setItem('id', id);
    }
    socket = io(ENDPOINT);
    addSocket(socket);
    socket.emit('join', { table, id }, player => setCurrPlayer(player));
    if (!table) {
      socket.emit('getTables', {}, tables => {
        if (Object.keys(tables).length > 0) {
          const joinTableIdx = Math.floor(
            Math.random() * Object.keys(tables).length
          );
          const redirect = tables[Object.keys(tables)[joinTableIdx]].id;
          history.push(`/?table=${redirect}`);
        } else {
          history.push(`/?table=${makeid(4)}`);
        }
      });
    }

    return () => {
      // TODO: implement functional disconnect
      socket.emit('disconnect', { table, id: localStorage.id });
      socket.off();
    };
  }, [location.search]);

  React.useEffect(() => {
    socket.on('updateTable', ({ currTable }) => {
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

  const handleToggle = () => {
    setToggleLobby(!toggleLobby);
  };

  const handleTableToggle = () => {
    setToggleLobby(!toggleLobby);
    setToggleTable(!toggleTable);
  };

  return (
    <div className="table-page">
      <Lobby
        handleToggle={handleToggle}
        handleTableToggle={handleTableToggle}
        shown={toggleLobby}
      />
      <CreateTable handleTableToggle={handleTableToggle} shown={toggleTable} />
      <Nav handleToggle={handleToggle} />
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
