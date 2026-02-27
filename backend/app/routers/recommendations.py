from fastapi import APIRouter, Depends, HTTPException
from app.database import resumes_col, portfolios_col
from app.utils.security import get_current_user
from app.services import llm_service

router = APIRouter(prefix="/api/recommendations", tags=["Recommendations"])


@router.get("")
def get_recommendations(current_user: dict = Depends(get_current_user)):
    resumes = list(resumes_col.find({"user_id": current_user["id"]}))
    portfolios = list(portfolios_col.find({"user_id": current_user["id"]}))

    resume_data = [{"title": r["title"], "content": r.get("content", {})} for r in resumes]
    portfolio_data = [{"title": p["title"], "config": p.get("config", {})} for p in portfolios]

    try:
        return llm_service.get_recommendations(resume_data, portfolio_data)
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))
