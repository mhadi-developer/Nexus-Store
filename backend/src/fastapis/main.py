from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from pathlib import Path

from .database import engine
from .routes import product, category, user

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
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(product.router, prefix="/api",tags=["products"])
app.include_router(category.router, prefix="/api", tags=["categories"])
app.include_router(user.router, prefix="/api", tags=["user"])


@app.get("/")
def home():
    return {"message": "Welcome from FastAPI!", "status": "200"}