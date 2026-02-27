from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from app.database import case_studies_col
from app.utils.security import get_current_user
from app.services import llm_service
from pydantic import BaseModel

router = APIRouter(prefix="/api/case-studies", tags=["Case Studies"])


class CaseStudyCreate(BaseModel):
    title: str
    inputs: dict = {}


def _doc_to_response(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "user_id": doc["user_id"],
        "title": doc["title"],
        "inputs": doc.get("inputs", {}),
        "generated_content": doc.get("generated_content", {}),
        "created_at": doc.get("created_at", ""),
        "updated_at": doc.get("updated_at", ""),
    }


@router.get("")
def list_case_studies(current_user: dict = Depends(get_current_user)):
    docs = case_studies_col.find({"user_id": current_user["id"]})
    return [_doc_to_response(cs) for cs in docs]


@router.post("", status_code=status.HTTP_201_CREATED)
def create_case_study(data: CaseStudyCreate, current_user: dict = Depends(get_current_user)):
    now = datetime.now(timezone.utc)
    doc = {
        "user_id": current_user["id"],
        "title": data.title,
        "inputs": data.inputs,
        "generated_content": {},
        "created_at": now,
        "updated_at": now,
    }
    result = case_studies_col.insert_one(doc)
    doc["_id"] = result.inserted_id
    return _doc_to_response(doc)


@router.post("/{case_study_id}/generate")
def generate_case_study(case_study_id: str, current_user: dict = Depends(get_current_user)):
    doc = case_studies_col.find_one({"_id": ObjectId(case_study_id), "user_id": current_user["id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Case study not found")

    try:
        generated = llm_service.generate_case_study(doc.get("inputs", {}))
        case_studies_col.update_one(
            {"_id": doc["_id"]},
            {"$set": {"generated_content": generated, "updated_at": datetime.now(timezone.utc)}},
        )
        doc["generated_content"] = generated
        return _doc_to_response(doc)
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))
