

from fastapi import FastAPI, HTTPException , Request , status, Depends
from fastapi.middleware.cors import CORSMiddleware
import time
from .schema import CreateProductModel, UpdateProductModel, ProductModelResponse, UserResponseModel, UserCreateModel, CreateCategoryModel, UpdateCategoryModel, CategoryResponseModel
from typing import Annotated
from sqlalchemy import select
from sqlalchemy.orm import session
from .modals import User, Category, Product
from .database import Base , engine , get_db
from fastapi.staticfiles import StaticFiles
from passlib.context import CryptContext



Base.metadata.create_all(bind=engine)
app = FastAPI()
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/media", StaticFiles(directory="media"), name="media")
app.add_middleware(
  CORSMiddleware,
  allow_origins=["http://localhost:5173", "http://localhost:5174"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"]
)


# ****************************** Utils Function *****************************************************
def get_password_hash(password:str)->str:
  hashed_passwrd :str= pwd_context.hash(password)
  return hashed_passwrd



# ***************************************************************************************************************

categories = [ {"category_name": "Electronics" , "category_id": 1 , "icon":"💻"}, {"category_name": 'Accessories', "category_id": 2, "icon":"📱"}, {"category_name": 'Audio', "category_id": 3, "icon":"🎵"}, {"category_name": 'Storage', "category_id": 4, "icon":"💾"}, {"category_name": 'Wearables', "category_id": 5, "icon":"⌚"} ]
# products : list(dict) = [
#   {
#     "id": 1,
#     "name": "Wireless Headphones",
#     "price": 59.99,
#     "category": "Electronics",
#     "in_stock": True,
#     "quantity": 25,
#     "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600",
#     "rating": 4.8
#   },
#   {
#     "id": 2,
#     "name": "Mechanical Keyboard",
#     "price": 89.99,
#     "category": "Electronics",
#     "in_stock": True,
#     "quantity": 18,
#     "image": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=600",
#     "rating": 4.9
#   },
#   {
#     "id": 3,
#     "name": "Gaming Mouse",
#     "price": 39.99,
#     "category": "Electronics",
#     "in_stock": True,
#     "quantity": 42,
#     "image": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=600",
#     "rating": 4.7
#   },
#   {
#     "id": 4,
#     "name": "USB-C Hub",
#     "price": 29.99,
#     "category": "Accessories",
#     "in_stock": True,
#     "quantity": 30,
#     "image": "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&q=80&w=600",
#     "rating": 4.5
#   },
#   {
#     "id": 5,
#     "name": "Laptop Stand",
#     "price": 45.50,
#     "category": "Accessories",
#     "in_stock": False,
#     "quantity": 0,
#     "image": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=600",
#     "rating": 4.6
#   },
#   {
#     "id": 6,
#     "name": "Webcam",
#     "price": 74.99,
#     "category": "Electronics",
#     "in_stock": True,
#     "quantity": 15,
#     "image": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=600",
#     "rating": 4.4
#   },
#   {
#     "id": 7,
#     "name": "Bluetooth Speaker",
#     "price": 49.99,
#     "category": "Audio",
#     "in_stock": True,
#     "quantity": 20,
#     "image": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&q=80&w=600",
#     "rating": 4.7
#   },
#   {
#     "id": 8,
#     "name": "Portable SSD",
#     "price": 119.99,
#     "category": "Storage",
#     "in_stock": True,
#     "quantity": 12,
#     "image": "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&q=80&w=600",
#     "rating": 4.9
#   },
#   {
#     "id": 9,
#     "name": "Smart Watch",
#     "price": 149.99,
#     "category": "Wearables",
#     "in_stock": True,
#     "quantity": 8,
#     "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600",
#     "rating": 4.8
#   },
#   {
#     "id": 10,
#     "name": "USB-C Cable",
#     "price": 12.99,
#     "category": "Accessories",
#     "in_stock": True,
#     "quantity": 75,
#     "image": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=600",
#     "rating": 4.6
#   }
# ]


@app.get("/")
def home():
    return { "message": "Welcome from FastAPI! ", "status" : "200"}





#********************************** Product Routes ********************************************
@app.get("/products")
def get_products(db: Annotated[session, Depends(get_db)]):
     products = db.scalars(select(Product)).all()
     return [{"id": p.product_id, "name": p.product_title, "image": p.product_img,
              "price": p.product_price, "rating": p.product_rating or 0,
              "category": p.product_category, "category_id": p.product_category_id,
              "in_stock": p.product_in_stock,
              "quantity": p.product_quantity} for p in products]
  
     
  

@app.get("/product/details/{product_id}", response_model= ProductModelResponse)
def get_product_by_id(product_id: int):
    time.sleep(1)
    for product in products:
        if product.get("id") == product_id:
             return product
    raise HTTPException(status_code = status.HTTP_404_NOT_FOUND, detail = "Product not found")


@app.post("/create/product", status_code=status.HTTP_201_CREATED)
def create_product(product: CreateProductModel, db:Annotated[session,Depends(get_db)]):
     category = db.get(Category, product.category_id)
     if category is None:
       raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
     new_product = Product(
       product_title=product.name,
       product_price=product.price,
       product_quantity=product.quantity,
       product_rating=product.rating,
       product_category=category.category_name,
       product_category_id=category.category_id,
       product_img=product.image,
       product_in_stock=product.in_stock,
     )
     db.add(new_product)
     db.commit()
     db.refresh(new_product)
     return {"id": new_product.product_id, "name": new_product.product_title,
             "image": new_product.product_img, "price": new_product.product_price,
             "rating": new_product.product_rating or 0, "category": new_product.product_category,
             "category_id": new_product.product_category_id, "in_stock": new_product.product_in_stock,
             "quantity": new_product.product_quantity}


@app.put("/update/product/{product_id}")
def update_product(product_id:int, db:Annotated[session, Depends(get_db)], product:UpdateProductModel):
  results= db.execute(select(Product).where(Product.product_id == product_id))
  existing_product: Product = results.scalars().first()
  if not existing_product:
    raise HTTPException(status_code= status.HTTP_422_UNPROCESSABLE_CONTENT, detail="Product does not exist")
  
  changes = product.model_dump(exclude_unset=True)
  for field, value in changes.items():
    if field == "category_id":
      category = db.get(Category, value)
      if category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
      existing_product.product_category_id = category.category_id
      existing_product.product_category = category.category_name
    elif field == "name":
      existing_product.product_title = value
    elif field == "image":
      existing_product.product_img = value
    elif field == "quantity":
      existing_product.product_quantity = value
    elif field == "rating":
      existing_product.product_rating = value
    elif field == "price":
      existing_product.product_price = value
    elif field == "in_stock":
      existing_product.product_in_stock = value
  
  db.commit()
  db.refresh(existing_product)
  return {"id": existing_product.product_id, "name": existing_product.product_title,
          "image": existing_product.product_img, "price": existing_product.product_price,
          "rating": existing_product.product_rating or 0, "category": existing_product.product_category,
          "category_id": existing_product.product_category_id, "in_stock": existing_product.product_in_stock,
          "quantity": existing_product.product_quantity}
  
  
  
  



#****************************************** Categories Routes ********************************************
@app.get("/categories", response_model=list[CategoryResponseModel])
def get_categoires(db:Annotated[session, Depends(get_db)]):
    statment = select(Category)
    categories= db.scalars(statment).all()
    
    if(categories):
      return categories
    else:
      return []
    
               
  
  
@app.post("/create/category", response_model=CategoryResponseModel, status_code=status.HTTP_201_CREATED)
def create_category(category: CreateCategoryModel, db:Annotated[session, Depends(get_db)]):
  duplicate = db.scalars(select(Category).where(Category.category_name == category.category_name)).first()
  if duplicate:
    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A category with this name already exists")
  new_category = Category(category_name=category.category_name, category_image=category.category_image)
  db.add(new_category)
  db.commit()
  db.refresh(new_category)
  return new_category


@app.put("/update/category/{category_id}", response_model=CategoryResponseModel)
def update_category(category_id: int, category: UpdateCategoryModel, db: Annotated[session, Depends(get_db)]):
  existing = db.get(Category, category_id)
  if existing is None:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
  changes = category.model_dump(exclude_unset=True, exclude_none=True)
  if "category_name" in changes:
    duplicate = db.scalars(select(Category).where(
      Category.category_name == changes["category_name"], Category.category_id != category_id
    )).first()
    if duplicate:
      raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A category with this name already exists")
  for field, value in changes.items():
    setattr(existing, field, value)
  if "category_name" in changes:
    for product in existing.products:
      product.product_category = changes["category_name"]
  db.commit()
  db.refresh(existing)
  return existing


@app.delete("/delete/category/{category_id}")
def delete_category(category_id: int, db: Annotated[session, Depends(get_db)]):
    statement = select(Category).where(Category.category_id == category_id)
    category = db.execute(statement).scalars().first()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )

    if category.products:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Move products out of this category before deleting it")
    
    db.delete(category)
    db.commit()
    
    return {"message": "category deleted", "status": status.HTTP_200_OK}
