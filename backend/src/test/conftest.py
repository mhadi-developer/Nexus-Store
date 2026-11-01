import os
from collections.abc import AsyncGenerator

os.environ["DATABASE_URL"] = ("postgresql+asyncpg://postgres:M.Hadi.23@localhost:5432/test_nexus_store")

import boto3
import pytest
from httpx2 import ASGITransport , AsyncClient
from sqlalchemy.ext.asyncio import AssynSession , async_sessionmaker , create_async_engine
from sqlalchemy.pool import NullPool
from ..main import app
pytest_plugin = ["anyio"]

@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"


@pytest.fixture(scope="session")
def test_engine():
    engine =  create_async_engine(
        os.environ["DATABSE_URL"],
        poolclass=NullPool
    )
    return engine


@pytest.fixture(scope="session")
async def setup_database(test_engine):
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield
    
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        
        
    await test_engine.dispose()
    
@pytest.fixture
async def db_session(test_engin , setup_database)-> AsyncGenerator[AsyncSession]:
    conn = await test_engin.connect
    trans = await conn.begin()
    
    test_async_session = async_sessionmaker(
        bind=conn,
        class_=AssynSession,
        expire_on_commit=False,
        join_transaction_mode="create_savepoint",
    )
    
    async with test_async_session() as session:
        try:
            yield session,
        finally:
            await session.close();
            await trans.rollback()
            await conn.close()
            