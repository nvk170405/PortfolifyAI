from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ResumeCreate(BaseModel):
    title: str
    content: dict = {}


class ResumeUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[dict] = None


class ResumeResponse(BaseModel):
    id: int
    user_id: int
    title: str
    content: dict
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AISummaryRequest(BaseModel):
    job_title: str = ""
    experience_summary: str = ""
