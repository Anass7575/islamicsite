"""Tests for repository pattern implementations."""

import pytest
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.base_class import Base
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate, UserUpdate


# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture
def db():
    """Create a fresh database for each test."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture
def user_repo(db):
    """Create a UserRepository instance."""
    return UserRepository(db)


@pytest.fixture
def sample_user_data():
    """Sample user data for testing."""
    return UserCreate(
        email="test@example.com",
        username="testuser",
        password="securepassword123",
        full_name="Test User"
    )


class TestUserRepository:
    """Test cases for UserRepository."""
    
    def test_create_user(self, user_repo, sample_user_data):
        """Test user creation."""
        user = user_repo.create_user(sample_user_data)
        
        assert user.email == sample_user_data.email
        assert user.username == sample_user_data.username
        assert user.full_name == sample_user_data.full_name
        assert user.hashed_password != sample_user_data.password
        assert user.is_active is True
        assert user.is_superuser is False
    
    def test_get_by_email(self, user_repo, sample_user_data):
        """Test getting user by email."""
        created_user = user_repo.create_user(sample_user_data)
        
        found_user = user_repo.get_by_email(sample_user_data.email)
        
        assert found_user is not None
        assert found_user.id == created_user.id
        assert found_user.email == sample_user_data.email
    
    def test_get_by_username(self, user_repo, sample_user_data):
        """Test getting user by username."""
        created_user = user_repo.create_user(sample_user_data)
        
        found_user = user_repo.get_by_username(sample_user_data.username)
        
        assert found_user is not None
        assert found_user.id == created_user.id
        assert found_user.username == sample_user_data.username
    
    def test_get_by_email_or_username(self, user_repo, sample_user_data):
        """Test getting user by email or username."""
        created_user = user_repo.create_user(sample_user_data)
        
        # Test with matching email
        found_user = user_repo.get_by_email_or_username(
            sample_user_data.email, "wrongusername"
        )
        assert found_user is not None
        assert found_user.id == created_user.id
        
        # Test with matching username
        found_user = user_repo.get_by_email_or_username(
            "wrong@email.com", sample_user_data.username
        )
        assert found_user is not None
        assert found_user.id == created_user.id
        
        # Test with no match
        found_user = user_repo.get_by_email_or_username(
            "wrong@email.com", "wrongusername"
        )
        assert found_user is None
    
    def test_authenticate_success(self, user_repo, sample_user_data):
        """Test successful authentication."""
        user_repo.create_user(sample_user_data)
        
        # Authenticate with email
        authenticated_user = user_repo.authenticate(
            sample_user_data.email, sample_user_data.password
        )
        assert authenticated_user is not None
        
        # Authenticate with username
        authenticated_user = user_repo.authenticate(
            sample_user_data.username, sample_user_data.password
        )
        assert authenticated_user is not None
    
    def test_authenticate_failure(self, user_repo, sample_user_data):
        """Test failed authentication."""
        user_repo.create_user(sample_user_data)
        
        # Wrong password
        authenticated_user = user_repo.authenticate(
            sample_user_data.email, "wrongpassword"
        )
        assert authenticated_user is None
        
        # Non-existent user
        authenticated_user = user_repo.authenticate(
            "nonexistent@email.com", sample_user_data.password
        )
        assert authenticated_user is None
    
    def test_update_user(self, user_repo, sample_user_data):
        """Test user update."""
        user = user_repo.create_user(sample_user_data)
        
        update_data = UserUpdate(
            full_name="Updated Name",
            password="newpassword123"
        )
        
        updated_user = user_repo.update_user(user, update_data)
        
        assert updated_user.full_name == "Updated Name"
        assert updated_user.hashed_password != user.hashed_password
        
        # Verify new password works
        authenticated = user_repo.authenticate(
            sample_user_data.email, "newpassword123"
        )
        assert authenticated is not None
    
    def test_activate_deactivate_user(self, user_repo, sample_user_data):
        """Test user activation and deactivation."""
        user = user_repo.create_user(sample_user_data)
        assert user.is_active is True
        
        # Deactivate
        deactivated_user = user_repo.deactivate_user(user)
        assert deactivated_user.is_active is False
        
        # Activate
        activated_user = user_repo.activate_user(deactivated_user)
        assert activated_user.is_active is True
    
    def test_search_users(self, user_repo):
        """Test user search functionality."""
        # Create multiple users
        users_data = [
            UserCreate(
                email="john.doe@example.com",
                username="johndoe",
                password="password123",
                full_name="John Doe"
            ),
            UserCreate(
                email="jane.smith@example.com",
                username="janesmith",
                password="password123",
                full_name="Jane Smith"
            ),
            UserCreate(
                email="bob.johnson@example.com",
                username="bobjohnson",
                password="password123",
                full_name="Bob Johnson"
            )
        ]
        
        for user_data in users_data:
            user_repo.create_user(user_data)
        
        # Search by name
        results = user_repo.search_users("John")
        assert len(results) == 2  # John Doe and Bob Johnson
        
        # Search by email
        results = user_repo.search_users("jane")
        assert len(results) == 1
        assert results[0].username == "janesmith"
        
        # Search by username
        results = user_repo.search_users("doe")
        assert len(results) == 1
        assert results[0].username == "johndoe"
    
    def test_get_recent_users(self, user_repo, sample_user_data):
        """Test getting recent users."""
        # Create a user
        user = user_repo.create_user(sample_user_data)
        
        # Get users from last 7 days
        recent_users = user_repo.get_recent_users(days=7)
        assert len(recent_users) == 1
        assert recent_users[0].id == user.id
        
        # Manually update created_at to 8 days ago (would need direct DB access)
        # This is a limitation of the test - in real scenario would mock datetime
        
    def test_count_methods(self, user_repo):
        """Test various counting methods."""
        # Create users with different roles
        users_data = [
            UserCreate(
                email=f"user{i}@example.com",
                username=f"user{i}",
                password="password123",
                full_name=f"User {i}",
                role="user" if i < 3 else "admin"
            )
            for i in range(5)
        ]
        
        for user_data in users_data:
            user = user_repo.create_user(user_data)
            if users_data.index(user_data) == 4:
                user_repo.deactivate_user(user)
        
        # Test counts
        assert user_repo.count() == 5
        assert user_repo.count_active_users() == 4
        assert user_repo.count_by_role("user") == 3
        assert user_repo.count_by_role("admin") == 2
    
    def test_delete_user(self, user_repo, sample_user_data):
        """Test user deletion."""
        user = user_repo.create_user(sample_user_data)
        user_id = user.id
        
        # Delete user
        deleted_user = user_repo.delete(id=user_id)
        assert deleted_user is not None
        assert deleted_user.id == user_id
        
        # Verify user is deleted
        found_user = user_repo.get(user_id)
        assert found_user is None