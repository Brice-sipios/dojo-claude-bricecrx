import { Component, Input, NO_ERRORS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-medieval-icon',
  standalone: true,
  schemas: [NO_ERRORS_SCHEMA],
  template: `
    <svg
      [attr.viewBox]="viewBox"
      [attr.width]="size"
      [attr.height]="size"
      [class]="'anim-' + anim"
      [style.display]="'block'"
      [style.transform]="mirror ? 'scaleX(-1)' : null"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- KNIGHT -->
      @if (icon === 'knight') {
        <g [attr.fill]="color">
          <rect x="22" y="4"  width="22" height="20" rx="4"/>
          <rect x="27" y="14" width="17" height="4"  rx="1" fill="#2c1a0e"/>
          <rect x="24" y="22" width="18" height="7"  rx="2"/>
          <rect x="12" y="28" width="42" height="8"  rx="3"/>
          <polygon points="16,36 50,36 54,74 12,74"/>
          <rect x="29" y="42" width="8"  height="22" fill="#7a1414"/>
          <rect x="21" y="52" width="24" height="7"  fill="#7a1414"/>
          <rect x="50" y="36" width="8"  height="24" rx="3"/>
          <rect x="8"  y="36" width="8"  height="24" rx="3"/>
          <rect x="17" y="74" width="13" height="30" rx="3"/>
          <rect x="36" y="74" width="13" height="30" rx="3"/>
          <ellipse cx="24" cy="105" rx="10" ry="5"/>
          <ellipse cx="43" cy="105" rx="10" ry="5"/>
          <rect x="57" y="0"  width="5"  height="50" rx="2"/>
          <rect x="50" y="28" width="19" height="5"  rx="2"/>
          <circle cx="60" cy="55" r="5"/>
          <path d="M 2,30 L 10,30 L 10,58 L 6,66 L 2,58 Z" fill="#7a1414"/>
          <line x1="6" y1="32" x2="6"  y2="62" stroke="#c9a227" stroke-width="1.5"/>
          <line x1="3" y1="47" x2="9"  y2="47" stroke="#c9a227" stroke-width="1.5"/>
        </g>
      }

      <!-- CROSS PATTÉE -->
      @if (icon === 'cross') {
        <g [attr.fill]="color">
          <polygon points="22,2 38,2 34,26 26,26"/>
          <polygon points="26,34 34,34 38,58 22,58"/>
          <polygon points="2,22 2,38 26,34 26,26"/>
          <polygon points="34,26 34,34 58,38 58,22"/>
          <rect x="22" y="22" width="16" height="16"/>
          <circle cx="30" cy="30" r="4" fill="#2c1a0e"/>
          <circle cx="30" cy="30" r="2" [attr.fill]="color"/>
        </g>
      }

      <!-- FLEUR DE LIS -->
      @if (icon === 'fleur') {
        <g [attr.fill]="color">
          <rect x="8" y="56" width="34" height="8" rx="3"/>
          <path d="M 25,56 C 20,50 14,38 16,24 C 18,12 22,6 25,4 C 28,6 32,12 34,24 C 36,38 30,50 25,56 Z"/>
          <path d="M 25,50 C 22,44 19,36 20,26 C 21,18 23,12 25,10 C 27,12 29,18 30,26 C 31,36 28,44 25,50 Z" fill="#2c1a0e" opacity="0.35"/>
          <path d="M 25,42 C 22,38 10,34 6,24 C 4,16 8,10 14,14 C 18,17 22,26 25,34 Z"/>
          <path d="M 25,42 C 28,38 40,34 44,24 C 46,16 42,10 36,14 C 32,17 28,26 25,34 Z"/>
          <ellipse cx="25" cy="42" rx="4" ry="3" fill="#2c1a0e" opacity="0.4"/>
        </g>
      }

      <!-- SHIELD -->
      @if (icon === 'shield') {
        <g>
          <path d="M 5,5 L 55,5 L 55,45 L 30,65 L 5,45 Z" [attr.fill]="color"/>
          <rect x="26" y="5"  width="8"  height="60" fill="#7a1414"/>
          <rect x="5"  y="30" width="50" height="8"  fill="#7a1414"/>
          <path d="M 5,5 L 55,5 L 55,45 L 30,65 L 5,45 Z"
                fill="none" [attr.stroke]="color" stroke-width="2" opacity="0.5"/>
        </g>
      }
    </svg>
  `,
})
export class MedievalIconComponent {
  @Input() icon: 'knight' | 'cross' | 'fleur' | 'shield' = 'knight';
  @Input() size = 60;
  @Input() color = '#c9a227';
  @Input() mirror = false;
  @Input() anim: 'sway' | 'float' | 'pulse' | 'none' = 'none';

  get viewBox(): string {
    const boxes: Record<string, string> = {
      knight: '0 0 70 112',
      cross:  '0 0 60 60',
      fleur:  '0 0 50 68',
      shield: '0 0 60 70',
    };
    return boxes[this.icon] ?? '0 0 60 60';
  }
}
