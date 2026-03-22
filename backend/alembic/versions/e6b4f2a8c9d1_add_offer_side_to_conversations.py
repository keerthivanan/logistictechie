"""add offer_side to conversations

Revision ID: e6b4f2a8c9d1
Revises: d5a7e3c1f8b2
Create Date: 2026-03-20

"""
from alembic import op
import sqlalchemy as sa

revision = 'e6b4f2a8c9d1'
down_revision = 'd5a7e3c1f8b2'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # SHIPPER = shipper made current pending offer, waiting for forwarder
    # FORWARDER = forwarder countered, waiting for shipper
    # NULL = no pending offer
    op.add_column('conversations', sa.Column('offer_side', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('conversations', 'offer_side')
