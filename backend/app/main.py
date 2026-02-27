import traceback
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.database import ensure_indexes
from app.routers import auth, resumes, portfolios, case_studies, jd_analyzer, recommendations, cover_letter


@asynccontextmanager
async def lifespan(app: FastAPI):
    ensure_indexes()
    print("✓ MongoDB indexes ensured")
    yield


app = FastAPI(
    title="PortfolifyAI API",
    description="Backend API for the AI Portfolio & Resume Builder",
    version="1.0.0",
    lifespan=lifespan,
)


# Global exception handler — catches unhandled errors and logs them
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"❌ UNHANDLED ERROR on {request.method} {request.url.path}:")
    traceback.print_exception(exc)
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
    )


# CORS — allow the Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(resumes.router)
app.include_router(portfolios.router)
app.include_router(case_studies.router)
app.include_router(jd_analyzer.router)
app.include_router(recommendations.router)
app.include_router(cover_letter.router)


@app.get("/")
def root():
    return {"message": "PortfolifyAI API is running", "docs": "/docs"}
