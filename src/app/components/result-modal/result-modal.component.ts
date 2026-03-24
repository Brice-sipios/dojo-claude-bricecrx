import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  animate,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Country, WeatherResult } from '../../models/country.model';

@Component({
  selector: 'app-result-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './result-modal.component.html',
  styleUrl: './result-modal.component.css',
  animations: [
    trigger('backdropFade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 })),
      ]),
    ]),
    trigger('modalEnter', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.85) translateY(24px)' }),
        animate(
          '350ms 100ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          style({ opacity: 1, transform: 'scale(1) translateY(0)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '180ms ease-in',
          style({ opacity: 0, transform: 'scale(0.95) translateY(8px)' })
        ),
      ]),
    ]),
  ],
})
export class ResultModalComponent {
  @Input() country!: Country;
  @Input() weather: WeatherResult | null = null;
  @Input() isLoadingWeather = false;
  @Input() isLoadingMessage = false;
  @Input() slackMessage = '';

  @Output() closed = new EventEmitter<void>();
  @Output() relaunch = new EventEmitter<void>();

  copied = false;

  copySlackMessage(): void {
    navigator.clipboard.writeText(this.slackMessage).then(() => {
      this.copied = true;
      setTimeout(() => (this.copied = false), 2000);
    });
  }
}
