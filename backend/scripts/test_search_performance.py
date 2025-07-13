#!/usr/bin/env python3
"""
Test search performance for hadiths
"""

import time
import requests
import statistics

# API base URL
BASE_URL = "http://localhost:5001/api"

# Test queries
TEST_QUERIES = [
    "faith",
    "prayer",
    "Allah",
    "Prophet",
    "intention",
    "charity",
    "Ramadan",
    "pilgrimage",
    "knowledge",
    "patience"
]

def measure_search_time(query):
    """Measure time for a single search query"""
    start = time.time()
    response = requests.get(f"{BASE_URL}/hadith/search", params={"query": query, "limit": 20})
    end = time.time()
    
    return {
        "query": query,
        "time": end - start,
        "status": response.status_code,
        "results": len(response.json()) if response.status_code == 200 else 0
    }

def main():
    print("Testing Hadith Search Performance")
    print("=" * 50)
    
    results = []
    
    # Warm-up query
    print("Warming up...")
    requests.get(f"{BASE_URL}/hadith/search", params={"query": "test", "limit": 1})
    
    # Test each query
    for query in TEST_QUERIES:
        result = measure_search_time(query)
        results.append(result)
        print(f"Query: '{query:12}' - Time: {result['time']:.3f}s - Results: {result['results']}")
    
    # Calculate statistics
    times = [r["time"] for r in results]
    print("\n" + "=" * 50)
    print(f"Average search time: {statistics.mean(times):.3f}s")
    print(f"Median search time:  {statistics.median(times):.3f}s")
    print(f"Min search time:     {min(times):.3f}s")
    print(f"Max search time:     {max(times):.3f}s")
    print(f"Std deviation:       {statistics.stdev(times):.3f}s")
    
    # Test pagination performance
    print("\n" + "=" * 50)
    print("Testing Pagination Performance")
    
    page_times = []
    for page in range(1, 6):
        start = time.time()
        response = requests.get(
            f"{BASE_URL}/hadith/collections/bukhari/hadiths/paginated",
            params={"page": page, "per_page": 20}
        )
        end = time.time()
        page_times.append(end - start)
        print(f"Page {page}: {end - start:.3f}s")
    
    print(f"\nAverage pagination time: {statistics.mean(page_times):.3f}s")

if __name__ == "__main__":
    main()