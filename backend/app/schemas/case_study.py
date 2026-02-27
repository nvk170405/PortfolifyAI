from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class CaseStudyCreate(BaseModel):
    title: str
    inputs: dict = {}


class CaseStudyResponse(BaseModel):
    id: int
    user_id: int
    title: str
    inputs: dict
    generated_content: dict
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
