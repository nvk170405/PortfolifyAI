from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from bson import ObjectId
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from app.database import users_col
from app.schemas.auth import UserCreate, UserLogin, UserResponse, TokenResponse
from app.utils.security import hash_password, verify_password, create_access_token, get_current_user
from app.config import get_settings
import secrets

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
settings = get_settings()


class GoogleTokenRequest(BaseModel):
    token: str


def _user_doc_to_response(user: dict) -> UserResponse:
    return UserResponse(
        id=str(user["_id"]),
        email=user["email"],
        full_name=user["full_name"],
        created_at=user.get("created_at", datetime.now(timezone.utc)),
    )


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(data: UserCreate):
    existing = users_col.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_doc = {
        "email": data.email,
        "full_name": data.full_name,
        "hashed_password": hash_password(data.password),
        "created_at": datetime.now(timezone.utc),
    }
    result = users_col.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id

    token = create_access_token({"sub": str(result.inserted_id)})
    return TokenResponse(
        access_token=token,
        user=_user_doc_to_response(user_doc),
    )


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin):
    user = users_col.find_one({"email": data.email})
    if not user or not verify_password(data.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user["_id"])})
    return TokenResponse(
        access_token=token,
        user=_user_doc_to_response(user),
    )


@router.post("/google", response_model=TokenResponse)
def google_login(data: GoogleTokenRequest):
    try:
        idinfo = id_token.verify_oauth2_token(
            data.token,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=30,
        )
    except Exception as e:
        print(f"❌ Google OAuth failed: {e}")
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {str(e)}")

    email = idinfo.get("email")
    name = idinfo.get("name", "Google User")

    if not email:
        raise HTTPException(status_code=400, detail="Google account has no email")

    user = users_col.find_one({"email": email})
    if not user:
        user_doc = {
            "email": email,
            "full_name": name,
            "hashed_password": hash_password(secrets.token_hex(32)),
            "created_at": datetime.now(timezone.utc),
        }
        result = users_col.insert_one(user_doc)
        user_doc["_id"] = result.inserted_id
        user = user_doc

    token = create_access_token({"sub": str(user["_id"])})
    return TokenResponse(
        access_token=token,
        user=_user_doc_to_response(user),
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    return _user_doc_to_response(current_user)


class ProfileUpdate(BaseModel):
    full_name: str | None = None
    email: str | None = None


@router.patch("/me", response_model=UserResponse)
def update_me(data: ProfileUpdate, current_user: dict = Depends(get_current_user)):
    update_fields = {}
    if data.full_name is not None:
        update_fields["full_name"] = data.full_name
    if data.email is not None:
        existing = users_col.find_one({"email": data.email, "_id": {"$ne": current_user["_id"]}})
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        update_fields["email"] = data.email

    if not update_fields:
        return _user_doc_to_response(current_user)

    result = users_col.find_one_and_update(
        {"_id": current_user["_id"]},
        {"$set": update_fields},
        return_document=True,
    )
    return _user_doc_to_response(result)
