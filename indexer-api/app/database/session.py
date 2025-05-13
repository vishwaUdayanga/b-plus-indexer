from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config.settings import settings

# Create a new SQLAlchemy engine instance for the organization database
org_engine = create_engine(settings.ORG_DATABASE_URL, pool_pre_ping=True)
# Create a session factory bound to the organization database engine
OrgSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=org_engine)
# Create a new SQLAlchemy engine instance for the organization database
def get_org_db():
    """
    Dependency that provides a database session for the organization database.
    Yields a session object and ensures it is closed after use.
    """
    db = OrgSessionLocal()
    try:
        yield db
    finally:
        db.close()


# Create a new SQLAlchemy engine instance for the B+ indexer database
b_plus_engine = create_engine(settings.B_PLUS_INDEXER_DATABASE_URL, pool_pre_ping=True)
# Create a session factory bound to the B+ indexer database engine
BPlusSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=b_plus_engine)
# Create a new SQLAlchemy engine instance for the B+ indexer database
def get_b_plus_db():
    """
    Dependency that provides a database session for the B+ indexer database.
    Yields a session object and ensures it is closed after use.
    """
    db = BPlusSessionLocal()
    try:
        yield db
    finally:
        db.close()



