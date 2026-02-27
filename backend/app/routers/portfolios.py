from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from app.database import portfolios_col
from app.utils.security import get_current_user
from app.services import llm_service
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/portfolios", tags=["Portfolios"])


class PortfolioCreate(BaseModel):
    title: str
    config: dict = {}
    subdomain: Optional[str] = None


class PortfolioUpdate(BaseModel):
    title: Optional[str] = None
    config: Optional[dict] = None
    subdomain: Optional[str] = None
    is_published: Optional[bool] = None


class GenerateBioRequest(BaseModel):
    name: str
    title: str
    skills: list = []
    experience: str = ""


def _doc_to_response(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "user_id": doc["user_id"],
        "title": doc["title"],
        "config": doc.get("config", {}),
        "subdomain": doc.get("subdomain"),
        "is_published": doc.get("is_published", False),
        "created_at": doc.get("created_at", ""),
        "updated_at": doc.get("updated_at", ""),
    }


@router.get("")
def list_portfolios(current_user: dict = Depends(get_current_user)):
    docs = portfolios_col.find({"user_id": current_user["id"]})
    return [_doc_to_response(p) for p in docs]


@router.post("/generate-bio")
def generate_bio_endpoint(data: GenerateBioRequest, current_user: dict = Depends(get_current_user)):
    try:
        result = llm_service.generate_portfolio_bio(data.name, data.title, data.skills, data.experience)
        return result
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.post("", status_code=status.HTTP_201_CREATED)
def create_portfolio(data: PortfolioCreate, current_user: dict = Depends(get_current_user)):
    now = datetime.now(timezone.utc)
    doc = {
        "user_id": current_user["id"],
        "title": data.title,
        "config": data.config,
        "subdomain": data.subdomain,
        "is_published": False,
        "created_at": now,
        "updated_at": now,
    }
    result = portfolios_col.insert_one(doc)
    doc["_id"] = result.inserted_id
    return _doc_to_response(doc)


@router.get("/{portfolio_id}")
def get_portfolio(portfolio_id: str, current_user: dict = Depends(get_current_user)):
    doc = portfolios_col.find_one({"_id": ObjectId(portfolio_id), "user_id": current_user["id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return _doc_to_response(doc)


@router.put("/{portfolio_id}")
def update_portfolio(portfolio_id: str, data: PortfolioUpdate, current_user: dict = Depends(get_current_user)):
    update_fields = {"updated_at": datetime.now(timezone.utc)}
    if data.title is not None:
        update_fields["title"] = data.title
    if data.config is not None:
        update_fields["config"] = data.config
    if data.subdomain is not None:
        update_fields["subdomain"] = data.subdomain
    if data.is_published is not None:
        update_fields["is_published"] = data.is_published

    result = portfolios_col.find_one_and_update(
        {"_id": ObjectId(portfolio_id), "user_id": current_user["id"]},
        {"$set": update_fields},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return _doc_to_response(result)


@router.delete("/{portfolio_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_portfolio(portfolio_id: str, current_user: dict = Depends(get_current_user)):
    result = portfolios_col.delete_one({"_id": ObjectId(portfolio_id), "user_id": current_user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Portfolio not found")
