from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func

from app import models
from app.schemas import hadith as schemas
from app.api import deps
from app.core.config import settings
from app.services.hadith_import import HadithImporter
from app.services.hadith_audio import HadithAudioService
from app.services.hadith_export import export_hadiths_to_pdf
from app.services.search_service import SearchService
from fastapi.responses import StreamingResponse

router = APIRouter()
audio_service = HadithAudioService()


@router.get("/collections", response_model=List[schemas.HadithCollection])
def get_hadith_collections(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100
) -> List[models.HadithCollection]:
    """
    Retrieve all hadith collections.
    """
    collections = db.query(models.HadithCollection).offset(skip).limit(limit).all()
    return collections


@router.get("/collections/{collection_id}", response_model=schemas.HadithCollection)
def get_hadith_collection(
    collection_id: str,
    db: Session = Depends(deps.get_db)
) -> models.HadithCollection:
    """
    Get a specific hadith collection by ID.
    """
    collection = db.query(models.HadithCollection).filter(
        models.HadithCollection.collection_id == collection_id
    ).first()
    
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    
    return collection


@router.get("/collections/{collection_id}/books", response_model=List[schemas.HadithBook])
def get_collection_books(
    collection_id: str,
    db: Session = Depends(deps.get_db)
) -> List[models.HadithBook]:
    """
    Get all books from a specific collection.
    """
    collection = db.query(models.HadithCollection).filter(
        models.HadithCollection.collection_id == collection_id
    ).first()
    
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    
    books = db.query(models.HadithBook).filter(
        models.HadithBook.collection_id == collection.id
    ).order_by(models.HadithBook.book_number).all()
    
    return books


@router.get("/collections/{collection_id}/books/{book_number}/hadiths", response_model=schemas.PaginatedHadiths)
def get_book_hadiths(
    collection_id: str,
    book_number: int,
    db: Session = Depends(deps.get_db),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    grade: Optional[str] = None
) -> schemas.PaginatedHadiths:
    """
    Get hadiths from a specific book in a collection.
    """
    collection = db.query(models.HadithCollection).filter(
        models.HadithCollection.collection_id == collection_id
    ).first()
    
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    
    book = db.query(models.HadithBook).filter(
        models.HadithBook.collection_id == collection.id,
        models.HadithBook.book_number == book_number
    ).first()
    
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    query = db.query(models.Hadith).filter(
        models.Hadith.collection_id == collection.id,
        models.Hadith.book_id == book.id
    )
    
    if grade:
        query = query.filter(models.Hadith.grade == grade)
    
    # Get total count
    total = query.count()
    
    # Calculate pagination
    skip = (page - 1) * per_page
    hadiths = query.order_by(models.Hadith.hadith_number).offset(skip).limit(per_page).all()
    pages = (total + per_page - 1) // per_page
    
    return schemas.PaginatedHadiths(
        hadiths=hadiths,
        total=total,
        page=page,
        per_page=per_page,
        pages=pages
    )


@router.get("/collections/{collection_id}/hadiths", response_model=List[schemas.Hadith])
def get_collection_hadiths(
    collection_id: str,
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 50,
    book_number: Optional[int] = None,
    grade: Optional[str] = None,
    search: Optional[str] = None
) -> List[models.Hadith]:
    """
    Get hadiths from a specific collection with optional filters.
    """
    collection = db.query(models.HadithCollection).filter(
        models.HadithCollection.collection_id == collection_id
    ).first()
    
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    
    query = db.query(models.Hadith).filter(
        models.Hadith.collection_id == collection.id
    )
    
    # Apply filters
    if book_number:
        query = query.join(models.HadithBook).filter(
            models.HadithBook.book_number == book_number
        )
    
    if grade:
        query = query.filter(models.Hadith.grade == grade)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                models.Hadith.english_text.ilike(search_term),
                models.Hadith.french_text.ilike(search_term),
                models.Hadith.narrator_chain.ilike(search_term),
                models.Hadith.reference.ilike(search_term)
            )
        )
    
    hadiths = query.offset(skip).limit(limit).all()
    return hadiths


