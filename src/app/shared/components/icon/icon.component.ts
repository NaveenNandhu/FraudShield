import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      [attr.width]="size"
      [attr.height]="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      [attr.stroke-width]="strokeWidth"
      stroke-linecap="round"
      stroke-linejoin="round"
      [class]="class"
      [ngClass]="colorClass"
    >
      <!-- Shield -->
      <ng-container *ngIf="name === 'shield'">
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
      </ng-container>

      <!-- Shield Alert -->
      <ng-container *ngIf="name === 'shield-alert'">
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
        <path d="M12 8v4"/>
        <path d="M12 16h.01"/>
      </ng-container>

      <!-- Shield Check -->
      <ng-container *ngIf="name === 'shield-check'">
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
        <path d="m9 12 2 2 4-4"/>
      </ng-container>

      <!-- Package -->
      <ng-container *ngIf="name === 'package'">
        <path d="m16.5 9.4-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <polyline points="3.29 7 12 12 20.71 7"/>
        <line x1="12" y1="22" x2="12" y2="12"/>
      </ng-container>

      <!-- Alert Triangle -->
      <ng-container *ngIf="name === 'alert-triangle'">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </ng-container>

      <!-- Check Circle -->
      <ng-container *ngIf="name === 'check-circle'">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </ng-container>

      <!-- X Circle -->
      <ng-container *ngIf="name === 'x-circle'">
        <circle cx="12" cy="12" r="10"/>
        <path d="m15 9-6 6"/>
        <path d="m9 9 6 6"/>
      </ng-container>

      <!-- Bell -->
      <ng-container *ngIf="name === 'bell'">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
      </ng-container>

      <!-- User -->
      <ng-container *ngIf="name === 'user'">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </ng-container>

      <!-- Search -->
      <ng-container *ngIf="name === 'search'">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.3-4.3"/>
      </ng-container>

      <!-- Filter -->
      <ng-container *ngIf="name === 'filter'">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
      </ng-container>

      <!-- Bar Chart -->
      <ng-container *ngIf="name === 'bar-chart'">
        <line x1="12" y1="20" x2="12" y2="10"/>
        <line x1="18" y1="20" x2="18" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="16"/>
      </ng-container>

      <!-- Trending Up -->
      <ng-container *ngIf="name === 'trending-up'">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
        <polyline points="16 7 22 7 22 13"/>
      </ng-container>

      <!-- Clock -->
      <ng-container *ngIf="name === 'clock'">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </ng-container>

      <!-- Cpu (AI) -->
      <ng-container *ngIf="name === 'cpu'">
        <rect width="16" height="16" x="4" y="4" rx="2"/>
        <rect width="6" height="6" x="9" y="9" rx="1"/>
        <path d="M15 2v2"/>
        <path d="M15 20v2"/>
        <path d="M2 15h2"/>
        <path d="M2 9h2"/>
        <path d="M20 15h2"/>
        <path d="M20 9h2"/>
        <path d="M9 2v2"/>
        <path d="M9 20v2"/>
      </ng-container>

      <!-- File Text -->
      <ng-container *ngIf="name === 'file-text'">
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
        <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
        <path d="M10 9H8"/>
        <path d="M16 13H8"/>
        <path d="M16 17H8"/>
      </ng-container>

      <!-- Arrow Right -->
      <ng-container *ngIf="name === 'arrow-right'">
        <path d="M5 12h14"/>
        <path d="m12 5 7 7-7 7"/>
      </ng-container>

      <!-- Chevron Right -->
      <ng-container *ngIf="name === 'chevron-right'">
        <path d="m9 18 6-6-6-6"/>
      </ng-container>

      <!-- Lock -->
      <ng-container *ngIf="name === 'lock'">
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </ng-container>

      <!-- Refresh / Sync -->
      <ng-container *ngIf="name === 'refresh-cw'">
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
        <path d="M21 3v5h-5"/>
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
        <path d="M8 16H3v5"/>
      </ng-container>

      <!-- Settings -->
      <ng-container *ngIf="name === 'settings'">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
        <circle cx="12" cy="12" r="3"/>
      </ng-container>

      <!-- Sliders -->
      <ng-container *ngIf="name === 'sliders'">
        <line x1="4" y1="21" x2="4" y2="14"/>
        <line x1="4" y1="10" x2="4" y2="3"/>
        <line x1="12" y1="21" x2="12" y2="12"/>
        <line x1="12" y1="8" x2="12" y2="3"/>
        <line x1="20" y1="21" x2="20" y2="16"/>
        <line x1="20" y1="12" x2="20" y2="3"/>
        <line x1="1" y1="14" x2="7" y2="14"/>
        <line x1="9" y1="8" x2="15" y2="8"/>
        <line x1="17" y1="16" x2="23" y2="16"/>
      </ng-container>

      <!-- Log Out -->
      <ng-container *ngIf="name === 'log-out'">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16 17 21 12 16 7"/>
        <line x1="21" y1="12" x2="9" y2="12"/>
      </ng-container>

      <!-- Eye -->
      <ng-container *ngIf="name === 'eye'">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
        <circle cx="12" cy="12" r="3"/>
      </ng-container>

      <!-- Zap / Quick -->
      <ng-container *ngIf="name === 'zap'">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </ng-container>

      <!-- Plus -->
      <ng-container *ngIf="name === 'plus'">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
      </ng-container>

      <!-- External Link -->
      <ng-container *ngIf="name === 'external-link'">
        <path d="M15 3h6v6"/>
        <path d="M10 14 21 3"/>
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      </ng-container>
    </svg>
  `
})
export class IconComponent {
  @Input() name: string = 'shield';
  @Input() size: number = 18;
  @Input() strokeWidth: number = 2;
  @Input() class: string = '';
  @Input() colorClass: string = '';
}
