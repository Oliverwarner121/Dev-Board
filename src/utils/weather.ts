interface Condition {
  label: string;
  day: string;
  night: string;
}

const CLEAR: Condition = { label: 'Clear sky', day: '☀️', night: '🌙' };
const PARTLY: Condition = { label: 'Partly cloudy', day: '⛅', night: '☁️' };
const CLOUDY: Condition = { label: 'Overcast', day: '☁️', night: '☁️' };
const FOG: Condition = { label: 'Fog', day: '🌫️', night: '🌫️' };
const DRIZZLE: Condition = { label: 'Drizzle', day: '🌦️', night: '🌧️' };
const RAIN: Condition = { label: 'Rain', day: '🌧️', night: '🌧️' };
const SNOW: Condition = { label: 'Snow', day: '🌨️', night: '🌨️' };
const STORM: Condition = { label: 'Thunderstorm', day: '⛈️', night: '⛈️' };

// WMO weather interpretation codes used by Open-Meteo.
export function describeWeather(code: number, isDay: boolean) {
  let condition = CLOUDY;
  if (code === 0 || code === 1) condition = CLEAR;
  else if (code === 2) condition = PARTLY;
  else if (code === 45 || code === 48) condition = FOG;
  else if (code >= 51 && code <= 57) condition = DRIZZLE;
  else if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82))
    condition = RAIN;
  else if ((code >= 71 && code <= 77) || code === 85 || code === 86)
    condition = SNOW;
  else if (code >= 95) condition = STORM;
  return {
    label: code === 1 ? 'Mainly clear' : condition.label,
    icon: isDay ? condition.day : condition.night,
  };
}
