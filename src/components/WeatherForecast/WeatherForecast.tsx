import type { WeatherForecastItem } from '../../types/weather';
import './WeatherForecast.css';

interface Props { 
  forecasts: WeatherForecastItem[]; 
  timezone: number;
}

const WeatherForecast = ({ forecasts, timezone }: Props) => {
  const daily = forecasts.filter((_, i) => i % 8 === 0).slice(1, 6);

  return (
    <div className="daily-list">
      {daily.map((item) => {
        const date = new Date((item.dt + timezone) * 1000);
        
        return (
          <div key={item.dt} className="daily-row">
            <span className="day-name">
              {date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                day: 'numeric',
                timeZone: 'UTC'
              })}
            </span>
            <img src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`} alt="icon" />
            <div className="daily-temps">
              <span className="max">+{Math.round(item.main.temp)}°</span>
              <span className="min">+{Math.round(item.main.temp - 3)}°</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WeatherForecast;