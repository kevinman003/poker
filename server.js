const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const socketio = require('socket.io');
const http = require('http');

const routes = require('./routes');
const { join } = require('./socket');
const Card = require('./controllers/Card');
const Player = require('./controllers/Player');

const app = express();
const server = http.createServer(app);
const io = socketio(server);


// Socket connections
io.on('connection', socket => {
  console.log('New connection');
  socket.on('join', ({ table, id }, callback) => {
    join(socket, table, id, callback);    
  });
  socket.on('disconnect', () => {
    console.log('User left'); 
  })
});
// const table = 'abc';
// tableRooms.createTable(table);
// const cards = [];
// cards.push(new Card(3, 's'));
// cards.push(new Card(3, 's'));
// cards.push(new Card(8, 's'));
// cards.push(new Card(7, 'd'));
// cards.push(new Card(4, 'd'));
// const player1 = new Player('lmao');
// player1.addCards([new Card(8, 'h'), new Card(8, 'h')]);
// const player2 = new Player('xd');
// player2.addCards([new Card(7, 's'), new Card(7, 'h')]);
// tableRooms.tables.abc.addCards(cards);
// tableRooms.tables.abc.addPlayer(player1);
// tableRooms.tables.abc.addPlayer(player2);
// const winner = tableRooms.tables.abc.findWinner();
// // console.log('WINNER: ', winner);
// tableRooms.tables.abc.dealFlop();


// Middleware 
app.use(routes);

app.use(cors());

app.use(bodyParser.urlencoded({extended: true}));

app.use(bodyParser.json());

// Starting server 
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

