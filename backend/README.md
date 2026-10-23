# Backend database setup

The API uses PostgreSQL through SQLAlchemy's async driver. Alembic owns the
database schema; the application no longer creates tables during startup.

1. Install dependencies from this directory with `uv sync`.
2. Create a PostgreSQL database named `nexus_store` (or update `DATABASE_URL`).
3. Copy `.env.example` to `.env`, set a strong `SECRET_KEY`, and set
   `DATABASE_URL` to your PostgreSQL connection URL. The URL must use the
   `postgresql+asyncpg` driver.
4. Apply the schema with `uv run alembic upgrade head`.
5. To copy records from the bundled SQLite database, run
   `uv run python -m fastapis.migrate_sqlite` after applying the schema.
   The importer reads `src/fastapis/nexus.db`, leaves that file unchanged, and
   refuses to import if any destination application table is non-empty. Set
   `SQLITE_SOURCE` to use a different SQLite file.
6. Start the API with `uv run python -m uvicorn fastapis.main:app --app-dir src --reload`.

Create a new Alembic revision after changing ORM models with
`uv run alembic revision --autogenerate -m "describe schema change"`, review the
generated migration, then apply it with `uv run alembic upgrade head`.