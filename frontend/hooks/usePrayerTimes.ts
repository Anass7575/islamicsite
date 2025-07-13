import { useQuery } from '@tanstack/react-query';
import { prayerTimesApi } from '@/services/api';
import type { Location, PrayerTime } from '@/types';

export function usePrayerTimes(location: Location | null, date?: Date) {
  return useQuery({
    queryKey: ['prayerTimes', location?.city, date?.toDateString()],
    queryFn: async () => {
      if (!location) throw new Error('Location required');
      const response = await prayerTimesApi.getTimes(location, date);
      return response.data;
    },
    enabled: !!location,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

export function useMonthlyPrayerTimes(location: Location | null, month: number, year: number) {
  return useQuery({
    queryKey: ['monthlyPrayerTimes', location?.city, month, year],
    queryFn: async () => {
      if (!location) throw new Error('Location required');
      const response = await prayerTimesApi.getMonthlyTimes(location, month, year);
      return response.data;
    },
    enabled: !!location,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

export function useNextPrayer(prayerTimes: PrayerTime[] | undefined) {
  if (!prayerTimes || prayerTimes.length === 0) return null;

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  for (const prayer of prayerTimes) {
    const [hours, minutes] = prayer.time.split(':').map(Number);
    const prayerTimeInMinutes = hours * 60 + minutes;

    if (prayerTimeInMinutes > currentTime) {
      const remainingMinutes = prayerTimeInMinutes - currentTime;
      const hours = Math.floor(remainingMinutes / 60);
      const minutes = remainingMinutes % 60;

      return {
        ...prayer,
        remaining: `${hours}h ${minutes}m`,
        remainingMinutes,
      };
    }
  }

  // If no prayer is found for today, return first prayer of tomorrow
  const firstPrayer = prayerTimes[0];
  const [hours, minutes] = firstPrayer.time.split(':').map(Number);
  const tomorrowPrayerMinutes = (24 * 60) - currentTime + (hours * 60 + minutes);
  const remainingHours = Math.floor(tomorrowPrayerMinutes / 60);
  const remainingMinutes = tomorrowPrayerMinutes % 60;

  return {
    ...firstPrayer,
    remaining: `${remainingHours}h ${remainingMinutes}m`,
    remainingMinutes: tomorrowPrayerMinutes,
    isTomorrow: true,
  };
}