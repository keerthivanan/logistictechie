"""add_conversations_chat_messages

Revision ID: a9f3c1d2e4b7
Revises: 775f663c0b94
Create Date: 2026-03-20 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'a9f3c1d2e4b7'
down_revision: Union[str, None] = '775f663c0b94'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'conversations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('public_id', sa.String(), nullable=True),
        sa.Column('request_id', sa.String(), nullable=True),
        sa.Column('quote_id', sa.String(), nullable=True),
        sa.Column('shipper_id', sa.String(), nullable=True),
        sa.Column('forwarder_id', sa.String(), nullable=True),
        sa.Column('forwarder_company', sa.String(), nullable=True),
        sa.Column('original_price', sa.Numeric(12, 2), nullable=True),
        sa.Column('currency', sa.String(), nullable=True),
        sa.Column('current_offer', sa.Numeric(12, 2), nullable=True),
        sa.Column('agreed_price', sa.Numeric(12, 2), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('booking_id', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['quote_id'], ['quotations.quotation_id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['request_id'], ['requests.request_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('public_id')
    )
    op.create_index('idx_conv_forwarder', 'conversations', ['forwarder_id'])
    op.create_index('idx_conv_quote', 'conversations', ['quote_id'])
    op.create_index('idx_conv_shipper', 'conversations', ['shipper_id'])
    op.create_index(op.f('ix_conversations_id'), 'conversations', ['id'])
    op.create_index(op.f('ix_conversations_public_id'), 'conversations', ['public_id'])
    op.create_index(op.f('ix_conversations_status'), 'conversations', ['status'])

    op.create_table(
        'chat_messages',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('conversation_id', sa.Integer(), nullable=True),
        sa.Column('sender_role', sa.String(), nullable=True),
        sa.Column('sender_id', sa.String(), nullable=True),
        sa.Column('message_type', sa.String(), nullable=True),
        sa.Column('content', sa.String(), nullable=True),
        sa.Column('offer_amount', sa.Numeric(12, 2), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['conversation_id'], ['conversations.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_chat_messages_conversation_id'), 'chat_messages', ['conversation_id'])
    op.create_index(op.f('ix_chat_messages_created_at'), 'chat_messages', ['created_at'])
    op.create_index(op.f('ix_chat_messages_id'), 'chat_messages', ['id'])


def downgrade() -> None:
    op.drop_index(op.f('ix_chat_messages_id'), table_name='chat_messages')
    op.drop_index(op.f('ix_chat_messages_created_at'), table_name='chat_messages')
    op.drop_index(op.f('ix_chat_messages_conversation_id'), table_name='chat_messages')
    op.drop_table('chat_messages')

    op.drop_index(op.f('ix_conversations_status'), table_name='conversations')
    op.drop_index(op.f('ix_conversations_public_id'), table_name='conversations')
    op.drop_index(op.f('ix_conversations_id'), table_name='conversations')
    op.drop_index('idx_conv_shipper', table_name='conversations')
    op.drop_index('idx_conv_quote', table_name='conversations')
    op.drop_index('idx_conv_forwarder', table_name='conversations')
    op.drop_table('conversations')
