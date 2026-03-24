import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { WeatherResult } from '../models/country.model';

const WMO_CODES: Record<number, string> = {
  0: 'Ciel dégagé ☀️',
  1: 'Principalement dégagé 🌤️',
  2: 'Partiellement nuageux ⛅',
  3: 'Couvert ☁️',
  45: 'Brouillard 🌫️',
  48: 'Brouillard givrant 🌫️',
  51: 'Bruine légère 🌦️',
  53: 'Bruine modérée 🌦️',
  55: 'Bruine dense 🌦️',
  61: 'Pluie légère 🌧️',
  63: 'Pluie modérée 🌧️',
  65: 'Pluie forte 🌧️',
  71: 'Neige légère ❄️',
  73: 'Neige modérée ❄️',
  75: 'Neige forte ❄️',
  77: 'Grains de neige 🌨️',
  80: 'Averses légères 🌦️',
  81: 'Averses modérées 🌦️',
  82: 'Averses violentes ⛈️',
  85: 'Averses de neige ❄️',
  86: 'Averses de neige forte ❄️',
  95: 'Orage ⛈️',
  96: 'Orage avec grêle ⛈️',
  99: 'Orage violent avec grêle ⛈️',
};

interface OpenMeteoResponse {
  current_weather: {
    temperature: number;
    windspeed: number;
    weathercode: number;
  };
}

@Injectable({ providedIn: 'root' })
export class WeatherService {
  constructor(private http: HttpClient) {}

  getWeather(lat: number, lon: number): Observable<WeatherResult> {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    return this.http.get<OpenMeteoResponse>(url).pipe(
      map(res => ({
        temperature: res.current_weather.temperature,
        windspeed: res.current_weather.windspeed,
        weathercode: res.current_weather.weathercode,
        description: this.getDescription(res.current_weather.weathercode),
      })),
      catchError(() => of({
        temperature: 0,
        windspeed: 0,
        weathercode: -1,
        description: 'Météo indisponible 🌫️',
      }))
    );
  }

  private getDescription(code: number): string {
    return WMO_CODES[code] ?? 'Conditions inconnues 🌡️';
  }
}
