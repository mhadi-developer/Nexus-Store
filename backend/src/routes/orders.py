from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ..database import get_db
from ..modals import Order
from ..schema import OrderCreateRequest
from ..services.order_services import process_checkout
from ..auth import current_user


router = APIRouter(tags=["Orders"])


@router.get("/orders")
async def list_orders(
    login_user: current_user,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Order)
        .where(Order.customer_id == login_user.id)
        .order_by(Order.created_at.desc(), Order.id.desc())
    )
    orders = result.scalars().all()

    return [
        {
            "order_id": order.id,
            "order_number": order.order_number,
            "order_status": order.order_status,
            "created_at": order.created_at,
        }
        for order in orders
    ]


@router.get("/orders/{order_id}")
async def get_order(
    order_id: int,
    login_user: current_user,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Order)
        .options(
            selectinload(Order.items),
            selectinload(Order.delivery_address),
        )
        .where(
            Order.id == order_id,
            Order.customer_id == login_user.id,
        )
    )
    order = result.scalar_one_or_none()
    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    address = order.delivery_address
    return {
        "order_id": order.id,
        "order_number": order.order_number,
        "order_status": order.order_status,
        "payment_method": order.payment_method,
        "payment_status": order.payment_status,
        "created_at": order.created_at,
        "customer": {
            "name": f"{login_user.firstName} {login_user.lastName}".strip(),
            "email": login_user.email,
        },
        "delivery_address": (
            {
                "address_line": address.address_line,
                "apartment": address.apartment,
                "city": address.city,
                "region": address.region,
                "postal_code": address.postal_code,
                "country": address.country,
                "phone": address.phone,
            }
            if address
            else None
        ),
        "items": [
            {
                "product_id": item.product_id,
                "name": item.product_name,
                "image": item.product_image,
                "price": str(item.product_price),
                "quantity": item.quantity,
                "category": item.category,
                "category_id": item.category_id,
                "line_total": str(item.product_price * item.quantity),
            }
            for item in order.items
        ],
        "total": str(order.total),
    }


@router.post(
    "/checkout",
    status_code=status.HTTP_200_OK
)
async def checkout(
    request: OrderCreateRequest,
    current_user: current_user,
    db: AsyncSession = Depends(get_db),
):
    return await process_checkout(
        request=request,
        customer_id=current_user.id,
        db=db
    )