#******************************************** User Routes *************************************************
@app.post("/create/user", status_code=status.HTTP_201_CREATED, response_model=UserResponseModel)
def create_user(user: UserCreateModel, db: Annotated[session, Depends(get_db)]):
  results= db.execute(select(User).where(User.userName == user.userName))
  existing_user = results.scalars().first()
  if existing_user:
    raise HTTPException(
      status_code= status.HTTP_400_BAD_REQUEST,
      detail="User already exist",
    )
    
  
  result = db.execute(select(User).where(User.email == user.email))
  existing_email = result.scalars().first()
  if existing_email:
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail="Email already exist",
    )
  plain_password = user.password
  hashed_password = get_password_hash(plain_password)
  new_user = User(
             userName=user.userName,
             email = user.email,
             firstName= user.firstName,
             lastName=user.lastName,
             password= hashed_password
             )
  db.add(new_user)
  db.commit()
  db.refresh
  
  
  return new_user




@app.get("/user/{user_id}", response_model=UserResponseModel)
def getUserById(user_id:int , db: Annotated[session, Depends(get_db)])-> User:
  result = db.execute(select(User).where(User.id == user_id))
  existing_user = result.scalars().first()
  
  if existing_user:
    return existing_user
  
  raise HTTPException(
    status_code=status.HTTP_404_NOT_FOUND , detail="User not found"
  )
  
  
  
  
  
