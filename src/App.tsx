import { useState, useEffect, useCallback } from 'react';
import WeatherForecast from './components/WeatherForecast/WeatherForecast';
import { getWeatherData, getAirPollution, getCoordinates } from './services/weatherService';
import type { WeatherForecastItem, AirPollutionResponse } from './types/weather';
import './App.css';

const CITY_NAME = 'Новосибирск';

function App() {
  const [forecasts, setForecasts] = useState<WeatherForecastItem[]>([]);
  const [airData, setAirData] = useState<AirPollutionResponse | null>(null);
  const [cityInfo, setCityInfo] = useState({ name: '', timezone: 0 });
  const [localTime, setLocalTime] = useState(new Date());
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const geo = await getCoordinates(CITY_NAME);
      const [weather, air] = await Promise.all([
        getWeatherData(geo.lat, geo.lon),
        getAirPollution(geo.lat, geo.lon)
      ]);
      setCityInfo({ name: geo.name, timezone: weather.city.timezone });
      setForecasts(weather.list);
      setAirData(air);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const weatherTimer = setInterval(loadData, 10800000);
    const clockTimer = setInterval(() => setLocalTime(new Date()), 60000);
    return () => { clearInterval(weatherTimer); clearInterval(clockTimer); };
  }, [loadData]);

  if (loading || !forecasts.length) return <div className="loading">Loading...</div>;

  const current = forecasts[0];
  const cityDate = new Date(localTime.getTime() + (localTime.getTimezoneOffset() * 60000) + (cityInfo.timezone * 1000));
  
  const getTimeOfDay = (date: Date) => {
    const h = date.getUTCHours();
    if (h >= 5 && h < 12) return 'morning';
    if (h >= 12 && h < 17) return 'day';
    if (h >= 17 && h < 21) return 'evening';
    return 'night';
  };

  const timeOfDay = getTimeOfDay(cityDate);
  const weatherMain = current.weather[0].main.toLowerCase();

  return (
    <div className={`app-container ${timeOfDay} ${weatherMain}-bg`}>
      <div className="weather-card-main">
        <div className="top-section">
          <div className="header">
            <p className="date-top">
              {cityDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric' })} | {cityDate.getUTCHours().toString().padStart(2, '0')}:{cityDate.getUTCMinutes().toString().padStart(2, '0')}
            </p>
            <h2>{cityInfo.name}</h2>
            <h1 className="main-temp">+{Math.round(current.main.temp)}°</h1>
          </div>
          
          <div className="current-weather-icon">
             <img src={`https://openweathermap.org/img/wn/${current.weather[0].icon}@4x.png`} alt="weather" className="main-icon" />
          </div>

          <div className="hourly-forecast">
            {forecasts.slice(0, 5).map((item, i) => {
              const itemDate = new Date((item.dt + cityInfo.timezone) * 1000);
              return (
                <div key={item.dt} className="hourly-item">
                  <span>{i === 0 ? 'Now' : `${itemDate.getUTCHours().toString().padStart(2, '0')}:00`}</span>
                  <img src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`} alt="icon" />
                  <span>{Math.round(item.main.temp)}°</span>
                </div>
              );
            })}
          </div>

          <div className="details-grid">
            <div className="detail-item"><span>Humidity</span><strong>{current.main.humidity}%</strong></div>
            <div className="detail-item"><span>Wind</span><strong>{Math.round(current.wind.speed)} m/s</strong></div>
            <div className="detail-item"><span>Pressure</span><strong>{current.main.pressure} hPa</strong></div>
            <div className="detail-item"><span>AQI</span><strong>{airData?.list[0].main.aqi}</strong></div>
          </div>
        </div>

        <div className="bottom-section">
          <WeatherForecast forecasts={forecasts} />
        </div>
      </div>
    </div>
  );
}

export default App;