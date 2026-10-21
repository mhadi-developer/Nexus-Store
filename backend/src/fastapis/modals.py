from __future__ import annotations
from datetime import UTC, datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .database import Base

class User(Base):
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    firstName: Mapped[str] = mapped_column(String(50), nullable=False)
    lastName: Mapped[str] = mapped_column(String(50), nullable=False)
    userName: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    profileImage: Mapped[str | None] = mapped_column(String(255), default=None, nullable=True)  
    password: Mapped[str] = mapped_column(String(255), nullable=False)  # Increased length for safety (bcrypt hashes need ~60 chars)
    
    # Use string quotes for forward-referenced models defined below
    cart: Mapped["Cart | None"] = relationship(
        back_populates="user", 
        uselist=False, 
        cascade="all, delete-orphan"
    )
    
    reset_tokens: Mapped[list["PasswordResetToken"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )
    
    @property
    def profileImageUrl(self) -> str:
        if self.profileImage:
            return f"./user/media/profil_pics/{self.profileImage}"
        return "./user/static/profile_pics/default.jpg"


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))
    
    user: Mapped["User"] = relationship(back_populates="reset_tokens")


class Product(Base):
    __tablename__ = "products"
    
    product_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True) 
    product_title: Mapped[str] = mapped_column(String(250), nullable=False)
    product_price: Mapped[float] = mapped_column(Float, nullable=False) 
    product_quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    product_in_stock: Mapped[bool] = mapped_column(Boolean, nullable=False)
    product_rating: Mapped[float] = mapped_column(Float, nullable=True, default=0)
    product_category: Mapped[str] = mapped_column(String, nullable=False)
    product_category_id: Mapped[int] = mapped_column(ForeignKey("categoires.category_id"), nullable=False)
    product_img: Mapped[str] = mapped_column(String, nullable=False)
    
    category: Mapped["Category"] = relationship(
        back_populates="products"
    )
    
    cart_items: Mapped[list["CartItem"]] = relationship(
        back_populates="product", 
        cascade="all, delete-orphan"
    )


class Category(Base):
    __tablename__ = "categoires"  # Note: Check spelling if you want to fix to "categories"
    
    category_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    category_name: Mapped[str] = mapped_column(String(50), nullable=False)
    category_image: Mapped[str] = mapped_column(String(500), nullable=False)
    
    products: Mapped[list["Product"]] = relationship(
        back_populates="category"
    )


class Cart(Base):
    __tablename__ = "carts"
    
    cart_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, nullable=False)
    
    user: Mapped["User"] = relationship(back_populates="cart")
    items: Mapped[list["CartItem"]] = relationship(
        back_populates="cart", 
        cascade="all, delete-orphan"
    )


class CartItem(Base):
    __tablename__ = "cart_items"
    
    cart_item_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    cart_id: Mapped[int] = mapped_column(ForeignKey("carts.cart_id"), nullable=False)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.product_id"), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    
    cart: Mapped["Cart"] = relationship(back_populates="items")
    product: Mapped["Product"] = relationship(back_populates="cart_items")