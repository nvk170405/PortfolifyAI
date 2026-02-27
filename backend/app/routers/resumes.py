from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from typing import List
from app.database import resumes_col
from app.utils.security import get_current_user
from app.services import llm_service
from pydantic import BaseModel
from typing import Optional


class ResumeCreate(BaseModel):
    title: str
    content: dict = {}


class ResumeUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[dict] = None


class AISummaryRequest(BaseModel):
    job_title: str = ""
    experience_summary: str = ""


router = APIRouter(prefix="/api/resumes", tags=["Resumes"])


def _doc_to_response(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "user_id": doc["user_id"],
        "title": doc["title"],
        "content": doc.get("content", {}),
        "created_at": doc.get("created_at", ""),
        "updated_at": doc.get("updated_at", ""),
    }


@router.get("")
def list_resumes(current_user: dict = Depends(get_current_user)):
    resumes = resumes_col.find({"user_id": current_user["id"]})
    return [_doc_to_response(r) for r in resumes]


class EnhanceBulletRequest(BaseModel):
    bullet: str
    job_title: str = ""
    company: str = ""


@router.post("/enhance-bullet")
def enhance_bullet_endpoint(data: EnhanceBulletRequest, current_user: dict = Depends(get_current_user)):
    try:
        enhanced = llm_service.enhance_bullet(data.bullet, data.job_title, data.company)
        return {"enhanced": enhanced}
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))


class SuggestSkillsRequest(BaseModel):
    job_title: str
    current_skills: list = []
    experience_summary: str = ""


@router.post("/suggest-skills")
def suggest_skills_endpoint(data: SuggestSkillsRequest, current_user: dict = Depends(get_current_user)):
    try:
        skills = llm_service.suggest_skills(data.job_title, data.current_skills, data.experience_summary)
        return {"skills": skills}
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.post("", status_code=status.HTTP_201_CREATED)
def create_resume(data: ResumeCreate, current_user: dict = Depends(get_current_user)):
    now = datetime.now(timezone.utc)
    doc = {
        "user_id": current_user["id"],
        "title": data.title,
        "content": data.content,
        "created_at": now,
        "updated_at": now,
    }
    result = resumes_col.insert_one(doc)
    doc["_id"] = result.inserted_id
    return _doc_to_response(doc)


@router.get("/{resume_id}")
def get_resume(resume_id: str, current_user: dict = Depends(get_current_user)):
    doc = resumes_col.find_one({"_id": ObjectId(resume_id), "user_id": current_user["id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Resume not found")
    return _doc_to_response(doc)


@router.put("/{resume_id}")
def update_resume(resume_id: str, data: ResumeUpdate, current_user: dict = Depends(get_current_user)):
    update_fields = {"updated_at": datetime.now(timezone.utc)}
    if data.title is not None:
        update_fields["title"] = data.title
    if data.content is not None:
        update_fields["content"] = data.content

    result = resumes_col.find_one_and_update(
        {"_id": ObjectId(resume_id), "user_id": current_user["id"]},
        {"$set": update_fields},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Resume not found")
    return _doc_to_response(result)


@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resume(resume_id: str, current_user: dict = Depends(get_current_user)):
    result = resumes_col.delete_one({"_id": ObjectId(resume_id), "user_id": current_user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Resume not found")


@router.post("/{resume_id}/ai-summary")
def generate_ai_summary(resume_id: str, data: AISummaryRequest, current_user: dict = Depends(get_current_user)):
    doc = resumes_col.find_one({"_id": ObjectId(resume_id), "user_id": current_user["id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Resume not found")
    try:
        summary = llm_service.generate_resume_summary(data.job_title, data.experience_summary)
        return {"summary": summary}
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))
