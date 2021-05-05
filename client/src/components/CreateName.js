import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
	setCurrPlayerAction,
	updatePokerTableAction,
} from '../actions/pokerTableActions';
import queryString from 'query-string';
import { withRouter } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const CreateName = props => {
	const {
		shown,
		handleToggleName,
		socket,
		setCurrPlayer,
		location,
		pokerTable,
		updatePokerTable,
	} = props;
	const [name, setName] = React.useState('');
	const [errors, setErrors] = React.useState([]);

	const handlePlayer = () => {
		const createErrors = [];
		if (!name.length)
			createErrors.push({ error: 'name', msg: 'Name is required ' });
		setErrors(createErrors);
		if (!createErrors.length) {
			const { table } = queryString.parse(location.search);
			const id = uuidv4();
			localStorage.setItem('id', id);
			socket.emit('join', { table, id, name }, player => {
				setCurrPlayer(player);
				if (!pokerTable) {
					socket.emit('getTable', { table }, currTable => {
						updatePokerTable(currTable);
					});
				}
			});
			handleToggleName(false);
		}
	};

	return (
		shown && (
			<div className='create-name'>
				<div className='modal-background'></div>
				<div className='create-name-content'>
					<div className='modal-title'>Create Player</div>
					<div className='input'>
						<div className='name-errors'>
							{errors.map(error => {
								return <p key='err'>{error.msg}</p>;
							})}
						</div>
						<div>
							Name <span className='red'>*</span>
						</div>
						<input
							type='text'
							className='table-name-input'
							onChange={e => setName(e.target.value)}
						/>
					</div>
					<div
						onClick={handlePlayer}
						className='create-table create-modal-button'
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
		pokerTable: state.pokerTable,
	};
};

const mapDispatchToProps = dispatch => {
	return bindActionCreators(
		{
			setCurrPlayer: setCurrPlayerAction,
			updatePokerTable: updatePokerTableAction,
		},
		dispatch
	);
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(withRouter(CreateName));
