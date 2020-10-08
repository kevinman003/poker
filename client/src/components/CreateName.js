import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setCurrPlayerAction } from '../actions/pokerTableActions';
import queryString from 'query-string';
import { withRouter } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const CreateName = props => {
  const { shown, handleToggleName, socket, setCurrPlayer, location } = props;
  const [name, setName] = React.useState('');

  const handlePlayer = () => {
    const { table } = queryString.parse(location.search);
    const id = uuidv4();
    localStorage.setItem('id', id);
    console.log('name join');
    socket.emit('join', { table, id, name }, player => setCurrPlayer(player));
    handleToggleName(false);
  };

  return (
    shown && (
      <div className="create-name">
        <div className="modal-background"></div>
        <div className="create-name-content">
          <div className="modal-title">Create Player</div>
          <div className="input">
            <div>Name</div>
            <input
              type="text"
              className="table-name-input"
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div
            onClick={handlePlayer}
            className="create-table create-modal-button"
          >
            GO
          </div>
        </div>
      </div>
    )
  );
};

const mapStateToProps = state => {
  return {
    socket: state.socket,
  };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    {
      setCurrPlayer: setCurrPlayerAction,
    },
    dispatch
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(CreateName));
