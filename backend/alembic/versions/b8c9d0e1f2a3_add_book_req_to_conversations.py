"""add shipper_book_req and forwarder_book_req to conversations

Revision ID: b8c9d0e1f2a3
Revises: a2b3c4d5e6f7
Create Date: 2026-03-24

"""
from alembic import op
import sqlalchemy as sa

revision = 'b8c9d0e1f2a3'
down_revision = 'a2b3c4d5e6f7'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('conversations', sa.Column('shipper_book_req', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('conversations', sa.Column('forwarder_book_req', sa.Boolean(), nullable=False, server_default='false'))


def downgrade() -> None:
    op.drop_column('conversations', 'forwarder_book_req')
    op.drop_column('conversations', 'shipper_book_req')