@router.get("/collections/{collection_id}/hadiths/paginated", response_model=schemas.PaginatedHadiths)
def get_collection_hadiths_paginated(
    collection_id: str,
    db: Session = Depends(deps.get_db),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    book_number: Optional[int] = None,
    grade: Optional[str] = None,
    search: Optional[str] = None,
    category: Optional[str] = None
) -> schemas.PaginatedHadiths:
    """
    Get paginated hadiths from a specific collection with optional filters.
    """
    collection = db.query(models.HadithCollection).filter(
        models.HadithCollection.collection_id == collection_id
    ).first()
    
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    
    query = db.query(models.Hadith).filter(
        models.Hadith.collection_id == collection.id
    )
    
    # Apply filters
    if book_number:
        query = query.join(models.HadithBook).filter(
            models.HadithBook.book_number == book_number
        )
    
    if grade:
        query = query.filter(models.Hadith.grade == grade)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                models.Hadith.english_text.ilike(search_term),
                models.Hadith.french_text.ilike(search_term),
                models.Hadith.narrator_chain.ilike(search_term),
                models.Hadith.reference.ilike(search_term)
            )
        )
    
    if category:
        # Filter by category in the JSON array
        # Use cast to jsonb for the containment operator
        from sqlalchemy import cast
        from sqlalchemy.dialects.postgresql import JSONB
        query = query.filter(
            cast(models.Hadith.categories, JSONB).op('@>')(f'["{category}"]')
        )
    
    # Get total count
    total = query.count()
    
    # Calculate pagination
    skip = (page - 1) * per_page
    hadiths = query.offset(skip).limit(per_page).all()
    pages = (total + per_page - 1) // per_page  # Ceiling division
    
    return schemas.PaginatedHadiths(
        hadiths=hadiths,
        total=total,
        page=page,
        per_page=per_page,
        pages=pages
    )


@router.get("/categories", response_model=List[schemas.HadithCategory])
def get_hadith_categories(
    db: Session = Depends(deps.get_db)
) -> List[models.HadithCategory]:
    """
    Retrieve all hadith categories.
    """
    categories = db.query(models.HadithCategory).filter(
        models.HadithCategory.parent_id == None
    ).all()
    return categories


@router.get("/categories/{category_id}/hadiths", response_model=List[schemas.Hadith])
def get_category_hadiths(
    category_id: str,
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 50,
    collection_id: Optional[str] = None,
    search: Optional[str] = None
) -> List[models.Hadith]:
    """
    Get hadiths from a specific category.
    """
    category = db.query(models.HadithCategory).filter(
        models.HadithCategory.category_id == category_id
    ).first()
    
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Query hadiths that contain this category
    query = db.query(models.Hadith).filter(
        func.json_contains(models.Hadith.categories, f'"{category_id}"')
    )
    
    if collection_id:
        collection = db.query(models.HadithCollection).filter(
            models.HadithCollection.collection_id == collection_id
        ).first()
        if collection:
            query = query.filter(models.Hadith.collection_id == collection.id)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                models.Hadith.english_text.ilike(search_term),
                models.Hadith.french_text.ilike(search_term),
                models.Hadith.narrator_chain.ilike(search_term)
            )
        )
    
    hadiths = query.offset(skip).limit(limit).all()
    return hadiths


@router.get("/stats")
def get_hadith_stats(db: Session = Depends(deps.get_db)):
    """
    Get hadith statistics.
    """
    total_count = db.query(models.Hadith).count()
    collections = db.query(models.HadithCollection).all()
    
    stats = {
        "total_hadiths": total_count,
        "collections": []
    }
    
    for collection in collections:
        count = db.query(models.Hadith).filter(
            models.Hadith.collection_id == collection.id
        ).count()
        stats["collections"].append({
            "collection_id": collection.collection_id,
            "name": collection.name,
            "hadith_count": count
        })
    
    return stats


@router.get("/search", response_model=List[schemas.Hadith])
def search_hadiths(
    query: str = Query(..., description="Search query"),
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 50,
    collection_id: Optional[str] = None,
    category_id: Optional[str] = None,
    grade: Optional[str] = None
) -> List[models.Hadith]:
    """
    Search hadiths across all collections.
    """
    # Use PostgreSQL trigram similarity for better search
    search_term = f"%{query}%"
    
    # Create base query with optimized search
    hadith_query = db.query(models.Hadith)
    
    # Apply search filters
    if len(query) >= 3:
        # For longer queries, use trigram similarity (requires pg_trgm extension)
        hadith_query = hadith_query.filter(
            or_(
                models.Hadith.english_text.ilike(search_term),
                models.Hadith.narrator_chain.ilike(search_term),
                models.Hadith.reference.ilike(search_term)
            )
        )
    else:
        # For short queries, use exact prefix matching
        hadith_query = hadith_query.filter(
            or_(
                models.Hadith.english_text.ilike(search_term),
                models.Hadith.reference.ilike(search_term)
            )
        )
    
    # Apply filters
    if collection_id:
        collection = db.query(models.HadithCollection).filter(
            models.HadithCollection.collection_id == collection_id
        ).first()
        if collection:
            hadith_query = hadith_query.filter(models.Hadith.collection_id == collection.id)
    
    if category_id:
        hadith_query = hadith_query.filter(
            func.json_contains(models.Hadith.categories, f'"{category_id}"')
        )
    
    if grade:
        hadith_query = hadith_query.filter(models.Hadith.grade == grade)
    
    # Order by relevance (most relevant first)
    hadith_query = hadith_query.order_by(models.Hadith.hadith_number)
    
    hadiths = hadith_query.offset(skip).limit(limit).all()
    return hadiths


