import { WEATHER_LOCATIONS } from '../services/weather';
import type { WeatherState } from '../types/weather';
import { describeWeather } from '../utils/weather';
import { Panel } from './Panel';

export function Weather({ weather }: { weather: WeatherState }) {
  const hour = new Date().getHours();
  const currentSlot = hour - (hour % 2);
  return (
    <Panel title="Weather" eyebrow="TODAY'S FORECAST" className="weather-panel">
      <ul className="weather-list">
        {WEATHER_LOCATIONS.map((location) => {
          const entry = weather[location.id];
          const reading = entry?.status === 'ready' ? entry.reading : undefined;
          const condition = reading
            ? describeWeather(reading.weatherCode, reading.isDay)
            : undefined;
          return (
            <li key={location.id} className="weather-item glass-lite">
              <div className="weather-place">
                <h3>{location.name}</h3>
                <span>{location.region}</span>
              </div>
              {reading && condition ? (
                <>
                  <div className="weather-reading">
                    <span className="weather-icon" aria-hidden="true">
                      {condition.icon}
                    </span>
                    <div>
                      <div className="weather-temp">
                        {Math.round(reading.temperature)}°C
                      </div>
                      <div className="weather-detail">{condition.label}</div>
                    </div>
                    <div className="weather-meta">
                      <span>
                        H {Math.round(reading.high)}° · L{' '}
                        {Math.round(reading.low)}°
                      </span>
                      <span>Feels {Math.round(reading.feelsLike)}°</span>
                      <span>{Math.round(reading.windMph)} mph</span>
                    </div>
                  </div>
                  <ol className="weather-hours" aria-label="Hourly forecast">
                    {reading.hourly
                      .filter((slot) => slot.hour % 2 === 0)
                      .map((slot) => {
                        const slotCondition = describeWeather(
                          slot.weatherCode,
                          slot.isDay,
                        );
                        return (
                          <li
                            key={slot.hour}
                            className="weather-hour"
                            aria-current={
                              slot.hour === currentSlot ? 'time' : undefined
                            }
                          >
                            <span className="weather-hour-time">
                              {String(slot.hour).padStart(2, '0')}:00
                            </span>
                            <span aria-hidden="true">{slotCondition.icon}</span>
                            <span className="weather-hour-temp">
                              {Math.round(slot.temperature)}°
                            </span>
                            <span className="weather-hour-rain">
                              {slot.rainChance}%
                            </span>
                          </li>
                        );
                      })}
                  </ol>
                </>
              ) : entry?.status === 'unavailable' ? (
                <p className="panel-error" role="alert">
                  {location.name}: {entry.message}
                </p>
              ) : (
                <p className="empty">Loading weather…</p>
              )}
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
