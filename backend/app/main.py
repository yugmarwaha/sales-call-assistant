from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import calls

app = FastAPI(title="Sales Call Assistant API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(calls.router)


@app.get("/")
async def root():
    return {"message": "Sales Call Assistant API is running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
