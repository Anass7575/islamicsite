"""
Optimized hadith search endpoints using full-text search
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api import deps
from app.schemas import hadith as schemas
from app.services.search_service import SearchService

router = APIRouter()


@router.get("/search/optimized", response_model=schemas.PaginatedHadiths)
def search_hadiths_optimized(
    query: str = Query("", description="Search query"),
    db: Session = Depends(deps.get_db),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    collection_id: Optional[str] = None,
    book_id: Optional[int] = None,
    grade: Optional[str] = None,
    category: Optional[str] = None,
    language: str = Query("english", description="Search language: english, arabic, french")
) -> schemas.PaginatedHadiths:
    """
    Optimized hadith search using PostgreSQL full-text search.
    
    Features:
    - Full-text search with relevance ranking
    - Language-specific search (English, Arabic)
    - JSONB category filtering using GIN index
    - Efficient pagination
    
    Parameters:
    - query: Search terms (optional - returns all if empty)
    - language: Search language (english, arabic, french)
    - collection_id: Filter by collection
    - book_id: Filter by book
    - grade: Filter by hadith grade (sahih, hasan, etc.)
    - category: Filter by category ID
    - page: Page number
    - per_page: Results per page
    """
    search_service = SearchService(db)
    
    return search_service.search_hadiths(
        query=query,
        collection_id=collection_id,
        book_id=book_id,
        grade=grade,
        category=category,
        language=language,
        page=page,
        per_page=per_page
    )


@router.get("/search/suggestions")
def get_search_suggestions(
    query: str = Query(..., min_length=2, description="Partial search query"),
    db: Session = Depends(deps.get_db),
    language: str = Query("english", description="Search language"),
    limit: int = Query(10, ge=1, le=50)
) -> List[str]:
    """
    Get search suggestions based on partial query.
    
    Useful for autocomplete functionality.
    """
    search_service = SearchService(db)
    
    return search_service.search_suggestions(
        query=query,
        language=language,
        limit=limit
    )


@router.get("/search/popular")
def get_popular_searches(
    db: Session = Depends(deps.get_db),
    limit: int = Query(10, ge=1, le=50)
) -> List[dict]:
    """
    Get popular search terms.
    
    Returns list of popular terms with their search counts.
    """
    search_service = SearchService(db)
    
    popular = search_service.get_popular_searches(limit=limit)
    
    return [
        {"term": term, "count": count}
        for term, count in popular
    ]


@router.post("/search/rebuild-index")
def rebuild_search_index(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_superuser)
):
    """
    Rebuild search indexes (admin only).
    
    Run this after bulk imports to update search vectors.
    """
    search_service = SearchService(db)
    
    search_service.rebuild_search_indexes()
    
    return {
        "status": "success",
        "message": "Search indexes rebuilt successfully"
    }