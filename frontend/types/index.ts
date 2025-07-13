// Prayer Types
export interface PrayerTime {
  name: string;
  time: string;
  arabic: string;
  icon?: any;
  remaining?: string;
}

export interface PrayerSettings {
  calculationMethod: string;
  jurisprudence: 'shafi' | 'hanafi';
  adjustments: {
    fajr: number;
    dhuhr: number;
    asr: number;
    maghrib: number;
    isha: number;
  };
}

// Quran Types
export interface Surah {
  id: number;
  name: string;
  arabic: string;
  englishNameTranslation: string;
  verses: number;
  revelationType: 'Meccan' | 'Medinan';
}

export interface Ayah {
  id: number;
  surahId: number;
  number: number;
  text: string;
  textArabic: string;
  translation: string;
  transliteration?: string;
  audio?: string;
}

// Hadith Types
export interface HadithCollection {
  id: number;
  collection_id: string;
  name: string;
  arabic_name: string;
  author: string;
  author_arabic: string;
  description?: string;
  total_hadiths: number;
  books: number;
  authenticity?: string;
  created_at?: string;
  updated_at?: string;
}

export interface HadithCategory {
  id: number;
  category_id: string;
  name: string;
  arabic_name: string;
  icon?: string;
  description?: string;
  hadith_count?: number;
}

export interface HadithBook {
  id: number;
  collection_id: number;
  book_number: number;
  name: string;
  arabic_name?: string;
  hadith_count: number;
}

export interface Hadith {
  id: number;
  collection_id: number;
  book_id?: number;
  hadith_number: string;
  arabic_text: string;
  english_text: string;
  french_text?: string;
  narrator_chain: string;
  grade?: string;
  reference?: string;
  created_at?: string;
  updated_at?: string;
}

// Islamic Calendar Types
export interface IslamicDate {
  hijri: {
    day: number;
    month: string;
    monthNumber: number;
    year: number;
    designation: string;
  };
  gregorian: {
    day: number;
    month: string;
    year: number;
    date: Date;
  };
}

export interface IslamicEvent {
  id: string;
  name: string;
  arabic: string;
  date: IslamicDate;
  description: string;
  type: 'holiday' | 'fast' | 'celebration' | 'remembrance';
}

// Zakat Types
export interface ZakatCalculation {
  type: 'gold' | 'silver' | 'cash' | 'business' | 'agriculture' | 'livestock';
  amount: number;
  nisab: number;
  zakatDue: number;
  currency?: string;
}

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  location?: {
    city: string;
    country: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  preferences: {
    language: string;
    theme: 'light' | 'dark';
    notifications: boolean;
    calculationMethod: string;
  };
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

// Location Types
export interface Location {
  city: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  timezone: string;
  qiblaDirection: number;
}