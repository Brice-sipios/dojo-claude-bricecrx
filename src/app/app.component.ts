import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Country, WeatherResult, AnimationPhase } from './models/country.model';
import { CountryService } from './services/country.service';
import { WeatherService } from './services/weather.service';
import { WorldMapComponent } from './components/world-map/world-map.component';
import { ResultModalComponent } from './components/result-modal/result-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, WorldMapComponent, ResultModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  private countryService = inject(CountryService);
  private weatherService = inject(WeatherService);

  animationPhase: AnimationPhase = 'idle';
  selectedCountry: Country | null = null;
  weatherResult: WeatherResult | null = null;
  showModal = false;
  isLoadingWeather = false;
  slackMessage = '';

  get isIdle(): boolean {
    return this.animationPhase === 'idle';
  }

  throwDart(): void {
    if (this.animationPhase !== 'idle') return;
    this.selectedCountry = this.countryService.getRandomCountry();
    this.weatherResult = null;
    this.animationPhase = 'throwing';
  }

  onDartLanded(): void {
    this.animationPhase = 'landed';
    if (!this.selectedCountry) return;

    this.isLoadingWeather = true;
    this.showModal = true;
    this.animationPhase = 'modal';
    this.slackMessage = this.buildSlackMessage(this.selectedCountry, null);

    this.weatherService
      .getWeather(this.selectedCountry.latitude, this.selectedCountry.longitude)
      .subscribe(weather => {
        this.weatherResult = weather;
        this.isLoadingWeather = false;
        this.slackMessage = this.buildSlackMessage(this.selectedCountry!, weather);
      });
  }

  closeModal(): void {
    this.showModal = false;
    setTimeout(() => {
      this.animationPhase = 'idle';
      this.selectedCountry = null;
      this.weatherResult = null;
    }, 250);
  }

  relaunch(): void {
    this.closeModal();
    setTimeout(() => this.throwDart(), 300);
  }

  private buildSlackMessage(country: Country, weather: WeatherResult | null): string {
    const templates = [
      () => {
        const meteo = weather
          ? `La météo annonce ${weather.temperature}°C — ${weather.description.toLowerCase()}`
          : 'la météo est mystérieuse';
        return `Hey @manager :dart: La fléchette a tranché ! Je dois absolument me rendre en ${country.flag} **${country.name}** pour approfondir mes recherches sur le fait suivant : _${country.funFact}_ ${meteo}, donc j'emporte ma valise légère et mes excuses préparées à l'avance. Merci de valider mes congés d'ici ce soir :pray: :palm_tree:`;
      },
      () => {
        const wind = weather ? `, vent ${weather.windspeed} km/h` : '';
        return `Bonjour @manager :wave: Je viens de consulter mon oracle personnel (une fléchette) et il pointe clairement vers ${country.flag} **${country.name}** (capitale : ${country.capital}). Fun fact qui justifie tout : _${country.funFact}_ Températures prévues : ${weather ? weather.temperature + '°C' + wind : 'données classifiées'}. Je compte sur toi pour approuver ces congés stratégiques :sunglasses: :rocket:`;
      },
      () => {
        return `:mega: ANNONCE IMPORTANTE @manager — Suite à une analyse poussée via système balistique aléatoire, ma prochaine destination de congés est officiellement ${country.flag} **${country.name}**. La science est formelle : _${country.funFact}_ Il serait irresponsable de ma part de ne pas aller vérifier ça sur place. Pièces jointes : billet non-remboursable. Merci de valider ASAP :timer_clock: :pray:`;
      },
    ];

    const idx = Math.floor(Math.random() * templates.length);
    return templates[idx]();
  }
}
