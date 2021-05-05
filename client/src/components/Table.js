import React from 'react';
import { connect } from 'react-redux';

import Player from './Player';
import Chips from './Chips';
import CommunityCards from './CommunityCards';

// converting between seat number and player className
const playerSeatMap = {
	0: 0,
	1: 1,
	2: 8,
	3: 2,
	4: 7,
	5: 3,
	6: 6,
	7: 4,
	8: 5,
};

const Table = props => {
	const { pokerTable } = props;
	const [seats, setSeats] = React.useState([]);
	const [waiting, setWaiting] = React.useState('');

	React.useEffect(() => {
		if (pokerTable) {
			setSeats(Object.keys(pokerTable.playerPositions));
			if (pokerTable.players.length < 2) {
				setWaiting('Waiting for players...');
			} else {
				setWaiting('');
			}
		}
	}, [pokerTable]);

	const formatName = (name, length) => {
		return name.length > length ? name.substring(0, length + 1) + '...' : name;
	};

	const findWinner = () => {
		let result = '';
		if (pokerTable && pokerTable.winner.length) {
			const winners = pokerTable.winner;
			if (winners.length === 1) {
				const name = winners[0].name;
				result += formatName(name, 20);
				result += winners[0].cardRank ? ' won with a ' : ' won!';
				const cardRank =
					winners[0].cardRank &&
					winners[0].cardRank
						.toLowerCase()
						.split('_')
						.map(s => s.charAt(0).toUpperCase() + s.slice(1))
						.join(' ');
				result += cardRank ? cardRank : '';
			} else {
				winners.slice(0, winners.length - 1).forEach(player => {
					result += formatName(player.name, 10) + ', ';
				});
				result +=
					'and ' +
					formatName(winners[winners.length - 1].name, 10) +
					' split the pot!';
			}
		}
		return result;
	};

	const createSeats = seats => {
		const seatComponents = [];
		for (var i = 0; i < 8 / 2; i++) {
			seatComponents.push(
				<div className={`seat-container seat-container-${i}`} key={`seat-${i}`}>
					<Player seatNumber={playerSeatMap[i * 2]} key={`player-${i * 2}`} />
					<Player
						seatNumber={playerSeatMap[i * 2 + 1]}
						key={`player-${i * 2 + 1}`}
					/>
				</div>
			);
		}
		seatComponents.push(
			<div className='seat-container seat-container-4' key='seat-9'>
				<Player seatNumber={playerSeatMap[8]} key='player-8' />
			</div>
		);
		return seatComponents;
	};
	return (
		<div>
			<div className='table-container'>
				{seats.forEach(position => {
					if (pokerTable) {
						const playerId = pokerTable.playerPositions[position];
						const player = pokerTable.players.find(p => p.id === playerId);
						return (
							player && (
								<Chips
									key={`chips-${player.id}`}
									value={player.playedChips}
									position={player.seated}
								/>
							)
						);
					}
				})}
				<div className='seat-outer-container'>
					<div className='table'>
						<div className='table-middle'>
							<div className='waiting'>{waiting}</div>
							<div className='winner-container'>
								{findWinner()}
								<div className='pot-container'>
									<Chips value={pokerTable && pokerTable.chips} />
								</div>
							</div>

							<CommunityCards />
						</div>
					</div>
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
