"""
Comprehensive search functionality tests
"""
import pytest
from sqlalchemy.orm import Session
from tests.conftest import HadithFactory


class TestHadithSearch:
    """Test hadith search functionality."""
    
    def test_search_english_text(self, client, test_hadiths):
        """Test searching in English text."""
        response = client.get("/api/hadith/search?query=knowledge")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["english_text"] == "Seeking knowledge is an obligation upon every Muslim"
    
    def test_search_arabic_text(self, client, test_hadiths):
        """Test searching in Arabic text."""
        response = client.get("/api/hadith/search?query=العلم")
        
        assert response.status_code == 200
        data = response.json()
        # Note: Arabic search might not work without proper configuration
        # This test documents expected behavior
        assert isinstance(data, list)
    
    def test_search_narrator_chain(self, client, test_hadiths):
        """Test searching in narrator chain."""
        response = client.get("/api/hadith/search?query=Umar")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert any("Umar" in h["narrator_chain"] for h in data)
    
    def test_search_reference(self, client, test_hadiths):
        """Test searching in reference field."""
        response = client.get("/api/hadith/search?query=Bukhari")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 2  # Multiple hadiths have Bukhari in reference
    
    def test_search_case_insensitive(self, client, test_hadiths):
        """Test that search is case-insensitive."""
        # Search lowercase
        response1 = client.get("/api/hadith/search?query=knowledge")
        # Search uppercase
        response2 = client.get("/api/hadith/search?query=KNOWLEDGE")
        
        assert response1.status_code == 200
        assert response2.status_code == 200
        assert len(response1.json()) == len(response2.json())
    
    def test_search_partial_match(self, client, test_hadiths):
        """Test partial word matching."""
        response = client.get("/api/hadith/search?query=oblig")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert "obligation" in data[0]["english_text"]
    
    def test_search_empty_query(self, client, test_hadiths):
        """Test search with empty query."""
        response = client.get("/api/hadith/search?query=")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == len(test_hadiths)  # Returns all hadiths
    
    def test_search_no_results(self, client, test_hadiths):
        """Test search with no matching results."""
        response = client.get("/api/hadith/search?query=nonexistentterm")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 0
    
    def test_search_special_characters(self, client, test_hadiths):
        """Test search with special characters."""
        # Test with quotes
        response = client.get('/api/hadith/search?query="Actions are"')
        assert response.status_code == 200
        
        # Test with Arabic special characters
        response = client.get("/api/hadith/search?query=الأعمال")
        assert response.status_code == 200
    
    def test_search_multiple_words(self, client, test_hadiths):
        """Test search with multiple words."""
        response = client.get("/api/hadith/search?query=learn Quran")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert any("Quran" in h["english_text"] for h in data)


