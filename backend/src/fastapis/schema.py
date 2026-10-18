from pydantic import BaseModel, ConfigDict, Field, EmailStr



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