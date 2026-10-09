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
    in_stock: bool
    quantity: int


class CreateProductModel(ProductModel):
    id: int| None = Field(exclude=True, default=None, description="ID is auto-generated and should not be provided when creating a product.")


class ProductModelResponse(ProductModel):
      model_config = ConfigDict(from_attributes= True);