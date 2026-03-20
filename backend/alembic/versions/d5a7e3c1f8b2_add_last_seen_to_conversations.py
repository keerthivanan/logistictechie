"""add last_seen fields to conversations

Revision ID: d5a7e3c1f8b2
Revises: c4f9a2b6e1d3
Create Date: 2026-03-20

"""
from alembic import op
import sqlalchemy as sa

revision = 'd5a7e3c1f8b2'
down_revision = 'c4f9a2b6e1d3'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('conversations', sa.Column('shipper_last_seen', sa.DateTime(), nullable=True))
    op.add_column('conversations', sa.Column('forwarder_last_seen', sa.DateTime(), nullable=True))


def downgrade() -> None:
    op.drop_column('conversations', 'forwarder_last_seen')
    op.drop_column('conversations', 'shipper_last_seen')
