
import stripe
from decimal import Decimal


def create_stripe_checkout_session(
    order,
    products: dict,
    frontend_url: str
):
    """
    Create a Stripe-hosted Checkout Session.
    """

    line_items = []

    for item in order.items:

        product = products[item.product_id]

        amount = int(
            (Decimal(str(product.price)) * 100)
            .quantize(Decimal("1"))
        )

        line_items.append({
            "price_data": {
                "currency": "usd",
                "product_data": {
                    "name": product.name,
                    "images": (
                        [product.image]
                        if product.image and product.image.startswith("https://")
                        else []
                    )
                },
                "unit_amount": amount,
            },
            "quantity": item.quantity
        })

    session = stripe.checkout.Session.create(
        mode="payment",

        line_items=line_items,

        success_url=(
            f"{frontend_url}/checkout/success"
            "?session_id={CHECKOUT_SESSION_ID}"
        ),

        cancel_url=(
            f"{frontend_url}/checkout/cancel"
        ),

        client_reference_id=str(order.id),

        metadata={
            "order_id": str(order.id),
            "order_number": order.order_number
        }
    )

    return session
