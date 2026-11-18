import { useCallback, useEffect, useState } from 'react';
import { getWeather, WEATHER_LOCATIONS } from '../services/weather';
import type { WeatherState } from '../types/weather';

export function useWeather(intervalMs = 15 * 60_000): {
  weather: WeatherState;
  refresh: () => void;
} {
  const [weather, setWeather] = useState<WeatherState>({});
  const refresh = useCallback(() => {
    for (const location of WEATHER_LOCATIONS) {
      getWeather(location)
        .then((reading) =>
          setWeather((current) => ({
            ...current,
            [location.id]: { status: 'ready', reading },
          })),
        )
        .catch((error: unknown) =>
          setWeather((current) => ({
            ...current,
            [location.id]: {
              status: 'unavailable',
              message:
                error instanceof Error ? error.message : 'Weather unavailable',
            },
          })),
        );
    }
  }, []);

  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs, refresh]);

  return { weather, refresh };
}
