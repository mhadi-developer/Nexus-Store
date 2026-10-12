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
    profileImage: str|None
    profileImageUrl: str


class ProductModel(BaseModel):
    id : int
    name: str = Field(min_length=1, max_length=100)
    image: str
    price: float
    rating: float
    category: str
    category_id: int
    in_stock: bool
    quantity: int


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
    
    
