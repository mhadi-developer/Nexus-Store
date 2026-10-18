from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import Annotated
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
import asyncio

from ..schema import CreateProductModel, UpdateProductModel, PaginatedProductsResponse, ProductModelResponse
from ..modals import Product, Category
from ..database import get_db

router = APIRouter()
from fastapi import APIRouter, HTTPException, status, Depends
from typing import Annotated, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import asyncio

from ..modals import Product, Category
from ..database import get_db

router = APIRouter(tags=["Products"])

@router.get("/products/all", response_model=PaginatedProductsResponse)
async def get_all_products(db: Annotated[AsyncSession, Depends(get_db)],
                            skip: Annotated[int, Query(ge=0)]=0,
                            limit:Annotated[int, Query(ge=1 , le=100)]=10
):
    
 count_result = await db.execute(select(func.count(Product.product_id)).select_from(Product))
 total = count_result.scalar() or 0
 
 product_query = await db.execute(select(Product).offset(skip).limit(limit))
 products = product_query.scalars().all()
 
 has_more = skip + len(products) < total
 
 return PaginatedProductsResponse(
     products = [ProductModelResponse.model_validate(Product) for Product in products],
     total = total,
     skip= skip,
     limit = limit,
     has_more = has_more
 ) 

@router.get("/products")
async def get_products(
    db: Annotated[AsyncSession, Depends(get_db)],
    limit: Optional[int] = Query(None, ge=1, le=100, description="Max records to return"),
    offset: Optional[int] = Query(None, ge=0, description="Records to skip"),
    category_name: Optional[str] = Query(None, description="category of the products"),
    category_id: Optional[int] = Query(None, ge=1, description="ID of the product category"),
):
    stmt = select(Product)

    if category_id is not None:
        stmt = stmt.where(Product.product_category_id == category_id)
    if category_name is not None:
        stmt = stmt.where(func.lower(Product.product_category) == category_name.lower())

    if offset is not None:
        stmt = stmt.offset(offset)
    if limit is not None:
        stmt = stmt.limit(limit)

    result = await db.scalars(stmt)
    products = result.all()

    return [{
        "id": p.product_id,
        "name": p.product_title,
        "image": p.product_img,
        "price": p.product_price,
        "rating": p.product_rating or 0,
        "category": p.product_category,
        "category_id": p.product_category_id,
        "in_stock": p.product_in_stock,
        "quantity": p.product_quantity
    } for p in products]


@router.get("/product/details/{product_id}")
async def get_product_by_id(product_id: int, db: Annotated[AsyncSession, Depends(get_db)]):
    await asyncio.sleep(1)  # Non-blocking sleep
    result = await db.scalars(select(Product).where(Product.product_id == product_id))
    product_by_id = result.first()
    if not product_by_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product does not exist")
    return product_by_id

@router.post("/create/product", status_code=status.HTTP_201_CREATED)
async def create_product(product: CreateProductModel, db: Annotated[AsyncSession, Depends(get_db)]):
    category = await db.get(Category, product.category_id)
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
    await db.commit()
    await db.refresh(new_product)
    
    return {
        "id": new_product.product_id, "name": new_product.product_title,
        "image": new_product.product_img, "price": new_product.product_price,
        "rating": new_product.product_rating or 0, "category": new_product.product_category,
        "category_id": new_product.product_category_id, "in_stock": new_product.product_in_stock,
        "quantity": new_product.product_quantity
    }

@router.put("/update/product/{product_id}")
async def update_product(product_id: int, db: Annotated[AsyncSession, Depends(get_db)], product: UpdateProductModel):
    results = await db.execute(select(Product).where(Product.product_id == product_id))
    existing_product: Product = results.scalars().first()
    if not existing_product:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="Product does not exist")
    
    changes = product.model_dump(exclude_unset=True)
    for field, value in changes.items():
        if field == "category_id":
            category = await db.get(Category, value)
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
    
    await db.commit()
    await db.refresh(existing_product)
    
    return {
        "id": existing_product.product_id, "name": existing_product.product_title,
        "image": existing_product.product_img, "price": existing_product.product_price,
        "rating": existing_product.product_rating or 0, "category": existing_product.product_category,
        "category_id": existing_product.product_category_id, "in_stock": existing_product.product_in_stock,
        "quantity": existing_product.product_quantity
    }
