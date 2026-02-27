from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from app.database import resumes_col
from app.utils.security import get_current_user
from app.services import llm_service
from pydantic import BaseModel


router = APIRouter(prefix="/api/cover-letter", tags=["Cover Letter"])


class CoverLetterRequest(BaseModel):
    resume_id: str
    job_description: str
    company_name: str = ""


@router.post("/generate")
def generate_cover_letter(data: CoverLetterRequest, current_user: dict = Depends(get_current_user)):
    resume = resumes_col.find_one({"_id": ObjectId(data.resume_id), "user_id": current_user["id"]})
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    try:
        letter = llm_service.generate_cover_letter(
            resume.get("content", {}),
            data.job_description,
            data.company_name,
        )
        return {"cover_letter": letter}
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))
