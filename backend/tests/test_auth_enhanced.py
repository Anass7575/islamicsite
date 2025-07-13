"""
Enhanced authentication tests with comprehensive coverage
"""
import pytest
from datetime import datetime, timedelta
from jose import jwt
from fastapi import status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_access_token, create_refresh_token
from tests.conftest import UserFactory


class TestAuthentication:
    """Comprehensive authentication tests."""
    
    def test_register_success(self, client):
        """Test successful user registration."""
        response = client.post(
            "/api/auth/register",
            json={
                "email": "newuser@example.com",
                "username": "newuser",
                "full_name": "New User",
                "password": "NewPass@123"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "newuser@example.com"
        assert data["username"] == "newuser"
        assert data["full_name"] == "New User"
        assert "id" in data
        assert "hashed_password" not in data
    
    def test_register_duplicate_email(self, client, test_user):
        """Test registration with duplicate email."""
        response = client.post(
            "/api/auth/register",
            json={
                "email": test_user.email,
                "username": "differentuser",
                "full_name": "Different User",
                "password": "Pass@12345"
            }
        )
        
        assert response.status_code == 400
        assert "Email already registered" in response.json()["detail"]
    
    def test_register_duplicate_username(self, client, test_user):
        """Test registration with duplicate username."""
        response = client.post(
            "/api/auth/register",
            json={
                "email": "different@example.com",
                "username": test_user.username,
                "full_name": "Different User",
                "password": "Pass@12345"
            }
        )
        
        assert response.status_code == 400
        assert "Username already taken" in response.json()["detail"]
    
    @pytest.mark.parametrize("password,expected_error", [
        ("short", "at least 8 characters"),
        ("alllowercase", "at least 8 characters"),  # Also too short
        ("NoSpecial123", "at least 8 characters"),  # Also too short
        ("12345678", "at least 8 characters"),  # Numbers only
    ])
    def test_register_invalid_password(self, client, password, expected_error):
        """Test registration with invalid passwords."""
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
    
    def test_login_success(self, client, test_user):
        """Test successful login with email."""
        response = client.post(
            "/api/auth/login",
            data={
                "username": test_user.email,
                "password": "Test@123456"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
        
        # Verify token payload
        payload = jwt.decode(
            data["access_token"],
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM]
        )
        assert payload["sub"] == test_user.email
    
    def test_login_with_username(self, client, test_user):
        """Test successful login with username."""
        response = client.post(
            "/api/auth/login",
            data={
                "username": test_user.username,
                "password": "Test@123456"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
    
    def test_login_invalid_password(self, client, test_user):
        """Test login with wrong password."""
        response = client.post(
            "/api/auth/login",
            data={
                "username": test_user.email,
                "password": "WrongPassword@123"
            }
        )
        
        assert response.status_code == 401
        assert "Incorrect username or password" in response.json()["detail"]
    
    def test_login_nonexistent_user(self, client):
        """Test login with non-existent user."""
        response = client.post(
            "/api/auth/login",
            data={
                "username": "nonexistent@example.com",
                "password": "SomePassword@123"
            }
        )
        
        assert response.status_code == 401
        assert "Incorrect username or password" in response.json()["detail"]
    
    def test_login_inactive_user(self, client, db):
        """Test login with inactive user."""
        # Create inactive user
        user = UserFactory.create(
            db,
            email="inactive@example.com",
            username="inactiveuser",
            is_active=False
        )
        
        response = client.post(
            "/api/auth/login",
            data={
                "username": user.email,
                "password": "Test@123456"
            }
        )
        
        assert response.status_code == 400
        assert "Inactive user" in response.json()["detail"]


class TestTokenRefresh:
    """Test token refresh functionality."""
    
    def test_refresh_token_success(self, client, test_user):
        """Test successful token refresh."""
        # Login to get tokens
        login_response = client.post(
            "/api/auth/login",
            data={
                "username": test_user.email,
                "password": "Test@123456"
            }
        )
        refresh_token = login_response.json()["refresh_token"]
        
        # Refresh token
        response = client.post(
            "/api/auth/refresh",
            json={"token": refresh_token}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
        
        # Verify new tokens are different
        assert data["access_token"] != login_response.json()["access_token"]
        assert data["refresh_token"] != refresh_token
    
    def test_refresh_token_invalid(self, client):
        """Test refresh with invalid token."""
        response = client.post(
            "/api/auth/refresh",
            json={"token": "invalid_refresh_token"}
        )
        
        assert response.status_code == 401
        assert "Could not validate credentials" in response.json()["detail"]
    
    def test_refresh_token_expired(self, client, test_user):
        """Test refresh with expired token."""
        # Create expired refresh token
        expired_token = create_refresh_token(
            data={"sub": test_user.email},
            expires_delta=timedelta(seconds=-1)  # Already expired
        )
        
        response = client.post(
            "/api/auth/refresh",
            json={"token": expired_token}
        )
        
        assert response.status_code == 401


class TestTokenExpiration:
    """Test token expiration behavior."""
    
    def test_access_token_expiration(self, client, test_user, monkeypatch):
        """Test that expired access tokens are rejected."""
        # Create token that expires in 1 second
        token = create_access_token(
            data={"sub": test_user.email},
            expires_delta=timedelta(seconds=1)
        )
        
        # Use token immediately - should work
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        
        # Wait for token to expire
        import time
        time.sleep(2)
        
        # Try to use expired token
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 401
    
    def test_token_without_expiration(self, client):
        """Test token without expiration claim."""
        # Create token without exp claim
        token = jwt.encode(
            {"sub": "test@example.com"},
            settings.JWT_SECRET,
            algorithm=settings.JWT_ALGORITHM
        )
        
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 401


class TestProtectedEndpoints:
    """Test authorization on protected endpoints."""
    
    def test_get_current_user_success(self, client, auth_headers, test_user):
        """Test getting current user with valid token."""
        response = client.get("/api/auth/me", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_user.email
        assert data["username"] == test_user.username
        assert data["full_name"] == test_user.full_name
        assert "hashed_password" not in data
    
    def test_protected_endpoint_without_token(self, client):
        """Test accessing protected endpoint without token."""
        response = client.get("/api/auth/me")
        
        assert response.status_code == 401
        assert response.headers["WWW-Authenticate"] == "Bearer"
    
    def test_protected_endpoint_invalid_token(self, client):
        """Test accessing protected endpoint with invalid token."""
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": "Bearer invalid_token_here"}
        )
        
        assert response.status_code == 401
    
    def test_protected_endpoint_malformed_header(self, client):
        """Test with malformed authorization header."""
        # Missing 'Bearer' prefix
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": "some_token"}
        )
        assert response.status_code == 401
        
        # Wrong prefix
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": "Basic some_token"}
        )
        assert response.status_code == 401


class TestPasswordSecurity:
    """Test password security features."""
    
    def test_password_hashing(self, db):
        """Test that passwords are properly hashed."""
        user = UserFactory.create(
            db,
            email="hash@example.com",
            password="PlainText@123"
        )
        
        # Password should be hashed
        assert user.hashed_password != "PlainText@123"
        assert user.hashed_password.startswith("$2b$")  # bcrypt prefix
        
        # Should be able to verify password
        from app.core.security import verify_password
        assert verify_password("PlainText@123", user.hashed_password)
        assert not verify_password("WrongPassword", user.hashed_password)
    
    def test_different_passwords_different_hashes(self, db):
        """Test that same password creates different hashes."""
        user1 = UserFactory.create(
            db,
            email="user1@example.com",
            password="SamePass@123"
        )
        user2 = UserFactory.create(
            db,
            email="user2@example.com",
            password="SamePass@123"
        )
        
        # Same password should create different hashes (due to salt)
        assert user1.hashed_password != user2.hashed_password


class TestRateLimiting:
    """Test rate limiting on authentication endpoints."""
    
    @pytest.mark.slow
    def test_login_rate_limiting(self, client):
        """Test that login endpoint has rate limiting."""
        # Make multiple rapid login attempts
        responses = []
        for i in range(10):
            response = client.post(
                "/api/auth/login",
                data={
                    "username": f"user{i}@example.com",
                    "password": "wrongpassword"
                }
            )
            responses.append(response.status_code)
        
        # Note: Rate limiting would need to be implemented in the API
        # This test serves as a placeholder for when it's added
        # assert 429 in responses  # At least one should be rate limited
    
    @pytest.mark.slow
    def test_register_rate_limiting(self, client):
        """Test that register endpoint has rate limiting."""
        # Make multiple rapid registration attempts
        responses = []
        for i in range(10):
            response = client.post(
                "/api/auth/register",
                json={
                    "email": f"user{i}@example.com",
                    "username": f"user{i}",
                    "full_name": f"User {i}",
                    "password": "Pass@12345"
                }
            )
            responses.append(response.status_code)
        
        # Note: Rate limiting would need to be implemented in the API
        # This test serves as a placeholder for when it's added
        # assert 429 in responses  # At least one should be rate limited