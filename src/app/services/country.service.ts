import { Injectable } from '@angular/core';
import { Country } from '../models/country.model';
import { COUNTRIES } from '../data/countries.data';

@Injectable({ providedIn: 'root' })
export class CountryService {
  getRandomCountry(): Country {
    return COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
  }

  getCountryById(id: number): Country | undefined {
    return COUNTRIES.find(c => c.id === id);
  }

  getAllCountries(): Country[] {
    return COUNTRIES;
  }
}
