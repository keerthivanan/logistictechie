"""add f2f tables and requests.is_f2f column

Revision ID: c1d2e3f4a5b6
Revises: b8c9d0e1f2a3
Create Date: 2026-04-16

"""
from alembic import op
import sqlalchemy as sa

revision = 'c1d2e3f4a5b6'
down_revision = 'b8c9d0e1f2a3'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── requests table: F2F flag + poster identity ────────────────────────────
    op.add_column('requests', sa.Column('is_f2f', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('requests', sa.Column('posted_by_forwarder_id', sa.String(), nullable=True))
    op.create_index('idx_request_f2f', 'requests', ['is_f2f', 'posted_by_forwarder_id'])

    # ── f2f_requests ─────────────────────────────────────────────────────────
    op.create_table(
        'f2f_requests',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('public_id', sa.String(), unique=True, index=True, nullable=False),
        sa.Column('posted_by_id', sa.String(), index=True, nullable=False),
        sa.Column('posted_by_company', sa.String(), nullable=True),
        sa.Column('origin', sa.String(), nullable=False),
        sa.Column('destination', sa.String(), nullable=False),
        sa.Column('cargo_type', sa.String(), nullable=False),
        sa.Column('commodity', sa.String(), nullable=True),
        sa.Column('weight_kg', sa.Numeric(12, 2), nullable=True),
        sa.Column('container_type', sa.String(), nullable=True),
        sa.Column('incoterms', sa.String(), nullable=True),
        sa.Column('currency', sa.String(), nullable=False, server_default='USD'),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('status', sa.String(), nullable=False, server_default='OPEN', index=True),
        sa.Column('quote_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
    )
    op.create_index('idx_f2f_req_poster', 'f2f_requests', ['posted_by_id'])
    op.create_index('idx_f2f_req_status', 'f2f_requests', ['status'])

    # ── f2f_quotes ───────────────────────────────────────────────────────────
    op.create_table(
        'f2f_quotes',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('request_id', sa.Integer(), index=True, nullable=False),
        sa.Column('request_public_id', sa.String(), index=True, nullable=True),
        sa.Column('forwarder_id', sa.String(), index=True, nullable=False),
        sa.Column('company_name', sa.String(), nullable=True),
        sa.Column('price', sa.Numeric(12, 2), nullable=False),
        sa.Column('currency', sa.String(), nullable=False, server_default='USD'),
        sa.Column('transit_days', sa.Integer(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('status', sa.String(), nullable=False, server_default='PENDING', index=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
    )

    # ── f2f_conversations ────────────────────────────────────────────────────
    op.create_table(
        'f2f_conversations',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('public_id', sa.String(), unique=True, index=True, nullable=False),
        sa.Column('request_id', sa.Integer(), index=True, nullable=False),
        sa.Column('request_public_id', sa.String(), index=True, nullable=True),
        sa.Column('requester_id', sa.String(), index=True, nullable=False),
        sa.Column('quoter_id', sa.String(), index=True, nullable=False),
        sa.Column('requester_company', sa.String(), nullable=True),
        sa.Column('quoter_company', sa.String(), nullable=True),
        sa.Column('agreed_price', sa.Numeric(12, 2), nullable=True),
        sa.Column('currency', sa.String(), nullable=False, server_default='USD'),
        sa.Column('status', sa.String(), nullable=False, server_default='OPEN', index=True),
        sa.Column('requester_confirmed', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('quoter_confirmed', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('requester_last_seen', sa.DateTime(), nullable=True),
        sa.Column('quoter_last_seen', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
    )
    op.create_index('idx_f2f_conv_requester', 'f2f_conversations', ['requester_id'])
    op.create_index('idx_f2f_conv_quoter', 'f2f_conversations', ['quoter_id'])

    # ── f2f_messages ─────────────────────────────────────────────────────────
    op.create_table(
        'f2f_messages',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('conversation_id', sa.Integer(), index=True, nullable=False),
        sa.Column('sender_id', sa.String(), nullable=False),
        sa.Column('sender_role', sa.String(), nullable=False),
        sa.Column('content', sa.Text(), nullable=True),
        sa.Column('is_read', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(), index=True, nullable=True),
    )


def downgrade() -> None:
    op.drop_table('f2f_messages')
    op.drop_table('f2f_conversations')
    op.drop_table('f2f_quotes')
    op.drop_table('f2f_requests')
    op.drop_index('idx_request_f2f', table_name='requests')
    op.drop_column('requests', 'posted_by_forwarder_id')
    op.drop_column('requests', 'is_f2f')
