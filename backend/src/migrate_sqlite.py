import asyncio
import os
from pathlib import Path

from sqlalchemy import MetaData, Table, func, insert, inspect, select
from sqlalchemy.engine import URL
from sqlalchemy.ext.asyncio import create_async_engine

from . import modals as _models
from .database import Base, engine

SOURCE_DB = Path(
    os.getenv("SQLITE_SOURCE", str(Path(__file__).with_name("nexus.db")))
).resolve()
LEGACY_TABLE_NAMES = {"categories": "categoires"}


async def migrate_sqlite_data() -> None:
    if not SOURCE_DB.is_file():
        raise FileNotFoundError(f"SQLite source database does not exist: {SOURCE_DB}")

    source_engine = create_async_engine(
        URL.create("sqlite+aiosqlite", database=str(SOURCE_DB))
    )
    try:
        async with source_engine.connect() as source_connection:
            source_tables = await source_connection.run_sync(
                lambda connection: set(inspect(connection).get_table_names())
            )
            table_names = {
                table.name: LEGACY_TABLE_NAMES.get(table.name, table.name)
                for table in Base.metadata.sorted_tables
            }
            required_tables = set(table_names.values()) - {"password_reset_tokens"}
            missing_tables = required_tables - source_tables
            if missing_tables:
                raise RuntimeError(
                    "SQLite source is missing required tables: "
                    + ", ".join(sorted(missing_tables))
                )

            counts: dict[str, int] = {}
            async with engine.begin() as target_connection:
                for table in Base.metadata.sorted_tables:
                    existing_count = await target_connection.scalar(
                        select(func.count()).select_from(table)
                    )
                    if existing_count:
                        raise RuntimeError(
                            f"PostgreSQL table {table.name!r} is not empty; "
                            "refusing to import SQLite rows."
                        )

                for table in Base.metadata.sorted_tables:
                    source_name = table_names[table.name]
                    if source_name not in source_tables:
                        counts[table.name] = 0
                        continue

                    source_table = await source_connection.run_sync(
                        lambda connection, name=source_name: Table(
                            name,
                            MetaData(),
                            autoload_with=connection,
                        )
                    )
                    rows = (
                        await source_connection.execute(select(source_table))
                    ).mappings().all()
                    target_rows = [
                        {
                            column.name: row[column.name]
                            for column in table.columns
                            if column.name in row
                        }
                        for row in rows
                    ]
                    if target_rows:
                        await target_connection.execute(insert(table), target_rows)
                    counts[table.name] = len(target_rows)

                for table in Base.metadata.sorted_tables:
                    primary_key = table.autoincrement_column
                    if primary_key is not None:
                        await target_connection.execute(
                            select(
                                func.setval(
                                    func.pg_get_serial_sequence(
                                        table.name, primary_key.name
                                    ),
                                    func.coalesce(func.max(primary_key), 1),
                                    func.max(primary_key).is_not(None),
                                )
                            ).select_from(table)
                        )

        print("SQLite import complete:")
        for table_name, row_count in counts.items():
            print(f"  {table_name}: {row_count} rows")
    finally:
        await source_engine.dispose()
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(migrate_sqlite_data())
