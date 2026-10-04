from pydantic import BaseModel, ConfigDict, Field


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