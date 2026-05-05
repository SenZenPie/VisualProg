import type { WeatherResponse, AirPollutionResponse } from '../types/weather';

const API_KEY = '74248922c812ac3e040000ed74ed8326';
const BASE_URL = 'https://api.openweathermap.org';

export async function getCoordinates(city: string) {
  const response = await fetch(`${BASE_URL}/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`);
  if (!response.ok) throw new Error('City not found');
  const data = await response.json();
  if (data.length === 0) throw new Error('City not found');
  return { lat: data[0].lat, lon: data[0].lon, name: data[0].local_names?.ru || data[0].name };
}

export async function getWeatherData(lat: number, lon: number): Promise<WeatherResponse> {
  const response = await fetch(`${BASE_URL}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}&lang=ru`);
  if (!response.ok) throw new Error('Weather error');
  return response.json();
}

export async function getAirPollution(lat: number, lon: number): Promise<AirPollutionResponse> {
  const response = await fetch(`${BASE_URL}/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
  if (!response.ok) throw new Error('Air pollution error');
  return response.json();
}