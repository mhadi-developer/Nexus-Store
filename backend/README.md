# Backend database setup

The API uses PostgreSQL through SQLAlchemy's async driver. Alembic owns the
database schema; the application no longer creates tables during startup.

1. Install dependencies from this directory with `uv sync`.
2. Create a PostgreSQL database named `nexus_store` (or update `DATABASE_URL`).
3. Copy `.env.example` to `src/fastapis/.env`, set a strong `SECRET_KEY`, and
   set `DATABASE_URL` to your PostgreSQL connection URL. The URL must use the
   `postgresql+asyncpg` driver. Application settings load this package-local
   file regardless of which directory you launch the server from; environment
   variables override values in the file.
4. Apply the schema with `uv run alembic upgrade head`.
5. To copy records from the bundled SQLite database, run
   `uv run python -m fastapis.migrate_sqlite` after applying the schema.
   The importer reads `src/fastapis/nexus.db`, leaves that file unchanged, and
   refuses to import if any destination application table is non-empty. Set
   `SQLITE_SOURCE` to use a different SQLite file.
6. From `src/fastapis/`, start the API with `uv run fastapis dev main.py`.

## Checkout orders

Authenticated customers can place an order with `POST /api/orders`. Send the
delivery address, product IDs and quantities, and selected payment method; the
bearer token identifies the customer. The API looks up product details,
validates stock, calculates the total, and returns the generated order number
and confirmation:

```json
{
  "deliveryAddress": {
    "addressLine": "test address, street 23, 99200",
    "apartment": "",
    "city": "Rawalpindi",
    "country": "Pakistan",
    "phone": "+92 1234567",
    "postalCode": "44600",
    "region": "Punjab"
  },
  "items": [{ "product_id": 3, "quantity": 1 }],
  "paymentMethod": "Stripe"
}
```

Apply the order tables with `uv run alembic upgrade head` before accepting
orders. Selecting Stripe records the payment method; it does not process a
card payment.

## Optional profile pictures

Profile pictures are optional. Signed-in users can upload or replace a picture
with `POST /api/user/profile-image` using a multipart form field named `file`
and a bearer access token. Pillow validates and crops the image to 300 x 300,
then stores a generated JPEG in `src/fastapis/media/profile_pics/`. The API
limits uploads using `MAX_FILE_UPLOAD_BYTES` (5 MB by default) and serves saved
images under `/media/profile_pics/`. Signed-in users can remove the current
picture with `DELETE /api/user/profile-image`. Users without a picture retain
the frontend initials/avatar fallback.

## Password reset and change

Forgot-password requests send a single-use reset link to the account email.
Set `SMTP_SERVER`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`,
`MAIL_FROM`, and `MAIL_USE_TLS` for your mail provider, and set `FRONTEND_URL`
to the frontend origin so links open the correct application. Reset tokens are
stored hashed and expire after `RESET_TOKEN_EXPIRES_MINUTES` (60 by default).
The password reset records are included in the existing schema migration.

Create a new Alembic revision after changing ORM models with
`uv run alembic revision --autogenerate -m "describe schema change"`, review the
generated migration, then apply it with `uv run alembic upgrade head`.