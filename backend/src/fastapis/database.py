
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase, Session
from typing import Generator
import redis.asyncio as redis

REDIS_URL = "yard-sepia-tooth-50236.db.redis.io:10147"

SQLALCHEMY_DATABASE_URL = "sqlite+aiosqlite:///./nexus.db"
engine = create_async_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession , expire_on_commit=False)

class Base(DeclarativeBase):
    pass
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        
async def get_redis():
    client = redis.from_url(REDIS_URL, decode_responses=True)
    try:
        yield client
    finally:
        await client.close()