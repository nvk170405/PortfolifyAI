from pydantic import BaseModel
from typing import List, Optional


class JDAnalyzeRequest(BaseModel):
    job_description: str
    resume_id: int


class MatchedSkill(BaseModel):
    skill: str
    found_in: str = ""


class JDAnalyzeResponse(BaseModel):
    match_score: int
    matched_skills: List[str]
    missing_skills: List[str]
    suggestions: List[dict]
