

from fastapi import FastAPI, HTTPException , Request , status
from fastapi.middleware.cors import CORSMiddleware
import time
app = FastAPI()
app.add_middleware(
  CORSMiddleware,
  allow_origins=["http://localhost:5173"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"]
)

products : list(dict) = [
  {
    "id": 1,
    "name": "Wireless Headphones",
    "price": 59.99,
    "category": "Electronics",
    "in_stock": True,
    "quantity": 25,
    "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600",
    "rating": 4.8
  },
  {
    "id": 2,
    "name": "Mechanical Keyboard",
    "price": 89.99,
    "category": "Electronics",
    "in_stock": True,
    "quantity": 18,
    "image": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=600",
    "rating": 4.9
  },
  {
    "id": 3,
    "name": "Gaming Mouse",
    "price": 39.99,
    "category": "Electronics",
    "in_stock": True,
    "quantity": 42,
    "image": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=600",
    "rating": 4.7
  },
  {
    "id": 4,
    "name": "USB-C Hub",
    "price": 29.99,
    "category": "Accessories",
    "in_stock": True,
    "quantity": 30,
    "image": "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&q=80&w=600",
    "rating": 4.5
  },
  {
    "id": 5,
    "name": "Laptop Stand",
    "price": 45.50,
    "category": "Accessories",
    "in_stock": False,
    "quantity": 0,
    "image": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=600",
    "rating": 4.6
  },
  {
    "id": 6,
    "name": "Webcam",
    "price": 74.99,
    "category": "Electronics",
    "in_stock": True,
    "quantity": 15,
    "image": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=600",
    "rating": 4.4
  },
  {
    "id": 7,
    "name": "Bluetooth Speaker",
    "price": 49.99,
    "category": "Audio",
    "in_stock": True,
    "quantity": 20,
    "image": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&q=80&w=600",
    "rating": 4.7
  },
  {
    "id": 8,
    "name": "Portable SSD",
    "price": 119.99,
    "category": "Storage",
    "in_stock": True,
    "quantity": 12,
    "image": "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&q=80&w=600",
    "rating": 4.9
  },
  {
    "id": 9,
    "name": "Smart Watch",
    "price": 149.99,
    "category": "Wearables",
    "in_stock": True,
    "quantity": 8,
    "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600",
    "rating": 4.8
  },
  {
    "id": 10,
    "name": "USB-C Cable",
    "price": 12.99,
    "category": "Accessories",
    "in_stock": True,
    "quantity": 75,
    "image": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=600",
    "rating": 4.6
  }
]


@app.get("/")
def home():
    return { "message": "Welcome from FastAPI! ", "status" : "200"}


@app.get("/products")
def get_products():
    return products
  

@app.get("/product/details/{product_id}")
def get_product_by_id(product_id: int):
    time.sleep(1)
    for product in products:
        if product.get("id") == product_id:
             return product
    raise HTTPException(status_code = status.HTTP_404_NOT_FOUND, detail = "Product not found") 