export interface WeatherForecastItem {
  dt: number;
  dt_txt: string;
  main: {
    temp: number;
    humidity: number;
    pressure: number;
  };
  weather: {
    main: string;
    description: string;
    icon: string;
  }[];
  wind: {
    speed: number;
  };
}

export interface WeatherResponse {
  city: { 
    name: string; 
    timezone: number; 
  };
  list: WeatherForecastItem[];
}

export interface AirPollutionResponse {
  list: {
    main: { aqi: number };
  }[];
}