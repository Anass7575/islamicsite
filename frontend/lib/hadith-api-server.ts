// Server-safe version of hadith API without client-side features
import { httpClient } from '@/lib/fetch';
import { getApiUrl } from '@/lib/api-config';

const API_URL = getApiUrl();

// Helper to ensure /api prefix is included correctly
const getFullApiUrl = (path: string) => {
  const baseUrl = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`;
  return `${baseUrl}${path}`;
};

// Server-safe hadith API
export const serverHadithApi = {
  async getCollections() {
    try {
      const response = await httpClient.get(getFullApiUrl('/hadith/collections'));
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch hadith collections:', error);
      // Return empty array on server-side errors
      return [];
    }
  },

  async getBooks(collectionId: string) {
    try {
      const response = await httpClient.get(getFullApiUrl(`/hadith/collections/${collectionId}/books`));
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch books:', error);
      return [];
    }
  },

  async getHadiths(collectionId: string, bookNumber?: number, page = 1, perPage = 20) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString()
      });
      
      if (bookNumber) {
        params.append('book_number', bookNumber.toString());
      }
      
      const response = await httpClient.get(
        getFullApiUrl(`/hadith/collections/${collectionId}/hadiths/paginated?${params}`)
      );
      
      return response.data || { hadiths: [], total: 0, pages: 0 };
    } catch (error) {
      console.error('Failed to fetch hadiths:', error);
      return { hadiths: [], total: 0, pages: 0 };
    }
  },

  async getCategories() {
    try {
      const response = await httpClient.get(getFullApiUrl('/hadith/categories'));
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      return [];
    }
  },

  async searchHadith(query: string) {
    try {
      const response = await httpClient.get(getFullApiUrl('/hadith/search'), {
        params: { q: query }
      });
      return response.data || [];
    } catch (error) {
      console.error('Failed to search hadiths:', error);
      return [];
    }
  },

  async getDailyHadith() {
    try {
      const response = await httpClient.get(getFullApiUrl('/hadith/daily'));
      return response.data;
    } catch (error) {
      console.error('Failed to fetch daily hadith:', error);
      return null;
    }
  }
};