"""Add is_indexed to notes, pdfs, and links

Revision ID: 0003
Revises: 0002
Create Date: 2026-05-08
"""
from alembic import op
import sqlalchemy as sa

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("notes", sa.Column("is_indexed", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column("pdfs", sa.Column("is_indexed", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column("links", sa.Column("is_indexed", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.execute(
        """
        UPDATE notes
        SET is_indexed = TRUE
        WHERE EXISTS (
            SELECT 1
            FROM document_chunks
            WHERE document_chunks.resource_type = 'note'
              AND document_chunks.resource_id = notes.id
              AND document_chunks.workspace_id = notes.workspace_id
        )
        """
    )
    op.execute(
        """
        UPDATE pdfs
        SET is_indexed = TRUE
        WHERE EXISTS (
            SELECT 1
            FROM document_chunks
            WHERE document_chunks.resource_type = 'pdf'
              AND document_chunks.resource_id = pdfs.id
              AND document_chunks.workspace_id = pdfs.workspace_id
        )
        """
    )
    op.execute(
        """
        UPDATE links
        SET is_indexed = TRUE
        WHERE EXISTS (
            SELECT 1
            FROM document_chunks
            WHERE document_chunks.resource_type = 'link'
              AND document_chunks.resource_id = links.id
              AND document_chunks.workspace_id = links.workspace_id
        )
        """
    )


def downgrade() -> None:
    op.drop_column("links", "is_indexed")
    op.drop_column("pdfs", "is_indexed")
    op.drop_column("notes", "is_indexed")
