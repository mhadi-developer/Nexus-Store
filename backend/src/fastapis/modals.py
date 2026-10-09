from __future__ import annotations
from datetime import UTC, datetime
from sqlalchemy import Column, Integer, String , Text, DateTime, Float, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .database import Base

class User(Base):
    __tablename__="users"
    id:Mapped[int] = mapped_column(Integer, primary_key=True , index=True)
    firstName:Mapped[str]= mapped_column(String(50), nullable=False)
    lastName:Mapped[str]= mapped_column(String(50), nullable=False)
    userName:Mapped[str]= mapped_column(String(50),unique=True, nullable=False)
    email:Mapped[str]= mapped_column(String(80), unique=True, nullable=False)
    profileImage:Mapped[str | None]=mapped_column(String(255),default=None, nullable=True)  
    password:Mapped[str] = mapped_column(String(50), nullable=False)
    
    @property
    def profileImageUrl(self)-> str:
        if self.profileImage:
            return f"./user/media/profil_pics/{self.profileImage}"
        return "./user/static/profile_pics/default.jpg"
    
    
class Product(Base):
    __tablename__="products"
    product_title:Mapped[str]= mapped_column(String(250), nullable=False)
    product_id:Mapped[int]= mapped_column(Integer, primary_key=True , index=True) 
    product_price:Mapped[float]=mapped_column(Float, nullable=False) 
    product_quantity:Mapped[int]=mapped_column(Integer, nullable=False)
    product_in_stock:Mapped[bool]=mapped_column(Boolean, nullable=False)
    product_rating:Mapped[float]=mapped_column(Float, nullable=True , default=0)
    product_category:Mapped[str]=mapped_column(String, nullable=False)
    product_category_id:Mapped[int]=mapped_column(ForeignKey("categoires.category_id"))
    product_img:Mapped[str]=mapped_column(String, nullable=False)
    category: Mapped["Category"] = relationship(
        back_populates="products"
    )
    
    
    
    
class Category(Base):
    __tablename__="categoires"
    category_name:Mapped[str]=mapped_column(String(50), nullable=False)
    category_id:Mapped[int]=mapped_column(Integer, primary_key=True , index=True)
    category_icon: Mapped[str]=mapped_column(String(150), nullable=False)
    
    products:Mapped[list[Product]]=relationship(
        back_populates="category"
    )
    
    