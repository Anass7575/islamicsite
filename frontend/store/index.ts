import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Location, PrayerSettings } from '@/types';

interface AppState {
  // User
  user: User | null;
  setUser: (user: User | null) => void;
  
  // Location
  location: Location | null;
  setLocation: (location: Location) => void;
  
  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  
  
  // Prayer Settings
  prayerSettings: PrayerSettings;
  updatePrayerSettings: (settings: Partial<PrayerSettings>) => void;
  
  // Favorites
  favoriteAyahs: number[];
  toggleFavoriteAyah: (ayahId: number) => void;
  
  favoriteHadiths: number[];
  toggleFavoriteHadith: (hadithId: number) => void;
  
  // Bookmarks
  quranBookmarks: Array<{ surahId: number; ayahId: number; timestamp: Date }>;
  addQuranBookmark: (surahId: number, ayahId: number) => void;
  removeQuranBookmark: (surahId: number, ayahId: number) => void;
  
  // Reading Progress
  lastReadSurah: number | null;
  lastReadAyah: number | null;
  updateReadingProgress: (surahId: number, ayahId: number) => void;
  
  // Notifications
  notificationSettings: {
    prayerReminders: boolean;
    dailyVerse: boolean;
    weeklyReminders: boolean;
  };
  updateNotificationSettings: (settings: Partial<AppState['notificationSettings']>) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // User
      user: null,
      setUser: (user) => set({ user }),
      
      // Location
      location: null,
      setLocation: (location) => set({ location }),
      
      // Theme
      theme: 'dark',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      
      
      // Prayer Settings
      prayerSettings: {
        calculationMethod: 'MuslimWorldLeague',
        jurisprudence: 'shafi',
        adjustments: {
          fajr: 0,
          dhuhr: 0,
          asr: 0,
          maghrib: 0,
          isha: 0,
        },
      },
      updatePrayerSettings: (settings) =>
        set((state) => ({
          prayerSettings: { ...state.prayerSettings, ...settings },
        })),
      
      // Favorites
      favoriteAyahs: [],
      toggleFavoriteAyah: (ayahId) =>
        set((state) => ({
          favoriteAyahs: state.favoriteAyahs.includes(ayahId)
            ? state.favoriteAyahs.filter((id) => id !== ayahId)
            : [...state.favoriteAyahs, ayahId],
        })),
      
      favoriteHadiths: [],
      toggleFavoriteHadith: (hadithId) =>
        set((state) => ({
          favoriteHadiths: state.favoriteHadiths.includes(hadithId)
            ? state.favoriteHadiths.filter((id) => id !== hadithId)
            : [...state.favoriteHadiths, hadithId],
        })),
      
      // Bookmarks
      quranBookmarks: [],
      addQuranBookmark: (surahId, ayahId) =>
        set((state) => ({
          quranBookmarks: [
            ...state.quranBookmarks,
            { surahId, ayahId, timestamp: new Date() },
          ],
        })),
      removeQuranBookmark: (surahId, ayahId) =>
        set((state) => ({
          quranBookmarks: state.quranBookmarks.filter(
            (bookmark) => !(bookmark.surahId === surahId && bookmark.ayahId === ayahId)
          ),
        })),
      
      // Reading Progress
      lastReadSurah: null,
      lastReadAyah: null,
      updateReadingProgress: (surahId, ayahId) =>
        set({ lastReadSurah: surahId, lastReadAyah: ayahId }),
      
      // Notifications
      notificationSettings: {
        prayerReminders: true,
        dailyVerse: true,
        weeklyReminders: false,
      },
      updateNotificationSettings: (settings) =>
        set((state) => ({
          notificationSettings: { ...state.notificationSettings, ...settings },
        })),
    }),
    {
      name: 'al-hidaya-storage',
      partialize: (state) => ({
        user: state.user,
        location: state.location,
        theme: state.theme,
        prayerSettings: state.prayerSettings,
        favoriteAyahs: state.favoriteAyahs,
        favoriteHadiths: state.favoriteHadiths,
        quranBookmarks: state.quranBookmarks,
        lastReadSurah: state.lastReadSurah,
        lastReadAyah: state.lastReadAyah,
        notificationSettings: state.notificationSettings,
      }),
    }
  )
);