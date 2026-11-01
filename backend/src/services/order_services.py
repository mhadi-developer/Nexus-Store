import asyncio
import logging
import stripe

from decimal import Decimal,ROUND_HALF_UP
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..config import settings
from ..modals import Product
from ..utils.order_utils import build_order_objects


logger = logging.getLogger(__name__)

stripe.api_key = settings.stripe_secret_key.get_secret_value()

FRONTEND_URL = settings.frontend_url

async def process_checkout(
    request,
    customer_id: int,
    db: AsyncSession
):
    try:
        # STEP 0: Validate payment method
        payment_method = request.payment_method

        if payment_method not in [
            "Cash on delivery",
            "Stripe"
        ]:
            raise HTTPException(
                status_code=400,
                detail="Invalid payment method"
            )

        # STEP 1: Fetch products from database
        product_ids = {
            item.product_id for item in request.items
        }

        if not product_ids:
            raise HTTPException(
                status_code=400,
                detail="Your cart is empty"
            )

        # Validate quantities
        if any(item.quantity <= 0 for item in request.items):
            raise HTTPException(
                status_code=400,
                detail="Product quantity must be greater than zero"
            )

        result = await db.execute(
            select(Product).where(
                Product.product_id.in_(product_ids)
            )
        )

        product_list = result.scalars().all()

        products = {
            product.product_id: product
            for product in product_list
        }

        if len(products) != len(product_ids):
            raise HTTPException(
                status_code=404,
                detail="One or more products were not found"
            )

        # STEP 2: Build SQLAlchemy order object
        order = build_order_objects(
            request=request,
            customer_id=customer_id,
            products=products
        )

        # STEP 3: Save order and related objects
        db.add(order)

        await db.flush()

        # Persist order before Stripe API request.
        await db.commit()

        await db.refresh(order)

        # STEP 4: Handle CASH ON DELIVERY
        if payment_method == "Cash on delivery":

            return {
                "success": True,
                "message": "Order placed successfully",
                "payment_method": "Cash on delivery",
                "order_id": order.id,
                "order_number": order.order_number,
                "total": str(order.total),
                "payment_status": order.payment_status,
                "order_status": order.order_status
            }

        # STEP 5: Handle STRIPE CHECKOUT
        elif payment_method == "Stripe":

            line_items = []

            for item in request.items:

                product = products[item.product_id]

                # Database price is authoritative.
                product_price = Decimal(str(product.product_price))

                # USD uses two decimal places.
                # Stripe expects the amount in minor units.
                amount = int(
                    (product_price * 100).quantize(
                        Decimal("1"),
                        rounding=ROUND_HALF_UP
                    )
                )

                line_items.append({
                    "price_data": {
                        "currency": "usd",

                        "product_data": {
                            "name": product.product_title
                        },

                        "unit_amount": amount
                    },

                    "quantity": item.quantity
                })

            try:
                # Create Stripe hosted Checkout Session.
                # Run synchronous Stripe SDK outside
                # the async event loop.

                checkout_session = await asyncio.to_thread(
                    stripe.checkout.Session.create,

                    mode="payment",

                    line_items=line_items,

                    success_url=(
                        f"{FRONTEND_URL}/order-success"
                        "/{CHECKOUT_SESSION_ID}"
                    ),

                    cancel_url=(
                        f"{FRONTEND_URL}/order-cancel"
                    ),

                    client_reference_id=str(order.id),

                    metadata={
                        "order_id": str(order.id),
                        "order_number": order.order_number,
                        "customer_id": str(customer_id)
                    }
                )

                # Save Stripe session ID in database.
                order.stripe_session_id = checkout_session.id

                await db.commit()

                return {
                    "success": True,
                    "message": "Stripe checkout session created",

                    "payment_method": "Stripe",

                    "order_id": order.id,
                    "order_number": order.order_number,

                    "total": str(order.total),

                    "payment_status": order.payment_status,
                    "order_status": order.order_status,

                    "checkout_url": checkout_session.url,
                    "session_id": checkout_session.id
                }

            except stripe.StripeError as stripe_error:

                # Keep the order for retry/recovery.
                logger.exception("Stripe Checkout session creation failed")
                order.order_status = "PAYMENT_INITIATION_FAILED"

                await db.commit()

                raise HTTPException(
                    status_code=502,
                    detail="Unable to initialize Stripe Checkout"
                ) from stripe_error

    except HTTPException:
        raise

    except Exception as error:

        await db.rollback()
        logger.exception("Unexpected error while processing checkout")

        raise HTTPException(
            status_code=500,
            detail="Unable to process your order"
        ) from error
