import React from 'react';
import { connect } from 'react-redux';
import queryString from 'query-string';
import { withRouter } from 'react-router-dom';

const Lobby = props => {
	const {
		currPlayer,
		shown,
		handleToggle,
		handleTableToggle,
		socket,
		location,
		history,
	} = props;
	const [tables, setTables] = React.useState();
	const { table } = queryString.parse(location.search);

	React.useEffect(() => {
		socket &&
			socket.emit('getTables', {}, tables => {
				setTables(tables);
			});
	}, [socket, shown]);

	const handleCreateTable = () => {
		handleToggle();
		handleTableToggle();
	};

	const handleLobby = e => {
		socket.emit('joinTable', {
			table: e.target.id,
			leaveTable: table,
			currPlayer,
		});
		history.push(`/?table=${e.target.id}`);
		handleToggle();
	};

	return (
		<div>
			{shown ? (
				<div className='lobby'>
					<div className='modal-background' onClick={handleToggle}></div>
					<div className='modal-content'>
						<div className='modal-title'>
							Lobby
							<div className='lobby-close' onClick={handleToggle}>
								x
							</div>
						</div>

						<div className='lobby-info'>
							<div className='lobby-name'> Name </div>
							<span className='lobby-players'> Players </span>
							{tables &&
								Object.keys(tables).map(table => {
									return [
										<div
											className='lobby-item'
											id={tables[table].id}
											onClick={handleLobby}
											key={tables[table].name}
										>
											{tables[table].name}
										</div>,
										<div
											onClick={handleLobby}
											id={tables[table].id}
											className='lobby-item'
											key={`${tables[table].name}-players`}
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
						<div onClick={handleCreateTable} className='create-table'>
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
		currPlayer: state.currPlayer,
	};
};

export default connect(mapStateToProps, null)(withRouter(Lobby));
