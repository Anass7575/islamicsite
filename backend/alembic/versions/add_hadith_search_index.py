"""Add full-text search index for hadiths

Revision ID: add_hadith_search_idx
Revises: 
Create Date: 2025-07-09 20:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_hadith_search_idx'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create GIN indexes for full-text search on hadith texts
    op.execute("""
        CREATE EXTENSION IF NOT EXISTS pg_trgm;
        
        -- Create GIN indexes for trigram similarity search
        CREATE INDEX IF NOT EXISTS idx_hadith_english_text_gin 
        ON hadiths USING gin (english_text gin_trgm_ops);
        
        CREATE INDEX IF NOT EXISTS idx_hadith_arabic_text_gin 
        ON hadiths USING gin (arabic_text gin_trgm_ops);
        
        CREATE INDEX IF NOT EXISTS idx_hadith_narrator_chain_gin 
        ON hadiths USING gin (narrator_chain gin_trgm_ops);
        
        -- Create index on collection_id for faster filtering
        CREATE INDEX IF NOT EXISTS idx_hadith_collection_id 
        ON hadiths (collection_id);
        
        -- Create composite index for common queries
        CREATE INDEX IF NOT EXISTS idx_hadith_collection_number 
        ON hadiths (collection_id, hadith_number);
        
        -- Create index on grade for filtering
        CREATE INDEX IF NOT EXISTS idx_hadith_grade 
        ON hadiths (grade);
    """)


def downgrade() -> None:
    # Drop indexes
    op.execute("""
        DROP INDEX IF EXISTS idx_hadith_english_text_gin;
        DROP INDEX IF EXISTS idx_hadith_arabic_text_gin;
        DROP INDEX IF EXISTS idx_hadith_narrator_chain_gin;
        DROP INDEX IF EXISTS idx_hadith_collection_id;
        DROP INDEX IF EXISTS idx_hadith_collection_number;
        DROP INDEX IF EXISTS idx_hadith_grade;
    """)