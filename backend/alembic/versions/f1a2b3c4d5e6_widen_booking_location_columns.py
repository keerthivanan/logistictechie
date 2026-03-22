"""widen booking location and container columns

Revision ID: f1a2b3c4d5e6
Revises: e6b4f2a8c9d1
Create Date: 2026-03-21

origin_locode/destination_locode were VARCHAR(20) — too short for full city names
like "Rotterdam, Netherlands" (23 chars). Widen to 500 to match MarketplaceRequest.origin.
container_type widened from 20 to 100 for safety.
"""
from alembic import op
import sqlalchemy as sa

revision = 'f1a2b3c4d5e6'
down_revision = 'e6b4f2a8c9d1'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column('bookings', 'origin_locode',
                    existing_type=sa.String(length=20),
                    type_=sa.String(length=500),
                    existing_nullable=False)
    op.alter_column('bookings', 'destination_locode',
                    existing_type=sa.String(length=20),
                    type_=sa.String(length=500),
                    existing_nullable=False)
    op.alter_column('bookings', 'container_type',
                    existing_type=sa.String(length=20),
                    type_=sa.String(length=100),
                    existing_nullable=False)


def downgrade() -> None:
    op.alter_column('bookings', 'container_type',
                    existing_type=sa.String(length=100),
                    type_=sa.String(length=20),
                    existing_nullable=False)
    op.alter_column('bookings', 'destination_locode',
                    existing_type=sa.String(length=500),
                    type_=sa.String(length=20),
                    existing_nullable=False)
    op.alter_column('bookings', 'origin_locode',
                    existing_type=sa.String(length=500),
                    type_=sa.String(length=20),
                    existing_nullable=False)