@router.get("/search/paginated", response_model=schemas.PaginatedHadiths)
def search_hadiths_paginated(
    query: str = Query(..., description="Search query", min_length=2),
    db: Session = Depends(deps.get_db),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    collection_id: Optional[str] = None,
    grade: Optional[str] = None
) -> schemas.PaginatedHadiths:
    """
    Search hadiths with pagination and performance optimization.
    """
    search_term = f"%{query}%"
    
    # Create base query
    hadith_query = db.query(models.Hadith)
    
    # Apply optimized search
    hadith_query = hadith_query.filter(
        or_(
            models.Hadith.english_text.ilike(search_term),
            models.Hadith.narrator_chain.ilike(search_term),
            models.Hadith.reference.ilike(search_term)
        )
    )
    
    # Apply filters
    if collection_id:
        collection = db.query(models.HadithCollection).filter(
            models.HadithCollection.collection_id == collection_id
        ).first()
        if collection:
            hadith_query = hadith_query.filter(models.Hadith.collection_id == collection.id)
    
    if grade:
        hadith_query = hadith_query.filter(models.Hadith.grade == grade)
    
    # Get total count
    total = hadith_query.count()
    
    # Calculate pagination
    skip = (page - 1) * per_page
    hadiths = hadith_query.order_by(models.Hadith.hadith_number).offset(skip).limit(per_page).all()
    pages = (total + per_page - 1) // per_page
    
    return schemas.PaginatedHadiths(
        hadiths=hadiths,
        total=total,
        page=page,
        per_page=per_page,
        pages=pages
    )


@router.get("/daily", response_model=schemas.Hadith)
def get_daily_hadith(
    db: Session = Depends(deps.get_db)
) -> models.Hadith:
    """
    Get the hadith of the day.
    Uses date-based selection to ensure the same hadith for the entire day.
    """
    from datetime import date
    
    # Get today's date
    today = date.today()
    
    # Use date as seed for consistent selection
    day_number = (today - date(2024, 1, 1)).days
    
    # Get total hadith count
    total_count = db.query(models.Hadith).filter(
        models.Hadith.grade == "sahih"  # Only authentic hadiths
    ).count()
    
    if total_count == 0:
        raise HTTPException(status_code=404, detail="No hadiths available")
    
    # Select hadith based on day number
    hadith_index = day_number % total_count
    
    hadith = db.query(models.Hadith).filter(
        models.Hadith.grade == "sahih"
    ).offset(hadith_index).limit(1).first()
    
    if not hadith:
        # Fallback to first sahih hadith
        hadith = db.query(models.Hadith).filter(
            models.Hadith.grade == "sahih"
        ).first()
    
    if not hadith:
        raise HTTPException(status_code=404, detail="No hadith found")
    
    return hadith


@router.get("/{hadith_id}", response_model=schemas.Hadith)
def get_hadith(
    hadith_id: int,
    db: Session = Depends(deps.get_db)
) -> models.Hadith:
    """
    Get a specific hadith by ID.
    """
    hadith = db.query(models.Hadith).filter(models.Hadith.id == hadith_id).first()
    
    if not hadith:
        raise HTTPException(status_code=404, detail="Hadith not found")
    
    return hadith


