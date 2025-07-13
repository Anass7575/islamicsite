"""
Configuration optimisée de la base de données avec connection pooling
"""
from sqlalchemy import create_engine, event, pool
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import NullPool, QueuePool
from app.core.config import settings
import logging
from contextlib import contextmanager
from typing import Generator

logger = logging.getLogger(__name__)

# Configuration du pool de connexions optimisé
POOL_SIZE = 20  # Nombre de connexions dans le pool
MAX_OVERFLOW = 40  # Connexions supplémentaires autorisées
POOL_TIMEOUT = 30  # Timeout pour obtenir une connexion
POOL_RECYCLE = 3600  # Recycler les connexions après 1 heure
POOL_PRE_PING = True  # Vérifier les connexions avant utilisation

# Créer l'engine avec pooling optimisé
if settings.ENVIRONMENT == "test":
    # Pour les tests, utiliser NullPool
    engine = create_engine(
        settings.DATABASE_URL,
        poolclass=NullPool,
        echo=False,
    )
else:
    # Pour production/dev, utiliser QueuePool optimisé
    engine = create_engine(
        settings.DATABASE_URL,
        poolclass=QueuePool,
        pool_size=POOL_SIZE,
        max_overflow=MAX_OVERFLOW,
        pool_timeout=POOL_TIMEOUT,
        pool_recycle=POOL_RECYCLE,
        pool_pre_ping=POOL_PRE_PING,
        echo=False,
        # Optimisations PostgreSQL
        connect_args={
            "connect_timeout": 10,
            "keepalives": 1,
            "keepalives_idle": 30,
            "keepalives_interval": 10,
            "keepalives_count": 5,
            "options": "-c statement_timeout=30000"  # 30 secondes
        },
        # Optimisations de performance
        query_cache_size=1200,
        echo_pool=False,
    )

# Event listeners pour optimisation
@event.listens_for(engine, "connect")
def set_postgresql_options(dbapi_connection, connection_record):
    """Configure les options PostgreSQL pour chaque connexion."""
    with dbapi_connection.cursor() as cursor:
        # Optimisations de performance PostgreSQL
        cursor.execute("SET jit = 'on'")
        cursor.execute("SET random_page_cost = 1.1")
        cursor.execute("SET effective_cache_size = '4GB'")
        cursor.execute("SET shared_buffers = '256MB'")
        cursor.execute("SET work_mem = '16MB'")
        cursor.execute("SET maintenance_work_mem = '128MB'")
        
        # Optimisations pour les requêtes
        cursor.execute("SET enable_seqscan = 'on'")
        cursor.execute("SET enable_indexscan = 'on'")
        cursor.execute("SET enable_bitmapscan = 'on'")
        cursor.execute("SET enable_hashjoin = 'on'")
        cursor.execute("SET enable_mergejoin = 'on'")
        
    logger.info("PostgreSQL connection configured with optimizations")

@event.listens_for(engine, "checkout")
def ping_connection(dbapi_connection, connection_record, connection_proxy):
    """Vérifier que la connexion est valide avant utilisation."""
    cursor = dbapi_connection.cursor()
    try:
        cursor.execute("SELECT 1")
    except:
        # Connexion invalide, sera recréée automatiquement
        raise pool.DisconnectionError()
    cursor.close()

# SessionLocal optimisé
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False,  # Éviter les requêtes supplémentaires après commit
)

# Base class
Base = declarative_base()

# Dependency optimisée pour obtenir une session DB
def get_db() -> Generator[Session, None, None]:
    """
    Dependency pour obtenir une session de base de données.
    Utilise le connection pooling automatiquement.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Context manager pour utilisation manuelle
@contextmanager
def get_db_session() -> Generator[Session, None, None]:
    """
    Context manager pour obtenir une session de base de données.
    Usage:
        with get_db_session() as db:
            # Utiliser db
    """
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

# Fonctions utilitaires pour monitoring
def get_pool_status() -> dict:
    """Obtenir le statut du pool de connexions."""
    pool = engine.pool
    return {
        "size": pool.size(),
        "checked_in_connections": pool.checkedin(),
        "checked_out_connections": pool.checkedout(),
        "overflow": pool.overflow(),
        "total": pool.size() + pool.overflow(),
        "configuration": {
            "pool_size": POOL_SIZE,
            "max_overflow": MAX_OVERFLOW,
            "timeout": POOL_TIMEOUT,
            "recycle": POOL_RECYCLE,
        }
    }

def reset_pool():
    """Réinitialiser le pool de connexions."""
    engine.dispose()
    logger.info("Connection pool reset")

# Configuration des requêtes pour éviter les locks
def configure_session_for_read_only(session: Session):
    """Configure une session pour des requêtes read-only."""
    session.execute("SET TRANSACTION READ ONLY")
    session.execute("SET SESSION CHARACTERISTICS AS TRANSACTION READ ONLY")

def configure_session_for_bulk_operations(session: Session):
    """Configure une session pour des opérations bulk."""
    session.execute("SET synchronous_commit = 'off'")
    session.execute("SET work_mem = '256MB'")
    session.execute("SET maintenance_work_mem = '512MB'")