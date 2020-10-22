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

import TableInfo from './TableInfo';
import Nav from './Nav';
import Lobby from './Lobby';
import CreateTable from './CreateTable';
import CreateName from './CreateName';
import CardAction from './CardAction';
import Table from './Table';
let socket;

const TablePage = props => {
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
  const [hasRedirected, setHasRedirected] = React.useState(false);
  const [toggleLobby, setToggleLobby] = React.useState(false);
  const [toggleTable, setToggleTable] = React.useState(false);
  const [toggleName, setToggleName] = React.useState(false);

  React.useEffect(() => {
    socket = io(ENDPOINT);
    addSocket(socket);
    // redirect to another existing table if user goes to /
    if (!table) {
      socket.emit('getTables', {}, tables => {
        console.log('tables: ', Object.keys(tables));
        if (Object.keys(tables).length > 0) {
          const joinTableIdx = Math.floor(
            Math.random() * Object.keys(tables).length
          );
          const redirect = tables[Object.keys(tables)[joinTableIdx]].id;
          setHasRedirected(true);
          history.push(`/?table=${redirect}`);
        }
      });
    } else {
      setHasRedirected(true);
    }
  }, []);

  React.useEffect(() => {
    if (localStorage.id && hasRedirected) {
      console.log('join from id ');
      socket.emit('join', { table, id: localStorage.id }, player =>
        setCurrPlayer(player)
      );
    } else {
      setToggleName(true);
    }
    return () => {
      // TODO: implement functional disconnect
      socket.emit('disconnect', {});
      localStorage.removeItem('id');

      socket.off();
    };
  }, [location.search]);

  React.useEffect(() => {
    socket.on('updateTable', ({ currTable }) => {
      console.log('curr:', currTable);
      updatePokerTable(currTable);
    });
  }, [socket, pokerTable]);

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
    setToggleTable(!toggleTable);
  };

  const handleToggleName = () => {
    setToggleName(!toggleName);
  };

  return (
    <div className="table-page">
      <TableInfo />
      <Lobby
        handleToggle={handleToggle}
        handleTableToggle={handleTableToggle}
        shown={toggleLobby}
      />
      <CreateName
        shown={toggleName}
        handleToggleName={handleToggleName}
        handleToggle={handleToggle}
      />
      <CreateTable handleTableToggle={handleTableToggle} shown={toggleTable} />
      <Nav handleToggle={handleToggle} />
      <Table />
      <CardAction
        thisTurn={
          pokerTable &&
          !pokerTable.disabled &&
          currPlayer &&
          pokerTable.players[pokerTable.currAction].id === currPlayer.id
        }
        enabled={pokerTable && !pokerTable.disabled}
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
