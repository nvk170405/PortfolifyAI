from pymongo import MongoClient
from app.config import get_settings

settings = get_settings()

client = MongoClient(
    settings.MONGODB_URI,
    serverSelectionTimeoutMS=10000,
)
db = client[settings.MONGODB_DB_NAME]

# Collections
users_col = db["users"]
resumes_col = db["resumes"]
portfolios_col = db["portfolios"]
case_studies_col = db["case_studies"]


def ensure_indexes():
    """Create indexes — call once on startup, not at import time."""
    try:
        users_col.create_index("email", unique=True)
        resumes_col.create_index("user_id")
        portfolios_col.create_index("user_id")
        case_studies_col.create_index("user_id")
    except Exception as e:
        print(f"Warning: Could not create indexes: {e}")


def get_db():
    return db
