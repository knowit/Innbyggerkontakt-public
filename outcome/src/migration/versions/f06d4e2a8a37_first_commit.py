# pylint: disable-all
"""First commit

Revision ID: f06d4e2a8a37
Revises:
Create Date: 2020-11-16 11:23:20.050673

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f06d4e2a8a37'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.execute('create schema if not exists innbyggerkontakt_outcome')

    op.create_table('bulletin',
                    sa.Column('bulletin_id', sa.String(), nullable=False),
                    sa.Column('user_id', sa.String(), nullable=False),
                    sa.Column('organization_id', sa.String(), nullable=False),
                    sa.Column('datetime_created', sa.DateTime(timezone=True), nullable=True),
                    sa.PrimaryKeyConstraint('bulletin_id'),
                    schema='innbyggerkontakt_outcome')
    op.create_table('message',
                    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
                    sa.Column('bulletin_id', sa.String(), nullable=False),
                    sa.Column('not_reserved', sa.Integer(), nullable=True),
                    sa.Column('reserved', sa.Integer(), nullable=True),
                    sa.Column('not_active', sa.Integer(), nullable=True),
                    sa.Column('deleted', sa.Integer(), nullable=True),
                    sa.Column('mails_sent', sa.Integer(), nullable=True),
                    sa.Column('datetime_created', sa.DateTime(timezone=True), nullable=True),
                    sa.Column('pubsub_id', sa.String(), nullable=False),
                    sa.ForeignKeyConstraint(['bulletin_id'], ['innbyggerkontakt_outcome.bulletin.bulletin_id'], ),
                    sa.PrimaryKeyConstraint('id'),
                    sa.UniqueConstraint('pubsub_id'),
                    schema='innbyggerkontakt_outcome')
    op.create_table('recipients',
                    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
                    sa.Column('bulletin_id', sa.String(), nullable=False),
                    sa.Column('hits', sa.Integer(), nullable=True),
                    sa.Column('datetime_created', sa.DateTime(timezone=True), nullable=True),
                    sa.Column('pubsub_id', sa.String(), nullable=False),
                    sa.ForeignKeyConstraint(['bulletin_id'], ['innbyggerkontakt_outcome.bulletin.bulletin_id'], ),
                    sa.PrimaryKeyConstraint('id'),
                    sa.UniqueConstraint('pubsub_id'),
                    schema='innbyggerkontakt_outcome')


def downgrade():
    op.drop_table('recipients', schema='innbyggerkontakt_outcome')
    op.drop_table('message', schema='innbyggerkontakt_outcome')
    op.drop_table('bulletin', schema='innbyggerkontakt_outcome')
    op.execute('drop schema if exists innbyggerkontakt_outcome')
