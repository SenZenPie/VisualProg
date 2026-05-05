import './WeatherCard.css';

interface Props {
  date: string;
  temp: number;
  description: string;
  icon: string;
  windSpeed: number;
  humidity: number;
}

const WeatherCard = ({ date, temp, description, icon, windSpeed, humidity }: Props) => {
  const formatDay = (d: string) => {
    return new Date(d).toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric' });
  };

  return (
    <div className="weather-card">
      <div className="card-date">{formatDay(date)}</div>
      <img src={`https://openweathermap.org/img/wn/${icon}@2x.png`} alt={description} />
      <div className="card-temp">{Math.round(temp)}°C</div>
      <div className="card-desc">{description}</div>
      <div className="card-stats">
        <span>{humidity}%</span>
        <span>{Math.round(windSpeed)}м/с</span>
      </div>
    </div>
  );
};

export default WeatherCard;