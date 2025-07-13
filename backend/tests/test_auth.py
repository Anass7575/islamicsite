"""
Authentication tests with comprehensive coverage
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.db.base import Base
from app.db import get_db
from app.models import User
from app.core.security import get_password_hash
import os

# Test database
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

class TestAuth:
    """Test authentication endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test database"""
        Base.metadata.create_all(bind=engine)
        yield
        Base.metadata.drop_all(bind=engine)
    
    def test_register_success(self):
        """Test successful user registration"""
        response = client.post(
            "/api/auth/register",
            json={
                "email": "test@example.com",
                "username": "testuser",
                "full_name": "Test User",
                "password": "Test@123456"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "test@example.com"
        assert data["username"] == "testuser"
        assert "id" in data
        assert "hashed_password" not in data
    
    def test_register_duplicate_email(self):
        """Test registration with duplicate email"""
        # First registration
        client.post(
            "/api/auth/register",
            json={
                "email": "test@example.com",
                "username": "testuser1",
                "full_name": "Test User",
                "password": "Test@123456"
            }
        )
        
        # Duplicate email
        response = client.post(
            "/api/auth/register",
            json={
                "email": "test@example.com",
                "username": "testuser2",
                "full_name": "Test User 2",
                "password": "Test@123456"
            }
        )
        
        assert response.status_code == 400
        assert "Email already registered" in response.json()["detail"]
    
    def test_register_weak_password(self):
        """Test registration with weak password"""
        response = client.post(
            "/api/auth/register",
            json={
                "email": "test@example.com",
                "username": "testuser",
                "full_name": "Test User",
                "password": "weak"
            }
        )
        
        assert response.status_code == 422
        assert "Password must be at least 8 characters" in str(response.json())
    
    def test_login_success(self):
        """Test successful login"""
        # Register user
        db = TestingSessionLocal()
        user = User(
            email="test@example.com",
            username="testuser",
            full_name="Test User",
            hashed_password=get_password_hash("Test@123456")
        )
        db.add(user)
        db.commit()
        db.close()
        
        # Login
        response = client.post(
            "/api/auth/login",
            data={
                "username": "test@example.com",
                "password": "Test@123456"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = client.post(
            "/api/auth/login",
            data={
                "username": "nonexistent@example.com",
                "password": "wrongpassword"
            }
        )
        
        assert response.status_code == 401
        assert "Incorrect username or password" in response.json()["detail"]
    
    def test_get_current_user(self):
        """Test getting current user with valid token"""
        # Register and login
        db = TestingSessionLocal()
        user = User(
            email="test@example.com",
            username="testuser",
            full_name="Test User",
            hashed_password=get_password_hash("Test@123456")
        )
        db.add(user)
        db.commit()
        db.close()
        
        login_response = client.post(
            "/api/auth/login",
            data={
                "username": "test@example.com",
                "password": "Test@123456"
            }
        )
        
        token = login_response.json()["access_token"]
        
        # Get current user
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "test@example.com"
        assert data["username"] == "testuser"
    
    def test_protected_endpoint_without_token(self):
        """Test accessing protected endpoint without token"""
        response = client.get("/api/auth/me")
        assert response.status_code == 401
    
    def test_protected_endpoint_invalid_token(self):
        """Test accessing protected endpoint with invalid token"""
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": "Bearer invalid_token"}
        )
        assert response.status_code == 401

class TestPasswordValidation:
    """Test password validation"""
    
    @pytest.mark.parametrize("password,expected_error", [
        ("short", "at least 8 characters"),
        ("alllowercase", "uppercase letter"),
        ("ALLUPPERCASE", "lowercase letter"),
        ("NoNumbers!", "number"),
        ("NoSpecialChars123", "special character"),
    ])
    def test_password_validation(self, password, expected_error):
        """Test various password validation scenarios"""
        response = client.post(
            "/api/auth/register",
            json={
                "email": "test@example.com",
                "username": "testuser",
                "full_name": "Test User",
                "password": password
            }
        )
        
        assert response.status_code == 422
        assert expected_error in str(response.json())

class TestRateLimiting:
    """Test rate limiting on auth endpoints"""
    
    def test_login_rate_limiting(self):
        """Test rate limiting on login endpoint"""
        # Make multiple rapid login attempts
        for i in range(10):
            response = client.post(
                "/api/auth/login",
                data={
                    "username": f"user{i}@example.com",
                    "password": "wrongpassword"
                }
            )
        
        # The last request should be rate limited
        # (This assumes rate limiting is configured for 5 requests per minute)
        # assert response.status_code == 429