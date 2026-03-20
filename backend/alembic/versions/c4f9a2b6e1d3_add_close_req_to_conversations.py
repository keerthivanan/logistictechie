"""add close_req fields to conversations

Revision ID: c4f9a2b6e1d3
Revises: b3e8f1c5d2a9
Create Date: 2026-03-20

"""
from alembic import op
import sqlalchemy as sa

revision = 'c4f9a2b6e1d3'
down_revision = 'b3e8f1c5d2a9'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        'conversations',
        sa.Column('shipper_close_req', sa.Boolean(), nullable=False, server_default='false')
    )
    op.add_column(
        'conversations',
        sa.Column('forwarder_close_req', sa.Boolean(), nullable=False, server_default='false')
    )


def downgrade() -> None:
    op.drop_column('conversations', 'forwarder_close_req')
    op.drop_column('conversations', 'shipper_close_req')
