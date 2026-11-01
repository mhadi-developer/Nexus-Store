# Backend database setup

## Run the full stack with Docker Compose

From the repository root, copy `.env.example` to `.env` and replace the
placeholder secrets and Stripe test credentials. The example database
password uses URL-safe characters; URL-encode it if you change it to include
reserved URL characters.

```powershell
Copy-Item .env.example .env
docker compose up --build -d
docker compose ps
```

Open the storefront at `http://localhost:8080`. The frontend proxies API and
media requests through Nginx, the backend waits for PostgreSQL and applies
Alembic migrations before starting, and PostgreSQL data and uploaded media are
stored in named Docker volumes. The API is also available on
`http://localhost:8000`.

Stop the services with `docker compose down`. To also delete the database and
uploaded-media volumes, run `docker compose down --volumes`.

## Docker

Build the production image from the repository root:

```powershell
docker build -t nexus-backend ./backend
```

Run it with the required settings supplied through an environment file that is
not committed to source control:

```powershell
docker run --rm -p 8000:8000 --env-file backend/.env.docker nexus-backend
```

Set `DATABASE_URL` to a database reachable from the container and provide the
required secret and Stripe settings (`SECRET_KEY`, `STRIPE_PUBLIC_KEY`,
`STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOK_SECRET`). Apply schema migrations
before starting the API with `docker run ... nexus-backend alembic upgrade head`.
The runtime image runs as a non-root user. Mount persistent storage at
`/app/src/media` if uploaded profile pictures must survive container
replacement.

The API uses PostgreSQL through SQLAlchemy's async driver. Alembic owns the
database schema; the application no longer creates tables during startup.

1. Install dependencies from this directory with `uv sync`.
2. Create a PostgreSQL database named `nexus_store` (or update `DATABASE_URL`).
3. Copy `.env.example` to `src/fastapis/.env`, set a strong `SECRET_KEY`, and
   set `DATABASE_URL` to your PostgreSQL connection URL. The URL must use the
   `postgresql+asyncpg` driver. Application settings load this package-local
   file regardless of which directory you launch the server from; environment
   variables override values in the file.
   For TLS, use `ssl=require` in the URL. If a provider URL includes
   `sslmode=require&channel_binding=require`, `sslmode` is translated to
   asyncpg's `ssl` option and the unsupported `channel_binding` option is
   removed; asyncpg does not enforce channel binding.
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