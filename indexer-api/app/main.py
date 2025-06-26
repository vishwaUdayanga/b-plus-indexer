from fastapi import FastAPI
from app.routes import health_check_routes, dba_routes, diagnostics_routes, statistics_routes, model_trainer_routes, adim_routes, hits_routes
from app.database.base import Base
from app.database.session import b_plus_engine
from app.models import tc_query, query_log, trained_models, index_maintenance_log
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware

# Create the database tables if they don't exist
@asynccontextmanager
async def lifespan(app: FastAPI):
    # This runs before the app starts
    Base.metadata.create_all(bind=b_plus_engine)
    yield

app = FastAPI(title="Indexer API", version="1.0.0", lifespan=lifespan)

# Add CORS middleware to allow requests from the frontend
# origins = [
#     "http://localhost:3000",  
#     "https://production-frontend.com",
# ]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development; adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the health check routes
app.include_router(health_check_routes.router)

# Include the DBA routes
app.include_router(dba_routes.router)

# Include the diagnostics routes
app.include_router(diagnostics_routes.router)

# Include the statistics routes
app.include_router(statistics_routes.router)

# Include the model trainer routes
app.include_router(model_trainer_routes.router)

# Include the ADIM routes
app.include_router(adim_routes.router)

# Include the hits routes
app.include_router(hits_routes.router)