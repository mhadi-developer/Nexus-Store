
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import APIRouter, HTTPException, status, Depends, FastAPI, Request
from typing import Annotated
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from .database import engine, get_db
from .routes import product, category, user, orders

PACKAGE_DIR = Path(__file__).resolve().parent


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await engine.dispose()


app = FastAPI(lifespan=lifespan)

app.mount("/static", StaticFiles(directory=PACKAGE_DIR / "static"), name="static")
app.mount("/media", StaticFiles(directory=PACKAGE_DIR / "media"), name="media")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "https://6tgs9bhv-5173.inc1.devtunnels.ms/"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(product.router, prefix="/api",tags=["products"])
app.include_router(category.router, prefix="/api", tags=["categories"])
app.include_router(user.router, prefix="/api", tags=["user"])
app.include_router(orders.router, prefix="/api", tags=["orders"])   


# Security Headers

@app.middleware("http")
async def add_Security_headers(request:Request , call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["X-XSS-Protection"] = "1; mode=block"
  
    
    if "Referrer-Policy" not in response.headers:
            response.headers["Referrer-Policy"]= "strict-origin-when-cross-origin"
    
    if request.url.hostname not in ("localhost", "127.0.0.1"):
          response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    
    return response

# Health Check route

@app.get("/health")
async def health_check(db:Annotated[AsyncSession, Depends(get_db)]):
    try:
        await db.execute(text("SELECT 1"))
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database unavailable",) from exc
    
    return {"status": "ok", "message": "Database is available"}

@app.get("/")
def home():
    return {"message": "Welcome from FastAPI!", "status": "200"}