@router.post("/{hadith_id}/notes", response_model=schemas.HadithNote)
def create_hadith_note(
    hadith_id: int,
    note: schemas.HadithNoteCreate,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
) -> models.HadithNote:
    """
    Create a note for a hadith.
    """
    # Check if hadith exists
    hadith = db.query(models.Hadith).filter(models.Hadith.id == hadith_id).first()
    if not hadith:
        raise HTTPException(status_code=404, detail="Hadith not found")
    
    # Check if user already has a note for this hadith
    existing_note = db.query(models.HadithNote).filter(
        and_(
            models.HadithNote.user_id == current_user.id,
            models.HadithNote.hadith_id == hadith_id
        )
    ).first()
    
    if existing_note:
        # Update existing note
        existing_note.note_text = note.note_text
        existing_note.is_private = note.is_private
        db.commit()
        db.refresh(existing_note)
        return existing_note
    
    # Create new note
    db_note = models.HadithNote(
        user_id=current_user.id,
        hadith_id=hadith_id,
        **note.dict()
    )
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note


@router.get("/{hadith_id}/notes", response_model=List[schemas.HadithNote])
def get_hadith_notes(
    hadith_id: int,
    db: Session = Depends(deps.get_db),
    current_user: Optional[models.User] = Depends(deps.get_current_user)
) -> List[models.HadithNote]:
    """
    Get notes for a hadith (public notes + user's private notes).
    """
    query = db.query(models.HadithNote).filter(
        models.HadithNote.hadith_id == hadith_id
    )
    
    if current_user:
        # Show public notes and user's own notes
        query = query.filter(
            or_(
                models.HadithNote.is_private == False,
                models.HadithNote.user_id == current_user.id
            )
        )
    else:
        # Only show public notes
        query = query.filter(models.HadithNote.is_private == False)
    
    notes = query.all()
    return notes


@router.delete("/{hadith_id}/notes")
def delete_hadith_note(
    hadith_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    """
    Delete user's note for a hadith.
    """
    note = db.query(models.HadithNote).filter(
        and_(
            models.HadithNote.user_id == current_user.id,
            models.HadithNote.hadith_id == hadith_id
        )
    ).first()
    
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    db.delete(note)
    db.commit()
    
    return {"detail": "Note deleted successfully"}


@router.post("/import", status_code=202)
async def import_hadiths(
    background_tasks: BackgroundTasks,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_superuser)
):
    """
    Import hadiths from sunnah.com API (admin only).
    This runs as a background task.
    """
    async def run_import_task():
        importer = HadithImporter(db)
        await importer.import_all_collections()
    
    background_tasks.add_task(run_import_task)
    
    return {
        "detail": "Hadith import started in background. This may take several minutes.",
        "status": "processing"
    }


@router.get("/{hadith_id}/audio")
async def get_hadith_audio(
    hadith_id: int,
    db: Session = Depends(deps.get_db)
):
    """
    Get audio URL for a hadith.
    """
    hadith = db.query(models.Hadith).filter(models.Hadith.id == hadith_id).first()
    
    if not hadith:
        raise HTTPException(status_code=404, detail="Hadith not found")
    
    # Try to get audio URL
    audio_url = await audio_service.generate_audio_url(
        hadith.arabic_text, 
        str(hadith_id)
    )
    
    return {
        "hadith_id": hadith_id,
        "audio_url": audio_url,
        "text": hadith.arabic_text,
        "fallback": "browser_tts"  # Indicates to use browser TTS if no URL
    }


@router.get("/export/pdf")
def export_hadith_pdf(
    db: Session = Depends(deps.get_db),
    collection_id: Optional[str] = None,
    hadith_ids: Optional[str] = None,
    limit: int = Query(100, le=500)
):
    """
    Export hadiths to PDF format.
    
    - collection_id: Export hadiths from a specific collection
    - hadith_ids: Comma-separated list of hadith IDs to export
    - limit: Maximum number of hadiths to export (max 500)
    """
    from datetime import datetime
    
    # Parse collection
    collection_db_id = None
    if collection_id:
        collection = db.query(models.HadithCollection).filter(
            models.HadithCollection.collection_id == collection_id
        ).first()
        if collection:
            collection_db_id = collection.id
    
    # Parse hadith IDs
    hadith_id_list = None
    if hadith_ids:
        try:
            hadith_id_list = [int(id.strip()) for id in hadith_ids.split(',')]
        except:
            raise HTTPException(status_code=400, detail="Invalid hadith IDs format")
    
    # Generate PDF
    pdf_buffer = export_hadiths_to_pdf(
        db=db,
        collection_id=collection_db_id,
        hadith_ids=hadith_id_list,
        limit=limit
    )
    
    # Return as streaming response
    filename = f"hadiths_{collection_id or 'export'}_{datetime.now().strftime('%Y%m%d')}.pdf"
    
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )