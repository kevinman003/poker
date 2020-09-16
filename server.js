const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const socketio = require('socket.io');
const http = require('http');

const routes = require('./routes');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const socketConnection = require('./socket');

socketConnection(io);

// Middleware
app.use(routes);

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

// const { addTable, getTable } = require('./controllers/TableRooms');
// const Card = require('./controllers/Card');
// const Player = require('./controllers/Player');
// const table = 'abc';
// addTable(table);
// const cards = [];
// cards.push(new Card(1, 'h'));
// cards.push(new Card(3, 'c'));
// cards.push(new Card(4, 'd'));
// cards.push(new Card(5, 'h'));
// cards.push(new Card(6, 's'));
// const player1 = new Player('lmao');
// player1.addCards([new Card(13, 'h'), new Card(14, 's')]);
// const player2 = new Player('xd');
// player2.addCards([new Card(13, 's'), new Card(15, 's')]);
// getTable('abc').addCards(cards);
// getTable('abc').addPlayer(player1);
// getTable('abc').addPlayer(player2);
// const winner = getTable('abc').findWinner();
// console.log('WINNER: ', winner);

// Starting server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
