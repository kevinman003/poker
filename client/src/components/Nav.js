import React from 'react';

const Nav = props => {
	const { handleToggle } = props;

	return (
		<div className='nav'>
			<div className='lobby-button' onClick={handleToggle}>
				LOBBY
			</div>
		</div>
	);
};

export default Nav;
