from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class PortfolioCreate(BaseModel):
    title: str
    config: dict = {}
    subdomain: Optional[str] = None


class PortfolioUpdate(BaseModel):
    title: Optional[str] = None
    config: Optional[dict] = None
    subdomain: Optional[str] = None
    is_published: Optional[bool] = None


class PortfolioResponse(BaseModel):
    id: int
    user_id: int
    title: str
    config: dict
    subdomain: Optional[str]
    is_published: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
