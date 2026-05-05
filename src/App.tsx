import { useState, useEffect, useCallback } from 'react';
import WeatherForecast from './components/WeatherForecast/WeatherForecast';
import { getWeatherData, getAirPollution, getCoordinates } from './services/weatherService';
import type { WeatherForecastItem, AirPollutionResponse } from './types/weather';
import './App.css';

const CITY_NAME = 'Лас Вегас';

function App() {
  const [forecasts, setForecasts] = useState<WeatherForecastItem[]>([]);
  const [airData, setAirData] = useState<AirPollutionResponse | null>(null);
  const [cityName, setCityName] = useState(CITY_NAME);
  const [timezone, setTimezone] = useState(0);
  const [localTime, setLocalTime] = useState(new Date());
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const geo = await getCoordinates(CITY_NAME);
      const [weather, air] = await Promise.all([
        getWeatherData(geo.lat, geo.lon),
        getAirPollution(geo.lat, geo.lon)
      ]);
      setCityName(geo.name);
      setTimezone(weather.city.timezone);
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
  }, [loadData]);

  useEffect(() => {
    const timer = setInterval(() => {
      setLocalTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const getCityTime = () => {
    const utc = localTime.getTime() + (localTime.getTimezoneOffset() * 60000);
    return new Date(utc + (1000 * timezone));
  };

  const getTimeOfDay = (date: Date) => {
    const hour = date.getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'day';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  };

  if (loading || forecasts.length === 0) return <div className="loading">Loading...</div>;

  const current = forecasts[0];
  const cityDate = getCityTime();
  const timeOfDay = getTimeOfDay(cityDate);
  const weatherMain = current.weather[0].main.toLowerCase();

  const formattedTime = cityDate.toLocaleTimeString('en-GB', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  const formattedDate = cityDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    day: 'numeric' 
  });

  return (
    <div className={`app-container ${timeOfDay} ${weatherMain}-bg`}>
      <div className="weather-card-main">
        <div className="top-section">
          <div className="header">
            <p className="date-top">{formattedDate} | {formattedTime}</p>
            <h2>{cityName}</h2>
            <h1 className="main-temp">+{Math.round(current.main.temp)}°</h1>
          </div>
          
          <div className="current-weather-icon">
            <img 
              src={`https://openweathermap.org/img/wn/${current.weather[0].icon}@4x.png`} 
              alt="weather"
              className="main-icon-img" 
            />
          </div>

          <div className="hourly-forecast">
              {forecasts.slice(0, 5).map((item, i) => {
                const itemDate = new Date((item.dt + timezone) * 1000);
                
                const hours = itemDate.getUTCHours().toString().padStart(2, '0');
                const minutes = itemDate.getUTCMinutes().toString().padStart(2, '0');
                const timeString = `${hours}:${minutes}`;

                return (
                  <div key={item.dt} className="hourly-item">
                    <span>{i === 0 ? 'Now' : timeString}</span>
                    <img 
                      src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`} 
                      alt="icon" 
                    />
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