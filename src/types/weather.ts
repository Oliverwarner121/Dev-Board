export interface WeatherLocation {
  id: string;
  name: string;
  region: string;
  latitude: number;
  longitude: number;
}

export interface HourlyReading {
  hour: number;
  temperature: number;
  weatherCode: number;
  isDay: boolean;
  rainChance: number;
}

export interface WeatherReading {
  temperature: number;
  feelsLike: number;
  weatherCode: number;
  windMph: number;
  isDay: boolean;
  high: number;
  low: number;
  hourly: HourlyReading[];
}

export type LocationWeather =
  | { status: 'ready'; reading: WeatherReading }
  | { status: 'unavailable'; message: string };

export type WeatherState = Record<string, LocationWeather | undefined>;
