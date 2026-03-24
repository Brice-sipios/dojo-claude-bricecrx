import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { Country, WeatherResult } from '../models/country.model';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private http = inject(HttpClient);

  generateMessage(country: Country, weather: WeatherResult | null): Observable<string> {
    return this.http
      .post<{ message: string }>('/api/generate-message', { country, weather })
      .pipe(
        map((res) => res.message),
        catchError(() => of(this.fallbackMessage(country, weather)))
      );
  }

  private fallbackMessage(country: Country, weather: WeatherResult | null): string {
    const meteo = weather?.weathercode !== -1 && weather?.description
      ? weather.description.toLowerCase()
      : 'météo mystérieuse';
    return `⚔️ Très Haut Sire @manager, la fléchette du destin a tranché ! Je dois impérativement me rendre en ${country.flag} **${country.name}** (${country.capital}). La raison est des plus nobles : _${country.funFact}_ Les éléments annoncent ${meteo} — j'emporte ma cotte de mailles. Que Votre Seigneurie daigne approuver ces congés sans délai ! 🏰 Votre fidèle sujet 🙏`;
  }
}
