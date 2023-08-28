from sqlalchemy_serializer import SerializerMixin
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, DateTime
from extensions import db

player_games = db.Table('player_games',
    db.Column('player_id', db.Integer, db.ForeignKey('players.id'), primary_key=True),
    db.Column('game_id', db.Integer, db.ForeignKey('games.id'), primary_key=True)
)

class Game(db.Model, SerializerMixin):
    __tablename__ = 'games'

    id = db.Column(db.Integer, primary_key=True)
    player1_id = db.Column(db.String(50), nullable=False)
    player2_id = db.Column(db.String(50), nullable=True)
    current_state = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), nullable=False)
    code = db.Column(db.String(10), nullable=False, unique=True)
    duration = db.Column(db.Integer, nullable=True)
    fen = db.Column(db.String(100), nullable=True)
    white_time = db.Column(db.Integer, nullable=True)
    black_time = db.Column(db.Integer, nullable=True)
    creator_color = db.Column(db.String(10), nullable=True)
    players = db.relationship('Player', secondary=player_games, lazy='subquery',
        backref=db.backref('games', lazy=True))

    moves = db.relationship('Move', backref='game', lazy=True)

    def __repr__(self):
        return f"Game('{self.player1_id}', '{self.player2_id}', '{self.status}', '{self.code}')"

class Move(db.Model, SerializerMixin):
    __tablename__ = 'moves'

    id = db.Column(db.Integer, primary_key=True)
    game_id = db.Column(db.Integer, db.ForeignKey('games.id'), nullable=False)
    move_sequence = db.Column(db.Integer, nullable=False)
    from_position = db.Column(db.String, nullable=False)
    to_position = db.Column(db.String, nullable=False)

class Player(db.Model, SerializerMixin):
    __tablename__ = 'players'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False, unique=True)
    email = db.Column(db.String(100), nullable=True, unique=True)
    total_games = db.Column(db.Integer, nullable=True)
    total_wins = db.Column(db.Integer, nullable=True)
    total_losses = db.Column(db.Integer, nullable=True)

def __repr__(self):
    return f"Player('{self.username}', '{self.email}')"

class ChatMessage(db.Model, SerializerMixin):
    __tablename__ = 'chat_messages'

    id = db.Column(db.Integer, primary_key=True)
    game_id = db.Column(db.Integer, db.ForeignKey('games.id'), nullable=False)
    player_id = db.Column(db.String(50), nullable=False)
    message = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False)

    def __repr__(self):
        return f"ChatMessage('{self.game_id}', '{self.player_id}', '{self.message}')"