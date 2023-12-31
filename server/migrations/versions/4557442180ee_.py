"""empty message

Revision ID: 4557442180ee
Revises: 81e501570d58
Create Date: 2023-08-24 20:51:00.753165

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '4557442180ee'
down_revision = '81e501570d58'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('player_games',
    sa.Column('player_id', sa.Integer(), nullable=False),
    sa.Column('game_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['game_id'], ['games.id'], name=op.f('fk_player_games_game_id_games')),
    sa.ForeignKeyConstraint(['player_id'], ['players.id'], name=op.f('fk_player_games_player_id_players')),
    sa.PrimaryKeyConstraint('player_id', 'game_id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('player_games')
    # ### end Alembic commands ###
