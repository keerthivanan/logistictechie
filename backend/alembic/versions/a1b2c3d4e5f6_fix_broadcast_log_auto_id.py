"""fix_broadcast_log_auto_id

Adds a BEFORE INSERT trigger on n8n_broadcast_logs so that when n8n
inserts id=0 (its default), the DB auto-assigns a unique sequence value.
This means the n8n workflow node needs NO changes.

Revision ID: a1b2c3d4e5f6
Revises: fe3d3e683307
Create Date: 2026-03-12 16:00:00.000000
"""
from typing import Sequence, Union
from alembic import op

revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = 'fe3d3e683307'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create a dedicated sequence for broadcast log IDs
    op.execute("""
        CREATE SEQUENCE IF NOT EXISTS n8n_broadcast_logs_auto_seq
        START WITH 1000
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;
    """)

    # Create the trigger function: replaces id=0 or id=NULL with next sequence value
    op.execute("""
        CREATE OR REPLACE FUNCTION auto_broadcast_log_id()
        RETURNS TRIGGER AS $$
        BEGIN
            IF NEW.id IS NULL OR NEW.id <= 0 THEN
                NEW.id := nextval('n8n_broadcast_logs_auto_seq');
            END IF;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    """)

    # Attach trigger to the table
    op.execute("""
        DROP TRIGGER IF EXISTS auto_broadcast_log_id_trigger ON n8n_broadcast_logs;
        CREATE TRIGGER auto_broadcast_log_id_trigger
            BEFORE INSERT ON n8n_broadcast_logs
            FOR EACH ROW EXECUTE FUNCTION auto_broadcast_log_id();
    """)

    # Clean up the stale id=0 row so future inserts don't conflict
    op.execute("""
        DELETE FROM n8n_broadcast_logs WHERE id = 0;
    """)


def downgrade() -> None:
    op.execute("DROP TRIGGER IF EXISTS auto_broadcast_log_id_trigger ON n8n_broadcast_logs;")
    op.execute("DROP FUNCTION IF EXISTS auto_broadcast_log_id();")
    op.execute("DROP SEQUENCE IF EXISTS n8n_broadcast_logs_auto_seq;")
