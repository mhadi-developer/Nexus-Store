"""Create the initial PostgreSQL schema.

Revision ID: 0001_initial
Revises:
Create Date: 2026-10-23
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("firstName", sa.String(length=50), nullable=False),
        sa.Column("lastName", sa.String(length=50), nullable=False),
        sa.Column("userName", sa.String(length=50), nullable=False),
        sa.Column("email", sa.String(length=80), nullable=False),
        sa.Column("profileImage", sa.String(length=255), nullable=True),
        sa.Column("password", sa.String(length=255), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
        sa.UniqueConstraint("userName"),
    )
    op.create_index("ix_users_id", "users", ["id"], unique=False)

    op.create_table(
        "categories",
        sa.Column("category_name", sa.String(length=50), nullable=False),
        sa.Column("category_id", sa.Integer(), nullable=False),
        sa.Column("category_image", sa.String(length=500), nullable=False),
        sa.PrimaryKeyConstraint("category_id"),
    )
    op.create_index(
        "ix_categories_category_id", "categories", ["category_id"], unique=False
    )

    op.create_table(
        "password_reset_tokens",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("token_hash", sa.String(length=64), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("token_hash"),
    )
    op.create_index(
        "ix_password_reset_tokens_id", "password_reset_tokens", ["id"], unique=False
    )

    op.create_table(
        "products",
        sa.Column("product_title", sa.String(length=250), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("product_price", sa.Float(), nullable=False),
        sa.Column("product_quantity", sa.Integer(), nullable=False),
        sa.Column("product_in_stock", sa.Boolean(), nullable=False),
        sa.Column("product_rating", sa.Float(), nullable=True),
        sa.Column("product_category", sa.String(), nullable=False),
        sa.Column("product_category_id", sa.Integer(), nullable=False),
        sa.Column("product_img", sa.String(), nullable=False),
        sa.ForeignKeyConstraint(["product_category_id"], ["categories.category_id"]),
        sa.PrimaryKeyConstraint("product_id"),
    )
    op.create_index("ix_products_product_id", "products", ["product_id"], unique=False)

    op.create_table(
        "carts",
        sa.Column("cart_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("cart_id"),
        sa.UniqueConstraint("user_id"),
    )
    op.create_index("ix_carts_cart_id", "carts", ["cart_id"], unique=False)

    op.create_table(
        "cart_items",
        sa.Column("cart_item_id", sa.Integer(), nullable=False),
        sa.Column("cart_id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["cart_id"], ["carts.cart_id"]),
        sa.ForeignKeyConstraint(["product_id"], ["products.product_id"]),
        sa.PrimaryKeyConstraint("cart_item_id"),
    )
    op.create_index(
        "ix_cart_items_cart_item_id", "cart_items", ["cart_item_id"], unique=False
    )


def downgrade() -> None:
    op.drop_index("ix_cart_items_cart_item_id", table_name="cart_items")
    op.drop_table("cart_items")
    op.drop_index("ix_carts_cart_id", table_name="carts")
    op.drop_table("carts")
    op.drop_index("ix_products_product_id", table_name="products")
    op.drop_table("products")
    op.drop_index("ix_password_reset_tokens_id", table_name="password_reset_tokens")
    op.drop_table("password_reset_tokens")
    op.drop_index("ix_categories_category_id", table_name="categories")
    op.drop_table("categories")
    op.drop_index("ix_users_id", table_name="users")
    op.drop_table("users")
