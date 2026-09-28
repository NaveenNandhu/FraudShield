import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-card hover:border-slate-300 transition-all">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold tracking-wider text-slate-500 uppercase">
          {{ label }}
        </span>
        <div [class]="iconContainerBg" class="p-2.5 rounded-lg flex items-center justify-center">
          <app-icon [name]="icon" [size]="20" [class]="iconColorClass"></app-icon>
        </div>
      </div>

      <div class="mt-3 flex items-baseline justify-between">
        <div class="text-2xl font-bold tracking-tight text-slate-900">
          {{ value }}
        </div>
        
        <div *ngIf="badgeText" [class]="badgeBgClass" class="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full">
          <app-icon *ngIf="badgeIcon" [name]="badgeIcon" [size]="12"></app-icon>
          <span>{{ badgeText }}</span>
        </div>
      </div>

      <p *ngIf="description" class="mt-1 text-xs text-slate-500">
        {{ description }}
      </p>
    </div>
  `
})
export class StatCardComponent {
  @Input() label: string = '';
  @Input() value: string | number = '';
  @Input() icon: string = 'shield';
  @Input() description?: string;
  @Input() iconContainerBg: string = 'bg-blue-50';
  @Input() iconColorClass: string = 'text-blue-600';
  @Input() badgeText?: string;
  @Input() badgeIcon?: string;
  @Input() badgeBgClass: string = 'bg-slate-100 text-slate-600';
}
