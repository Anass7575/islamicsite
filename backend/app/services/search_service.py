"""
Optimized search service using PostgreSQL full-text search
"""
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, and_, cast, text
from sqlalchemy.dialects.postgresql import JSONB, TSVECTOR
from app.models import Hadith, HadithCollection
from app.schemas.hadith import PaginatedHadiths


class SearchService:
    """Service for optimized hadith search using full-text search and proper indexing."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def search_hadiths(
        self,
        query: str,
        collection_id: Optional[str] = None,
        book_id: Optional[int] = None,
        grade: Optional[str] = None,
        category: Optional[str] = None,
        language: str = "english",
        page: int = 1,
        per_page: int = 20
    ) -> PaginatedHadiths:
        """
        Perform optimized hadith search using full-text search.
        
        Args:
            query: Search query
            collection_id: Filter by collection
            book_id: Filter by book
            grade: Filter by hadith grade
            category: Filter by category
            language: Search language (english, arabic, french)
            page: Page number
            per_page: Results per page
            
        Returns:
            PaginatedHadiths with search results
        """
        # Base query
        hadith_query = self.db.query(Hadith)
        
        # Apply search if query provided
        if query and query.strip():
            if language == "arabic":
                # Use Arabic full-text search
                search_query = func.plainto_tsquery('arabic', query)
                hadith_query = hadith_query.filter(
                    text("hadiths.search_vector_ar @@ plainto_tsquery('arabic', :query)")
                ).params(query=query)
                
                # Order by relevance
                hadith_query = hadith_query.order_by(
                    text("ts_rank(hadiths.search_vector_ar, plainto_tsquery('arabic', :query)) DESC")
                ).params(query=query)
                
            elif language == "english":
                # Use English full-text search
                search_query = func.plainto_tsquery('english', query)
                hadith_query = hadith_query.filter(
                    text("hadiths.search_vector_en @@ plainto_tsquery('english', :query)")
                ).params(query=query)
                
                # Order by relevance
                hadith_query = hadith_query.order_by(
                    text("ts_rank(hadiths.search_vector_en, plainto_tsquery('english', :query)) DESC")
                ).params(query=query)
                
            else:
                # Fallback to ILIKE for other languages or mixed content
                search_term = f"%{query}%"
                hadith_query = hadith_query.filter(
                    or_(
                        Hadith.english_text.ilike(search_term),
                        Hadith.arabic_text.ilike(search_term),
                        Hadith.french_text.ilike(search_term),
                        Hadith.narrator_chain.ilike(search_term),
                        Hadith.reference.ilike(search_term)
                    )
                )
        else:
            # No search query, order by hadith number
            hadith_query = hadith_query.order_by(Hadith.collection_id, Hadith.hadith_number)
        
        # Apply filters
        if collection_id:
            collection = self.db.query(HadithCollection).filter(
                HadithCollection.collection_id == collection_id
            ).first()
            if collection:
                hadith_query = hadith_query.filter(Hadith.collection_id == collection.id)
        
        if book_id:
            hadith_query = hadith_query.filter(Hadith.book_id == book_id)
        
        if grade:
            hadith_query = hadith_query.filter(Hadith.grade == grade)
        
        if category:
            # Use JSONB containment operator for category search
            hadith_query = hadith_query.filter(
                cast(Hadith.categories, JSONB).op('@>')([category])
            )
        
        # Get total count
        total = hadith_query.count()
        
        # Calculate pagination
        total_pages = (total + per_page - 1) // per_page
        offset = (page - 1) * per_page
        
        # Get paginated results
        hadiths = hadith_query.offset(offset).limit(per_page).all()
        
        return PaginatedHadiths(
            items=hadiths,
            total=total,
            page=page,
            per_page=per_page,
            pages=total_pages
        )
    
    def search_suggestions(
        self,
        query: str,
        language: str = "english",
        limit: int = 10
    ) -> List[str]:
        """
        Get search suggestions based on partial query.
        
        Args:
            query: Partial search query
            language: Search language
            limit: Maximum suggestions
            
        Returns:
            List of suggested search terms
        """
        if not query or len(query) < 2:
            return []
        
        # For now, return common search terms
        # This could be enhanced with actual term extraction from the database
        suggestions = []
        
        if language == "arabic":
            # Search Arabic text for terms starting with query
            results = self.db.execute(
                text("""
                    SELECT DISTINCT unnest(string_to_array(arabic_text, ' ')) as term
                    FROM hadiths
                    WHERE arabic_text LIKE :query
                    LIMIT :limit
                """)
            ).params(query=f"{query}%", limit=limit).fetchall()
            
            suggestions = [r[0] for r in results if r[0] and len(r[0]) > 2]
            
        else:
            # Search English text for terms
            results = self.db.execute(
                text("""
                    SELECT DISTINCT unnest(string_to_array(lower(english_text), ' ')) as term
                    FROM hadiths
                    WHERE lower(english_text) LIKE :query
                    LIMIT :limit
                """)
            ).params(query=f"{query.lower()}%", limit=limit).fetchall()
            
            suggestions = [r[0] for r in results if r[0] and len(r[0]) > 2]
        
        return suggestions[:limit]
    
    def get_popular_searches(self, limit: int = 10) -> List[Tuple[str, int]]:
        """
        Get popular search terms (placeholder for analytics).
        
        Returns:
            List of (term, count) tuples
        """
        # This would typically come from a search analytics table
        # For now, return common Islamic terms
        popular_terms = [
            ("prayer", 150),
            ("faith", 120),
            ("knowledge", 100),
            ("charity", 80),
            ("fasting", 75),
            ("hajj", 60),
            ("quran", 55),
            ("prophet", 50),
            ("patience", 45),
            ("mercy", 40)
        ]
        
        return popular_terms[:limit]
    
    def rebuild_search_indexes(self):
        """
        Rebuild search vectors for all hadiths.
        This should be run after bulk imports.
        """
        # Update English search vectors
        self.db.execute(
            text("""
                UPDATE hadiths 
                SET search_vector_en = to_tsvector('english',
                    COALESCE(english_text, '') || ' ' ||
                    COALESCE(narrator_chain, '') || ' ' ||
                    COALESCE(reference, '')
                )
            """)
        )
        
        # Update Arabic search vectors
        self.db.execute(
            text("""
                UPDATE hadiths 
                SET search_vector_ar = to_tsvector('arabic', COALESCE(arabic_text, ''))
            """)
        )
        
        self.db.commit()
        
        # Analyze tables for query optimization
        self.db.execute(text("ANALYZE hadiths"))
        self.db.commit()