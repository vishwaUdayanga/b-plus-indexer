from fastapi import FastAPI
from app.routes import health_check_routes, dba_routes
from app.database.base import Base
from app.database.session import b_plus_engine
from app.models import tc_query, query_log
from contextlib import asynccontextmanager

# Create the database tables if they don't exist
@asynccontextmanager
async def lifespan(app: FastAPI):
    # This runs before the app starts
    Base.metadata.create_all(bind=b_plus_engine)
    yield

app = FastAPI(title="Indexer API", version="1.0.0", lifespan=lifespan)

# Include the health check routes
app.include_router(health_check_routes.router)

# Include the DBA routes
app.include_router(dba_routes.router)