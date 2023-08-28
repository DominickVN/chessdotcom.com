from flask import request, make_response, Flask
from extensions import db
from models import Game, Move, Player, ChatMessage
import string
import random
import subprocess
from flask_socketio import SocketIO, emit, join_room
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from config import metadata, SQLALCHEMY_DATABASE_URI, SQLALCHEMY_TRACK_MODIFICATIONS

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = SQLALCHEMY_DATABASE_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = SQLALCHEMY_TRACK_MODIFICATIONS
db.init_app(app)
socketio = SocketIO(app, cors_allowed_origins="*")
migrate = Migrate(app, db)



stockfish_path = "stockfish"
stockfish = subprocess.Popen(
    stockfish_path,
    universal_newlines=True,
    stdin=subprocess.PIPE,
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE
)

def send_command(stockfish, cmd):
    stockfish.stdin.write(cmd + '\n')
    stockfish.stdin.flush()

def get_stockfish_output(stockfish):
    output = ''
    while True:
        line = stockfish.stdout.readline().strip()
        if line == '':
            break
        output += line + '\n'
    return output

send_command(stockfish, "uci")
send_command(stockfish, "setoption name Threads value 2")



@app.route('/')
def index():
    return '<h1>Chess Game Server</h1>'

@app.route('/games', methods=['GET', 'POST'])
def games():
    if request.method == 'POST':
        player1_id = request.json.get('player1_id')
        creator_color = request.json.get('creator_color', 'white')
        duration = request.json.get('duration')
        game_code = generate_game_code()  
        
        game = Game(player1_id=player1_id, code=game_code, duration=duration, status='waiting', creator_color=creator_color)
        
        db.session.add(game)
        db.session.commit()
        return make_response({"game": game.to_dict()}, 201)
    
@app.route('/games/<int:game_id>', methods=['GET', 'PUT'])
def game_detail(game_id):
    game = Game.query.get(game_id)
    if not game:
        return make_response({"error": "Game not found"}, 404)

    if request.method == 'PUT':
        fen = request.json.get('fen')
        white_time = request.json.get('white_time')
        black_time = request.json.get('black_time')
        
        if fen is None or white_time is None or black_time is None:
            return make_response({"error": "Missing required fields"}, 400)
        
        creator_color = request.json.get('creator_color')
        if creator_color:
            game.creator_color = creator_color

        game.fen = fen
        game.white_time = white_time
        game.black_time = black_time
        db.session.commit()

    moves = Move.query.filter_by(game_id=game_id).all()
    return make_response({
        "game": game.to_dict(),
        "moves": [move.to_dict() for move in moves]
    }, 200)

@app.route('/games/<int:game_id>/move', methods=['POST'])
def make_move(game_id):
    game = Game.query.get(game_id)
    if not game:
        return make_response({"error": "Game not found"}, 404)

    from_position = request.json.get('from_position')
    to_position = request.json.get('to_position')
    
    move = Move(game_id=game_id, from_position=from_position, to_position=to_position, move_sequence=len(game.moves)+1)
    db.session.add(move)
    db.session.commit()
    return make_response({"move": move.to_dict()}, 201)


@app.route('/games/code/<string:game_code>', methods=['GET'])
def get_game_by_code(game_code):
    game = Game.query.filter_by(code=game_code).first()
    if not game:
        return make_response({"error": "Game not found"}, 404)
    return make_response({"game": game.to_dict()}, 200)

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('join_game')
def on_join(data):
    game_code = data['game_code']
    player_id = data['player_id']
    game = Game.query.filter_by(code=game_code).first()

    if game:
        join_room(game_code)
        
        player = Player.query.get(player_id)
        if player is None:
            player = Player(id=player_id)
            db.session.add(player)
        
        game.players.append(player)
        
        if not game.player2_id:
            game.player2_id = player_id
            game.status = 'in_progress'
        
        db.session.commit()

        emit('player_joined', {'player_id': player_id}, room=game_code)
    else:
        emit('error', {'message': 'Game not found'}, room=request.sid)

@socketio.on('move_made')
def on_move(data):
    game_code = data['game_code']
    from_position = data['from_position']
    to_position = data['to_position']

    game = Game.query.filter_by(code=game_code).first()
    if game:
        move = Move(game_id=game.id, from_position=from_position, to_position=to_position)
        db.session.add(move)
        db.session.commit()
        emit('move_broadcast', {'from_position': from_position, 'to_position': to_position}, room=game_code)

def generate_game_code(size=6, chars=string.ascii_uppercase + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    socketio.run(app, port=5555, debug=True)