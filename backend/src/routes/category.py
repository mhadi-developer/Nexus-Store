from fastapi import APIRouter, HTTPException, status, Depends
from typing import Annotated
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..schema import CreateCategoryModel, UpdateCategoryModel, CategoryResponseModel
from ..modals import Category
from ..database import get_db

router = APIRouter()

@router.get("/categories", response_model=list[CategoryResponseModel])
async def get_categories(db: Annotated[AsyncSession, Depends(get_db)]):
    statement = select(Category).options(selectinload(Category.products))
    result = await db.scalars(statement)
    categories = result.all()
    return categories if categories else []

@router.post("/create/category", response_model=CategoryResponseModel, status_code=status.HTTP_201_CREATED)
async def create_category(category: CreateCategoryModel, db: Annotated[AsyncSession, Depends(get_db)]):
    dup_result = await db.scalars(select(Category).where(Category.category_name == category.category_name))
    if dup_result.first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A category with this name already exists")
    
    new_category = Category(category_name=category.category_name, category_image=category.category_image)
    db.add(new_category)
    await db.commit()
    await db.refresh(new_category)
    return new_category

@router.put("/update/category/{category_id}", response_model=CategoryResponseModel)
async def update_category(category_id: int, category: UpdateCategoryModel, db: Annotated[AsyncSession, Depends(get_db)]):
    existing = await db.get(Category, category_id, options=[selectinload(Category.products)])
    if existing is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    
    changes = category.model_dump(exclude_unset=True, exclude_none=True)
    if "category_name" in changes:
        dup_result = await db.scalars(
            select(Category).where(
                Category.category_name == changes["category_name"], 
                Category.category_id != category_id
            )
        )
        if dup_result.first():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A category with this name already exists")
            
    for field, value in changes.items():
        setattr(existing, field, value)
        
    if "category_name" in changes:
        for product in existing.products:
            product.product_category = changes["category_name"]
            
    await db.commit()
    await db.refresh(existing)
    return existing

@router.delete("/delete/category/{category_id}")
async def delete_category(category_id: int, db: Annotated[AsyncSession, Depends(get_db)]):
    statement = select(Category).where(Category.category_id == category_id).options(selectinload(Category.products))
    result = await db.execute(statement)
    category = result.scalars().first()
    
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    if category.products:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Move products out of this category before deleting it")
    
    await db.delete(category)
    await db.commit()
    
    return {"message": "category deleted", "status": status.HTTP_200_OK}