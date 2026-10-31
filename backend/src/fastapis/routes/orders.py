from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..schema import OrderCreateRequest
from ..services.order_services import process_checkout
from ..auth import current_user


router = APIRouter(tags=["Orders"])


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