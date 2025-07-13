"""
Shared test configuration and fixtures for Al-Hidaya platform
"""
import os
import pytest
from typing import Generator
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.base import Base
from app.db import get_db
from app.models import User, HadithCollection, Hadith, HadithBook
from app.core.security import get_password_hash
from app.core.config import settings

# Test database configuration
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"

# Create test engine with StaticPool for thread safety
engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db() -> Generator[Session, None, None]:
    """Create a fresh database for each test function."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db: Session) -> Generator[TestClient, None, None]:
    """Create a test client with database override."""
    def override_get_db():
        try:
            yield db
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(db: Session) -> User:
    """Create a test user."""
    user = User(
        email="test@example.com",
        username="testuser",
        full_name="Test User",
        hashed_password=get_password_hash("Test@123456"),
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def auth_headers(client: TestClient, test_user: User) -> dict:
    """Get authentication headers with valid token."""
    response = client.post(
        "/api/auth/login",
        data={
            "username": test_user.email,
            "password": "Test@123456"
        }
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def test_hadith_collection(db: Session) -> HadithCollection:
    """Create a test hadith collection."""
    collection = HadithCollection(
        collection_id="test-bukhari",
        name="Test Sahih al-Bukhari",
        arabic_name="صحيح البخاري للاختبار",
        description="Test collection for unit tests",
        total_hadiths=100,
        total_books=10
    )
    db.add(collection)
    db.commit()
    db.refresh(collection)
    return collection


@pytest.fixture
def test_hadith_book(db: Session, test_hadith_collection: HadithCollection) -> HadithBook:
    """Create a test hadith book."""
    book = HadithBook(
        collection_id=test_hadith_collection.id,
        book_number=1,
        book_name="Book of Revelation",
        arabic_book_name="كتاب الوحي",
        hadith_count=50
    )
    db.add(book)
    db.commit()
    db.refresh(book)
    return book


@pytest.fixture
def test_hadiths(db: Session, test_hadith_collection: HadithCollection, test_hadith_book: HadithBook) -> list[Hadith]:
    """Create test hadiths with various content."""
    hadiths = [
        Hadith(
            collection_id=test_hadith_collection.id,
            book_id=test_hadith_book.id,
            hadith_number="1",
            arabic_text="إنما الأعمال بالنيات",
            english_text="Actions are judged by intentions",
            french_text="Les actions ne valent que par leurs intentions",
            narrator_chain="Umar ibn al-Khattab",
            grade="sahih",
            reference="Bukhari 1",
            categories=["faith", "intentions"]
        ),
        Hadith(
            collection_id=test_hadith_collection.id,
            book_id=test_hadith_book.id,
            hadith_number="2",
            arabic_text="طلب العلم فريضة على كل مسلم",
            english_text="Seeking knowledge is an obligation upon every Muslim",
            french_text="La recherche du savoir est une obligation pour chaque musulman",
            narrator_chain="Anas ibn Malik",
            grade="hasan",
            reference="Ibn Majah 224",
            categories=["knowledge", "education"]
        ),
        Hadith(
            collection_id=test_hadith_collection.id,
            book_id=test_hadith_book.id,
            hadith_number="3",
            arabic_text="خيركم من تعلم القرآن وعلمه",
            english_text="The best of you are those who learn the Quran and teach it",
            french_text="Les meilleurs d'entre vous sont ceux qui apprennent le Coran et l'enseignent",
            narrator_chain="Uthman ibn Affan",
            grade="sahih",
            reference="Bukhari 5027",
            categories=["quran", "education"]
        )
    ]
    
    for hadith in hadiths:
        db.add(hadith)
    
    db.commit()
    return hadiths


@pytest.fixture
def test_user_with_data(db: Session, test_user: User, test_hadiths: list[Hadith]) -> User:
    """Create a test user with associated data (favorites, bookmarks)."""
    # Add some favorites and bookmarks for the user
    # This can be expanded as needed
    return test_user


# Test data factories
class UserFactory:
    """Factory for creating test users."""
    
    @staticmethod
    def create(
        db: Session,
        email: str = "user@example.com",
        username: str = "testuser",
        password: str = "Test@123456",
        **kwargs
    ) -> User:
        user = User(
            email=email,
            username=username,
            hashed_password=get_password_hash(password),
            full_name=kwargs.get("full_name", "Test User"),
            is_active=kwargs.get("is_active", True),
            is_superuser=kwargs.get("is_superuser", False)
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user


class HadithFactory:
    """Factory for creating test hadiths."""
    
    @staticmethod
    def create(
        db: Session,
        collection: HadithCollection,
        book: HadithBook,
        hadith_number: str = "1",
        **kwargs
    ) -> Hadith:
        hadith = Hadith(
            collection_id=collection.id,
            book_id=book.id,
            hadith_number=hadith_number,
            arabic_text=kwargs.get("arabic_text", "نص عربي تجريبي"),
            english_text=kwargs.get("english_text", "Test English text"),
            french_text=kwargs.get("french_text", "Texte français de test"),
            narrator_chain=kwargs.get("narrator_chain", "Test Narrator"),
            grade=kwargs.get("grade", "sahih"),
            reference=kwargs.get("reference", f"Test {hadith_number}"),
            categories=kwargs.get("categories", [])
        )
        db.add(hadith)
        db.commit()
        db.refresh(hadith)
        return hadith


# Pytest configuration
def pytest_configure(config):
    """Configure pytest with custom markers."""
    config.addinivalue_line(
        "markers", "slow: marks tests as slow (deselect with '-m \"not slow\"')"
    )
    config.addinivalue_line(
        "markers", "integration: marks tests as integration tests"
    )


# Test utilities
def create_random_user(db: Session) -> User:
    """Create a user with random data."""
    import random
    import string
    
    random_suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
    return UserFactory.create(
        db,
        email=f"user_{random_suffix}@example.com",
        username=f"user_{random_suffix}"
    )