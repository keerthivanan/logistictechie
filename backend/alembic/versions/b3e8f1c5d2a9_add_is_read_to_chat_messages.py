"""add is_read to chat_messages

Revision ID: b3e8f1c5d2a9
Revises: a9f3c1d2e4b7
Create Date: 2026-03-20

"""
from alembic import op
import sqlalchemy as sa

revision = 'b3e8f1c5d2a9'
down_revision = 'a9f3c1d2e4b7'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        'chat_messages',
        sa.Column('is_read', sa.Boolean(), nullable=False, server_default='false')
    )
    op.create_index(
        'idx_msg_unread',
        'chat_messages',
        ['conversation_id', 'is_read', 'sender_id']
    )


def downgrade() -> None:
    op.drop_index('idx_msg_unread', table_name='chat_messages')
    op.drop_column('chat_messages', 'is_read')
