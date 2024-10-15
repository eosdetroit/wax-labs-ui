"""empty message

Revision ID: 3539f2563d0f
Revises:
Create Date: 2023-10-01 20:29:53.955022

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy import text

# revision identifiers, used by Alembic.
revision: str = "3539f2563d0f"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    conn.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'))

    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "proposal_statuses",
        sa.Column("proposal_id", sa.Integer(), nullable=False),
        sa.Column("author", sa.String(length=15), nullable=False),
        sa.Column("status", sa.String(length=60), nullable=True),
        sa.Column("uuid", sa.Uuid(), server_default=sa.text("uuid_generate_v4()"), autoincrement=False, nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("uuid"),
        sa.UniqueConstraint("proposal_id"),
        sa.UniqueConstraint("uuid"),
    )
    op.create_table(
        "users",
        sa.Column("name", sa.String(length=160), nullable=True),
        sa.Column("telegram_account", sa.String(length=160), nullable=False),
        sa.Column("wax_account", sa.String(length=15), nullable=False),
        sa.Column("chat_id", sa.String(length=60), nullable=False),
        sa.Column("uuid", sa.Uuid(), server_default=sa.text("uuid_generate_v4()"), autoincrement=False, nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("uuid"),
        sa.UniqueConstraint("chat_id"),
        sa.UniqueConstraint("uuid"),
        sa.UniqueConstraint("wax_account"),
    )
    op.create_index(op.f("ix_users_telegram_account"), "users", ["telegram_account"], unique=False)
    op.create_table(
        "subscriptions",
        sa.Column("proposal_id", sa.Integer(), nullable=True),
        sa.Column("user_id", sa.Uuid(), nullable=True),
        sa.Column("uuid", sa.Uuid(), server_default=sa.text("uuid_generate_v4()"), autoincrement=False, nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["proposal_id"],
            ["proposal_statuses.proposal_id"],
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.uuid"],
        ),
        sa.PrimaryKeyConstraint("uuid"),
        sa.UniqueConstraint("proposal_id"),
        sa.UniqueConstraint("uuid"),
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table("subscriptions")
    op.drop_index(op.f("ix_users_telegram_account"), table_name="users")
    op.drop_table("users")
    op.drop_table("proposal_statuses")
    # ### end Alembic commands ###

    conn = op.get_bind()
    conn.execute(text('DROP EXTENSION IF EXISTS "uuid-ossp";'))
