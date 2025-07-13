import { httpClient } from '@/lib/fetch';
import { getApiUrl } from '@/lib/api-config';
import { resilientHadithApi } from '@/lib/hadith-api-resilient';
import type { 
  ApiResponse, 
  PaginatedResponse, 
  PrayerTime, 
  Surah, 
  Ayah, 
  Hadith,
  HadithCollection,
  IslamicDate,
  IslamicEvent,
  ZakatCalculation,
  Location
} from '@/types';

const API_URL = getApiUrl();

// Helper to ensure /api prefix is included correctly
const getFullApiUrl = (path: string) => {
  const baseUrl = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`;
  return `${baseUrl}${path}`;
};

// Configure httpClient with API URL
const api = {
  get: (path: string, options?: any) => httpClient.get(getFullApiUrl(path), options),
  post: (path: string, data?: any, options?: any) => httpClient.post(getFullApiUrl(path), data, options),
  put: (path: string, data?: any, options?: any) => httpClient.put(getFullApiUrl(path), data, options),
  delete: (path: string, options?: any) => httpClient.delete(getFullApiUrl(path), options),
};

// Prayer Times API
export const prayerTimesApi = {
  getTimes: async (location: Location, date?: Date): Promise<ApiResponse<PrayerTime[]>> => {
    const response = await api.get('/prayer-times', {
      params: {
        latitude: location.coordinates.latitude,
        longitude: location.coordinates.longitude,
        date: date?.toISOString() || new Date().toISOString(),
      },
    });
    return response.data;
  },

  getMonthlyTimes: async (location: Location, month: number, year: number) => {
    const response = await api.get('/prayer-times/monthly', {
      params: {
        latitude: location.coordinates.latitude,
        longitude: location.coordinates.longitude,
        month,
        year,
      },
    });
    return response.data;
  },
};

// Quran API
export const quranApi = {
  getSurahs: async (): Promise<ApiResponse<Surah[]>> => {
    const response = await api.get('/quran/surahs');
    return response.data;
  },

  getSurah: async (surahId: number): Promise<ApiResponse<Surah>> => {
    const response = await api.get(`/quran/surahs/${surahId}`);
    return response.data;
  },

  getAyahs: async (surahId: number, translation?: string): Promise<ApiResponse<Ayah[]>> => {
    const response = await api.get(`/quran/surahs/${surahId}/ayahs`, {
      params: { translation },
    });
    return response.data;
  },

  searchQuran: async (query: string, translation?: string): Promise<ApiResponse<Ayah[]>> => {
    const response = await api.get('/quran/search', {
      params: { q: query, translation },
    });
    return response.data;
  },
};

// Hadith API
export const hadithApi = {
  getCollections: () => resilientHadithApi.getCollections() as Promise<HadithCollection[]>,

  getCollectionBooks: (collectionId: string) => resilientHadithApi.getBooks(collectionId),

  getBookHadiths: (
    collectionId: string,
    bookNumber: number,
    page = 1,
    perPage = 20
  ) => resilientHadithApi.getHadiths(collectionId, bookNumber, page, perPage),

  getHadiths: async (
    collectionId: string, 
    page = 1, 
    perPage = 20
  ): Promise<Hadith[]> => {
    const result = await resilientHadithApi.getHadiths(collectionId, undefined, page, perPage);
    return result.hadiths || [];
  },

  getHadithsPaginated: (
    collectionId: string, 
    page = 1, 
    perPage = 20, 
    filters?: { grade?: string; search?: string }
  ) => resilientHadithApi.getHadiths(collectionId, undefined, page, perPage),

  searchHadith: (query: string) => resilientHadithApi.searchHadith(query) as Promise<Hadith[]>,

  getDailyHadith: () => resilientHadithApi.getDailyHadith(),

  getHadithById: async (hadithId: number): Promise<ApiResponse<Hadith>> => {
    const response = await api.get(`/hadith/${hadithId}`);
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('/hadith/categories');
    return response.data;
  },

  getBooks: (collectionId: string) => resilientHadithApi.getBooks(collectionId),

  searchHadiths: async (collectionId: string, params: string) => {
    const response = await api.get(`/hadith/collections/${collectionId}/hadiths/paginated?${params}`);
    return response.data;
  },
};

// Islamic Calendar API
export const calendarApi = {
  getCurrentDate: async (): Promise<ApiResponse<IslamicDate>> => {
    const response = await api.get('/calendar/today');
    return response.data;
  },

  getEvents: async (month?: number, year?: number): Promise<ApiResponse<IslamicEvent[]>> => {
    const response = await api.get('/calendar/events', {
      params: { month, year },
    });
    return response.data;
  },

  convertDate: async (date: Date, toHijri = true): Promise<ApiResponse<IslamicDate>> => {
    const response = await api.post('/calendar/convert', {
      date: date.toISOString(),
      toHijri,
    });
    return response.data;
  },
};

// Qibla API
export const qiblaApi = {
  getDirection: async (location: Location): Promise<ApiResponse<number>> => {
    const response = await api.get('/qibla/direction', {
      params: {
        latitude: location.coordinates.latitude,
        longitude: location.coordinates.longitude,
      },
    });
    return response.data;
  },
};

// Zakat API
export const zakatApi = {
  calculate: async (calculation: Partial<ZakatCalculation>): Promise<ApiResponse<ZakatCalculation>> => {
    const response = await api.post('/zakat/calculate', calculation);
    return response.data;
  },

  getNisab: async (type: 'gold' | 'silver', currency?: string): Promise<ApiResponse<number>> => {
    const response = await api.get('/zakat/nisab', {
      params: { type, currency },
    });
    return response.data;
  },
};

// Location API
export const locationApi = {
  detectLocation: async (): Promise<ApiResponse<Location>> => {
    const response = await api.get('/location/detect');
    return response.data;
  },

  searchLocation: async (query: string): Promise<ApiResponse<Location[]>> => {
    const response = await api.get('/location/search', {
      params: { q: query },
    });
    return response.data;
  },
};

export default api;