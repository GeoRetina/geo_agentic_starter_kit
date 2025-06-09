from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import analysis # Import the analysis router

app = FastAPI(
    title="GeoAgentic Python API",
    description="API for advanced geospatial analysis tasks.",
    version="0.1.0"
)

# CORS Middleware Configuration
origins = [
    "http://localhost", # Allow localhost (any port)
    "http://localhost:3000", # Explicitly allow Next.js default dev port
    # Add any other origins you might need for development/testing
    "*" # Allow all origins - BE CAREFUL IN PRODUCTION
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allow all methods (GET, POST, etc.)
    allow_headers=["*"], # Allow all headers
)

# Include routers
app.include_router(analysis.router)

@app.get("/")
async def root():
    return {
        "message": "Welcome to the GeoAgentic Python API",
        "docs_url": "/docs",
        "redoc_url": "/redoc"
    }

