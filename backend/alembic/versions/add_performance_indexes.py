"""Add performance indexes for search optimization

Revision ID: add_performance_indexes
Revises: 
Create Date: 2025-07-11 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_performance_indexes'
down_revision = 'add_hadith_search_idx'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add performance indexes for search and JSONB queries."""
    
    # 1. Add GIN index for categories JSONB column
    op.create_index(
        'idx_hadith_categories_gin',
        'hadiths',
        ['categories'],
        postgresql_using='gin'
    )
    
    # 2. Add full-text search columns
    op.add_column('hadiths', sa.Column('search_vector_en', postgresql.TSVECTOR))
    op.add_column('hadiths', sa.Column('search_vector_ar', postgresql.TSVECTOR))
    
    # 3. Populate search vectors
    op.execute("""
        UPDATE hadiths 
        SET search_vector_en = to_tsvector('english', 
            COALESCE(english_text, '') || ' ' || 
            COALESCE(narrator_chain, '') || ' ' || 
            COALESCE(reference, '')
        )
    """)
    
    op.execute("""
        UPDATE hadiths 
        SET search_vector_ar = to_tsvector('arabic', COALESCE(arabic_text, ''))
    """)
    
    # 4. Create indexes for full-text search
    op.create_index(
        'idx_hadith_fts_en',
        'hadiths',
        ['search_vector_en'],
        postgresql_using='gin'
    )
    
    op.create_index(
        'idx_hadith_fts_ar',
        'hadiths',
        ['search_vector_ar'],
        postgresql_using='gin'
    )
    
    # 5. Create composite index for common queries
    op.create_index(
        'idx_hadith_collection_book_number',
        'hadiths',
        ['collection_id', 'book_id', 'hadith_number']
    )
    
    # 6. Create partial index for sahih hadiths (commonly filtered)
    op.create_index(
        'idx_hadith_sahih',
        'hadiths',
        ['collection_id', 'hadith_number'],
        postgresql_where=sa.text("grade = 'sahih'")
    )
    
    # 7. Create trigger to automatically update search vectors
    op.execute("""
        CREATE OR REPLACE FUNCTION update_hadith_search_vectors()
        RETURNS trigger AS $$
        BEGIN
            NEW.search_vector_en := to_tsvector('english',
                COALESCE(NEW.english_text, '') || ' ' ||
                COALESCE(NEW.narrator_chain, '') || ' ' ||
                COALESCE(NEW.reference, '')
            );
            NEW.search_vector_ar := to_tsvector('arabic', COALESCE(NEW.arabic_text, ''));
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    """)
    
    op.execute("""
        CREATE TRIGGER hadith_search_vector_update
        BEFORE INSERT OR UPDATE OF english_text, arabic_text, narrator_chain, reference
        ON hadiths
        FOR EACH ROW
        EXECUTE FUNCTION update_hadith_search_vectors();
    """)
    
    # 8. Add index on hadith_books for navigation queries
    op.create_index(
        'idx_hadith_book_collection_number',
        'hadith_books',
        ['collection_id', 'book_number']
    )
    
    # 9. Analyze tables for query planner
    op.execute("ANALYZE hadiths;")
    op.execute("ANALYZE hadith_books;")
    op.execute("ANALYZE hadith_collections;")


def downgrade() -> None:
    """Remove performance indexes."""
    
    # Drop triggers first
    op.execute("DROP TRIGGER IF EXISTS hadith_search_vector_update ON hadiths;")
    op.execute("DROP FUNCTION IF EXISTS update_hadith_search_vectors();")
    
    # Drop indexes
    op.drop_index('idx_hadith_book_collection_number', 'hadith_books')
    op.drop_index('idx_hadith_sahih', 'hadiths')
    op.drop_index('idx_hadith_collection_book_number', 'hadiths')
    op.drop_index('idx_hadith_fts_ar', 'hadiths')
    op.drop_index('idx_hadith_fts_en', 'hadiths')
    op.drop_index('idx_hadith_categories_gin', 'hadiths')
    
    # Drop columns
    op.drop_column('hadiths', 'search_vector_ar')
    op.drop_column('hadiths', 'search_vector_en')