from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, EmailStr
from datetime import datetime
from decimal import Decimal 


class UserBase(BaseModel):
    userName: str  = Field(min_length=5 , max_length=30)
    email: EmailStr = Field(max_length=120)
    firstName: str = Field(min_length=5, max_length=50)
    lastName: str = Field(min_length=3, max_length=50)
    



class UserCreateModel(UserBase):
    password: str= Field(min_length = 8 , max_length=30)
    pass



class UserResponseModel(UserBase):
    model_config= ConfigDict(from_attributes=True)
    id:int
    profileImageUrl: str | None

class ProductModel(BaseModel):
    product_id: int
    product_price: float
    product_in_stock: bool
    product_category: str
    product_img: str
    product_title: str = Field(min_length=1, max_length=250)
    product_quantity: int
    product_rating: float
    product_category_id: int


class CreateProductModel(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    image: str = ""
    price: float
    rating: float = 0
    category_id: int
    in_stock: bool
    quantity: int


class UpdateProductModel(BaseModel):
    name: str | None = Field(default=None,min_length=1, max_length=100)
    image: str | None = Field(default=None)
    price: float | None = Field(default=None)
    rating: float | None = Field(default=None)
    category: str | None = Field(default=None)
    category_id: int | None = Field(default=None)
    in_stock: bool | None = Field(default=None)
    quantity: int | None = Field(default=None)


class ProductModelResponse(ProductModel):
      model_config = ConfigDict(from_attributes= True)
      
class PaginatedProductsResponse(BaseModel):
    products: list[ProductModelResponse]
    total:int
    skip:int
    limit:int
    has_more:bool
    
      
      
      
      
class CategoryBase(BaseModel):
    category_name: str = Field(min_length=2, max_length=50)
    category_image: str = Field(min_length=1, max_length=500)


class CreateCategoryModel(CategoryBase):
    pass


class UpdateCategoryModel(BaseModel):
    category_name: str | None = Field(default=None, min_length=2, max_length=50)
    category_image: str | None = Field(default=None, min_length=1, max_length=500)


class CategoryResponseModel(CategoryBase):
    model_config = ConfigDict(from_attributes=True)
    category_id: int
    
    

class Token(BaseModel):
    access_token: str
    token_type: str



class CartItemAdd(BaseModel):
    product_id: int = Field(gt=0, description="Product ID must be a positive integer")
    quantity: int = Field(gt=0, description="Quantity must be greater than zero")
    
    
class CartItemUpdate(BaseModel):
    quantity: int = Field(ge=0, description="Quantity can be zero to remove, or positive")

class CartItemResponse(BaseModel):
    product_id: int
    quantity: int

class CartResponse(BaseModel):
    cart_id: str
    items: list[CartItemResponse]
    
    
    
class ForgotPasswordRequest(BaseModel):
    email:EmailStr = Field(max_length=80)
    

class ResetPasswordRequest(BaseModel):
    token:str = Field(max_length=80)
    new_password:str = Field(min_length=8)
    
    
class ChangePasswordRequest(BaseModel):
    current_password:str
    new_password:str = Field(min_length=8)

def to_camel(string: str) -> str:
    first, *remaining = string.split("_")
    return first + "".join(word.capitalize() for word in remaining)


class OrderBaseSchema(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


# =========================
# REQUEST SCHEMAS
# =========================

class OrderDeliveryAddressCreate(OrderBaseSchema):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        extra="forbid",
    )

    address_line: str = Field(min_length=1, max_length=255)
    apartment: str = Field(default="", max_length=100)
    city: str = Field(min_length=1, max_length=100)
    country: str = Field(min_length=1, max_length=100)
    phone: str = Field(min_length=1, max_length=30)
    postal_code: str = Field(min_length=1, max_length=20)
    region: str = Field(min_length=1, max_length=100)


class OrderItemCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    product_id: int = Field(gt=0)
    quantity: int = Field(gt=0)


class OrderCreateRequest(OrderBaseSchema):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        extra="forbid",
    )

    delivery_address: OrderDeliveryAddressCreate
    items: list[OrderItemCreate] = Field(min_length=1)

    payment_method: Literal[
        "Stripe",
        "Cash on delivery",
    ]


# =========================
# RESPONSE SCHEMAS
# =========================

class CustomerResponse(OrderBaseSchema):
    id: int
    name: str
    email: str


class DeliveryAddressResponse(OrderBaseSchema):
    address_line: str
    apartment: str
    city: str
    country: str
    phone: str
    postal_code: str
    region: str


class OrderItemResponse(OrderBaseSchema):
    product_id: int
    name: str
    image: str | None = None
    price: Decimal
    quantity: int
    category: str
    category_id: int


class OrderConfirmationResponse(OrderBaseSchema):
    created_at: datetime
    customer: CustomerResponse
    delivery_address: DeliveryAddressResponse
    items: list[OrderItemResponse]
    order_number: str
    payment_method: str
    total: Decimal
