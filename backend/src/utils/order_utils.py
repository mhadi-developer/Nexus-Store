
from decimal import Decimal
from uuid import uuid4

from ..modals import OrderDeliveryAddress,OrderItem,Order



def generate_order_number() -> str:
    """Generate a unique order number."""
    return f"ORD-{uuid4().hex[:12].upper()}"


def build_order_objects(
    request,
    customer_id: int,
    products: dict
):
    """
    Map frontend checkout data into SQLAlchemy objects.

    Args:
        request: OrderCreateRequest Pydantic schema.
        customer_id: Authenticated customer's ID.
        products: Dictionary of fetched Product ORM objects,
                  keyed by product ID.

    Returns:
        Order SQLAlchemy object with related items and address.
    """

    # 1. Determine payment method
    payment_method = request.payment_method

    if payment_method not in ["Stripe", "Cash on delivery"]:
        raise ValueError("Unsupported payment method")

    # 2. Build order items and calculate total
    order_items = []
    order_total = Decimal("0.00")

    for item in request.items:

        product = products.get(item.product_id)

        if not product:
            raise ValueError(
                f"Product {item.product_id} does not exist"
            )

        quantity = item.quantity

        # Always use database prices, never frontend prices.
        product_price = Decimal(str(product.product_price))

        subtotal = product_price * quantity
        order_total += subtotal

        order_item = OrderItem(
            product_id=product.product_id,
            product_name=product.product_title,
            product_image=product.product_img,
            product_price=product_price,
            quantity=quantity,
            category_id=product.product_category_id,
            category=product.product_category
        )

        order_items.append(order_item)

    # 3. Determine initial order status
    if payment_method == "Cash on delivery":
        payment_status = "PENDING"
        order_status = "PLACED"

    else:
        payment_status = "PENDING"
        order_status = "PENDING_PAYMENT"

    # 4. Build delivery address
    address_data = request.delivery_address

    delivery_address = OrderDeliveryAddress(
        address_line=address_data.address_line,
        apartment=address_data.apartment or "",
        city=address_data.city,
        country=address_data.country,
        phone=address_data.phone,
        postal_code=address_data.postal_code,
        region=address_data.region
    )

    # 5. Build main order
    order = Order(
        order_number=generate_order_number(),
        customer_id=customer_id,
        payment_method=payment_method,
        total=order_total,
        payment_status=payment_status,
        order_status=order_status,

        # Stripe fields initially remain empty.
        stripe_session_id=None,
        stripe_payment_intent_id=None,

        # SQLAlchemy relationship assignment.
        items=order_items,
        delivery_address=delivery_address
    )

    return order
