export interface WeatherLocation {
  id: string;
  name: string;
  region: string;
  latitude: number;
  longitude: number;
}

export interface WeatherReading {
  temperature: number;
  feelsLike: number;
  weatherCode: number;
  windMph: number;
  isDay: boolean;
  high: number;
  low: number;
}

export type LocationWeather =
  | { status: 'ready'; reading: WeatherReading }
  | { status: 'unavailable'; message: string };

export type WeatherState = Record<string, LocationWeather | undefined>;
