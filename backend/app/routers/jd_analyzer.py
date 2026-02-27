from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from app.database import resumes_col
from app.utils.security import get_current_user
from app.services import llm_service
from pydantic import BaseModel

router = APIRouter(prefix="/api/jd-analyzer", tags=["JD Analyzer"])


class JDAnalyzeRequest(BaseModel):
    job_description: str
    resume_id: str


@router.post("/analyze")
def analyze_jd(data: JDAnalyzeRequest, current_user: dict = Depends(get_current_user)):
    resume = resumes_col.find_one({"_id": ObjectId(data.resume_id), "user_id": current_user["id"]})
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    try:
        result = llm_service.analyze_jd_match(data.job_description, resume.get("content", {}))
        return {
            "match_score": result.get("match_score", 0),
            "matched_skills": result.get("matched_skills", []),
            "missing_skills": result.get("missing_skills", []),
            "suggestions": result.get("suggestions", []),
        }
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))
