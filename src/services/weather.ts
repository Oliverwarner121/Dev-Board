import type { WeatherLocation, WeatherReading } from '../types/weather';

export const WEATHER_LOCATIONS: WeatherLocation[] = [
  {
    id: 'wheatley',
    name: 'Wheatley',
    region: 'Oxford, UK',
    latitude: 51.7507,
    longitude: -1.1343,
  },
  {
    id: 'wotton',
    name: 'Wotton-under-Edge',
    region: 'South Gloucestershire, UK',
    latitude: 51.6358,
    longitude: -2.3507,
  },
];

interface ForecastResponse {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    weather_code: number;
    wind_speed_10m: number;
    is_day: number;
  };
  daily: { temperature_2m_max: number[]; temperature_2m_min: number[] };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    is_day: number[];
    precipitation_probability: number[];
  };
}

export async function getWeather(
  location: WeatherLocation,
): Promise<WeatherReading> {
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current:
      'temperature_2m,apparent_temperature,weather_code,wind_speed_10m,is_day',
    daily: 'temperature_2m_max,temperature_2m_min',
    hourly: 'temperature_2m,weather_code,is_day,precipitation_probability',
    timezone: 'Europe/London',
    wind_speed_unit: 'mph',
    forecast_days: '1',
  });
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params}`,
  );
  if (!response.ok)
    throw new Error(`Weather service returned ${response.status}`);
  const { current, daily, hourly } =
    (await response.json()) as ForecastResponse;
  return {
    temperature: current.temperature_2m,
    feelsLike: current.apparent_temperature,
    weatherCode: current.weather_code,
    windMph: current.wind_speed_10m,
    isDay: current.is_day === 1,
    high: daily.temperature_2m_max[0],
    low: daily.temperature_2m_min[0],
    hourly: hourly.time.map((time, index) => ({
      hour: Number(time.slice(11, 13)),
      temperature: hourly.temperature_2m[index],
      weatherCode: hourly.weather_code[index],
      isDay: hourly.is_day[index] === 1,
      rainChance: hourly.precipitation_probability[index] ?? 0,
    })),
  };
}