class TestSearchFilters:
    """Test search with various filters."""
    
    def test_search_by_collection(self, client, test_hadiths, test_hadith_collection):
        """Test filtering search by collection."""
        response = client.get(
            f"/api/hadith/search?query=knowledge&collection={test_hadith_collection.collection_id}"
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
    
    def test_search_by_grade(self, client, test_hadiths):
        """Test filtering search by hadith grade."""
        response = client.get("/api/hadith/search?query=&grade=sahih")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2  # Two sahih hadiths in test data
        assert all(h["grade"] == "sahih" for h in data)
    
    def test_search_by_category(self, client, test_hadiths):
        """Test filtering search by category."""
        response = client.get("/api/hadith/search?query=&category=education")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2  # Two hadiths with education category
        assert all("education" in h["categories"] for h in data)
    
    def test_search_combined_filters(self, client, test_hadiths):
        """Test search with multiple filters combined."""
        response = client.get("/api/hadith/search?query=Quran&grade=sahih&category=education")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["grade"] == "sahih"
        assert "education" in data[0]["categories"]
        assert "Quran" in data[0]["english_text"]


class TestPaginatedSearch:
    """Test paginated search functionality."""
    
    def test_paginated_search_default(self, client, test_hadiths):
        """Test paginated search with default parameters."""
        response = client.get("/api/hadith/search/paginated?query=")
        
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert "page" in data
        assert "per_page" in data
        assert "pages" in data
        
        assert data["total"] == len(test_hadiths)
        assert data["page"] == 1
        assert data["per_page"] == 20
    
    def test_paginated_search_custom_page_size(self, client, db, test_hadith_collection, test_hadith_book):
        """Test paginated search with custom page size."""
        # Create more hadiths for pagination
        for i in range(10):
            HadithFactory.create(
                db,
                test_hadith_collection,
                test_hadith_book,
                hadith_number=str(i + 10),
                english_text=f"Test hadith {i}"
            )
        
        response = client.get("/api/hadith/search/paginated?query=&per_page=5")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 5
        assert data["per_page"] == 5
        assert data["pages"] == 3  # 13 total hadiths / 5 per page
    
    def test_paginated_search_page_navigation(self, client, db, test_hadith_collection, test_hadith_book):
        """Test navigating through pages."""
        # Create more hadiths
        for i in range(10):
            HadithFactory.create(
                db,
                test_hadith_collection,
                test_hadith_book,
                hadith_number=str(i + 10),
                english_text=f"Page test hadith {i}"
            )
        
        # Get page 2
        response = client.get("/api/hadith/search/paginated?query=&page=2&per_page=5")
        
        assert response.status_code == 200
        data = response.json()
        assert data["page"] == 2
        assert len(data["items"]) == 5
    
    def test_paginated_search_invalid_page(self, client, test_hadiths):
        """Test paginated search with invalid page number."""
        response = client.get("/api/hadith/search/paginated?query=&page=0")
        
        assert response.status_code == 422  # Validation error
    
    def test_paginated_search_out_of_range_page(self, client, test_hadiths):
        """Test paginated search with page beyond available pages."""
        response = client.get("/api/hadith/search/paginated?query=&page=100")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 0
        assert data["page"] == 100


class TestSearchPerformance:
    """Test search performance with large datasets."""
    
    @pytest.mark.slow
    def test_search_large_dataset(self, client, db, test_hadith_collection, test_hadith_book):
        """Test search performance with many hadiths."""
        # Create 1000 hadiths
        for i in range(1000):
            HadithFactory.create(
                db,
                test_hadith_collection,
                test_hadith_book,
                hadith_number=str(i + 100),
                english_text=f"Performance test hadith {i} with various words",
                arabic_text=f"نص عربي رقم {i}"
            )
        
        import time
        start_time = time.time()
        
        response = client.get("/api/hadith/search?query=performance")
        
        end_time = time.time()
        duration = end_time - start_time
        
        assert response.status_code == 200
        assert duration < 1.0  # Should complete within 1 second
        
        data = response.json()
        assert len(data) == 1000  # All created hadiths match


class TestMultilingualSearch:
    """Test search across multiple languages."""
    
    def test_search_french_text(self, client, test_hadiths):
        """Test searching in French text."""
        response = client.get("/api/hadith/search?query=recherche")
        
        assert response.status_code == 200
        data = response.json()
        # French search might not be implemented yet
        assert isinstance(data, list)
    
    def test_search_mixed_languages(self, client, db, test_hadith_collection, test_hadith_book):
        """Test search with mixed language content."""
        # Create hadith with mixed language content
        hadith = HadithFactory.create(
            db,
            test_hadith_collection,
            test_hadith_book,
            hadith_number="999",
            english_text="Knowledge العلم is important",
            arabic_text="العلم knowledge مهم"
        )
        
        # Search English term
        response = client.get("/api/hadith/search?query=Knowledge")
        assert response.status_code == 200
        data = response.json()
        assert any(h["hadith_number"] == "999" for h in data)
    
    def test_search_transliteration(self, client, db, test_hadith_collection, test_hadith_book):
        """Test search with transliterated terms."""
        # Create hadith with transliteration
        hadith = HadithFactory.create(
            db,
            test_hadith_collection,
            test_hadith_book,
            hadith_number="1000",
            english_text="The word 'ilm' means knowledge",
            arabic_text="كلمة علم تعني المعرفة"
        )
        
        response = client.get("/api/hadith/search?query=ilm")
        assert response.status_code == 200
        data = response.json()
        assert any(h["hadith_number"] == "1000" for h in data)


class TestSearchSorting:
    """Test search result sorting."""
    
    def test_search_default_sorting(self, client, test_hadiths):
        """Test default sorting of search results."""
        response = client.get("/api/hadith/search?query=")
        
        assert response.status_code == 200
        data = response.json()
        
        # Should be sorted by hadith number by default
        hadith_numbers = [h["hadith_number"] for h in data]
        assert hadith_numbers == sorted(hadith_numbers)
    
    def test_search_relevance_sorting(self, client, db, test_hadith_collection, test_hadith_book):
        """Test sorting by relevance (when implemented)."""
        # Create hadiths with different relevance
        HadithFactory.create(
            db,
            test_hadith_collection,
            test_hadith_book,
            hadith_number="100",
            english_text="Knowledge is mentioned once here"
        )
        HadithFactory.create(
            db,
            test_hadith_collection,
            test_hadith_book,
            hadith_number="101",
            english_text="Knowledge knowledge knowledge - mentioned multiple times"
        )
        
        response = client.get("/api/hadith/search?query=knowledge")
        assert response.status_code == 200
        
        # When relevance sorting is implemented, the hadith with more occurrences
        # should appear first


class TestSearchSecurity:
    """Test search security and input validation."""
    
    def test_search_sql_injection_attempt(self, client, test_hadiths):
        """Test that SQL injection attempts are handled safely."""
        malicious_queries = [
            "'; DROP TABLE hadiths; --",
            "1' OR '1'='1",
            "\" OR 1=1 --",
            "'; DELETE FROM hadiths WHERE '1'='1"
        ]
        
        for query in malicious_queries:
            response = client.get(f"/api/hadith/search?query={query}")
            assert response.status_code == 200
            # Should return empty results, not cause errors
            assert isinstance(response.json(), list)
    
    def test_search_xss_prevention(self, client, test_hadiths):
        """Test that XSS attempts in search are handled."""
        xss_query = "<script>alert('xss')</script>"
        response = client.get(f"/api/hadith/search?query={xss_query}")
        
        assert response.status_code == 200
        # The query should be treated as plain text
        data = response.json()
        assert len(data) == 0  # No results should match
    
    def test_search_query_length_limit(self, client):
        """Test search with very long query."""
        long_query = "a" * 1000
        response = client.get(f"/api/hadith/search?query={long_query}")
        
        # Should either work or return validation error, not crash
        assert response.status_code in [200, 422]