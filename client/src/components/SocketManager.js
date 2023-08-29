import io from 'socket.io-client';

const socket = io('http://localhost:5555');

function joinGame(gameCode, playerId) {
    socket.emit('join_game', { game_code: gameCode, player_id: playerId });
}

function sendMove(gameCode, fromPosition, toPosition) {
    socket.emit('move_made', { game_code: gameCode, from_position: fromPosition, to_position: toPosition });
}

function onMoveReceived(callback) {
    socket.on('move_broadcast', callback);
}

function onPlayerJoined(callback) {
    socket.on('player_joined', callback);
}

export { joinGame, sendMove, onMoveReceived, onPlayerJoined };