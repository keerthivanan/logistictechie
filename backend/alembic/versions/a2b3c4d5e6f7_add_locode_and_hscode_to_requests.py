"""add locode and hscode to requests

Revision ID: a2b3c4d5e6f7
Revises: f1a2b3c4d5e6
Create Date: 2026-03-21

"""
from alembic import op
import sqlalchemy as sa

revision = 'a2b3c4d5e6f7'
down_revision = 'f1a2b3c4d5e6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('requests', sa.Column('origin_locode', sa.String(), nullable=True))
    op.add_column('requests', sa.Column('destination_locode', sa.String(), nullable=True))
    op.add_column('requests', sa.Column('hs_code', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('requests', 'hs_code')
    op.drop_column('requests', 'destination_locode')
    op.drop_column('requests', 'origin_locode')
