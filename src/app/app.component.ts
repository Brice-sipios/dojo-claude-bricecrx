import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { Country, WeatherResult, AnimationPhase } from './models/country.model';
import { CountryService } from './services/country.service';
import { WeatherService } from './services/weather.service';
import { MessageService } from './services/message.service';
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
  private messageService = inject(MessageService);

  animationPhase: AnimationPhase = 'idle';
  selectedCountry: Country | null = null;
  weatherResult: WeatherResult | null = null;
  showModal = false;
  isLoadingWeather = false;
  isLoadingMessage = false;
  slackMessage = '';

  get isIdle(): boolean {
    return this.animationPhase === 'idle';
  }

  throwDart(): void {
    if (this.animationPhase !== 'idle') return;
    this.selectedCountry = this.countryService.getRandomCountry();
    this.weatherResult = null;
    this.slackMessage = '';
    this.animationPhase = 'throwing';
  }

  onDartLanded(): void {
    this.animationPhase = 'modal';
    if (!this.selectedCountry) return;

    this.isLoadingWeather = true;
    this.isLoadingMessage = true;
    this.showModal = true;

    const country = this.selectedCountry;

    // Fetch weather first, then generate message with weather context
    this.weatherService
      .getWeather(country.latitude, country.longitude)
      .subscribe(weather => {
        this.weatherResult = weather;
        this.isLoadingWeather = false;

        // Generate medieval message with full context
        this.messageService.generateMessage(country, weather).subscribe(msg => {
          this.slackMessage = msg;
          this.isLoadingMessage = false;
        });
      });
  }

  closeModal(): void {
    this.showModal = false;
    setTimeout(() => {
      this.animationPhase = 'idle';
      this.selectedCountry = null;
      this.weatherResult = null;
      this.slackMessage = '';
    }, 250);
  }

  relaunch(): void {
    this.closeModal();
    setTimeout(() => this.throwDart(), 300);
  }
}
