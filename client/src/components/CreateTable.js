import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { makeid } from '../utils/utils';
import queryString from 'query-string';

const CreateTable = props => {
	const { shown, handleTableToggle, location, history, socket } = props;
	const [tableName, setTableName] = React.useState('');
	// const [password, setPassword] = React.useState('');
	// const [passwordShown, setPasswordShown] = React.useState(false);
	const [errors, setErrors] = React.useState([]);
	// const handlePasswordShown = () => setPasswordShown(!passwordShown);
	const { table: leaveTable } = queryString.parse(location.search);

	React.useEffect(() => {
		setErrors([]);
	}, [shown]);

	const handleCreate = () => {
		const createErrors = [];
		if (!tableName.length)
			createErrors.push({ error: 'name', msg: 'Name is required' });
		// if (passwordShown && !password.length)
		// 	createErrors.push({
		// 		error: 'password',
		// 		msg: 'Password is required for private game',
		// 	});
		setErrors(createErrors);
		if (!createErrors.length) {
			const table = makeid(4);
			socket.emit('addTable', { table, leaveTable, name: tableName }, () => {
				history.push(`/?table=${table}`);
				handleTableToggle();
			});
		}
	};

	return (
		shown && (
			<div className='create-table-container'>
				<div onClick={handleTableToggle} className='create-background'></div>
				<div className='create-content'>
					<div className='modal-title create-title'>
						Create Table
						<div className='lobby-close' onClick={handleTableToggle}>
							x
						</div>
					</div>
					<div className='errors'>
						{errors.map(error => {
							return <p>{error.msg}</p>;
						})}
					</div>
					<div className='input'>
						<div>
							Table Name<span className='red'>*</span>:
						</div>
						<input
							className='table-name-input'
							type='text'
							value={tableName}
							onChange={e => setTableName(e.target.value)}
						/>
						{/* <div className="private-game">
              <label htmlFor="">Private game </label>
              <input type="checkbox" onChange={handlePasswordShown} />
            </div>
            {passwordShown && (
              <div className="private">
                Password <span className="red">*</span>:
                <input
                  className="password-input"
                  type="text"
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            )} */}
						<div
							onClick={handleCreate}
							className='create-table create-modal-button'
						>
							CREATE
						</div>
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
export default connect(mapStateToProps, null)(withRouter(CreateTable));
