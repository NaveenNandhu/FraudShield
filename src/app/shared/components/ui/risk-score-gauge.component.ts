import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RiskLevel } from '../../../core/models/fraud.model';

@Component({
  selector: 'app-risk-score-gauge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-flex items-center justify-center">
      <svg class="transform -rotate-90" [attr.width]="size" [attr.height]="size">
        <!-- Background track -->
        <circle
          [attr.cx]="center"
          [attr.cy]="center"
          [attr.r]="radius"
          stroke="#E2E8F0"
          [attr.stroke-width]="strokeWidth"
          fill="transparent"
        />
        <!-- Progress arc -->
        <circle
          [attr.cx]="center"
          [attr.cy]="center"
          [attr.r]="radius"
          [attr.stroke]="getStrokeColor()"
          [attr.stroke-width]="strokeWidth"
          stroke-linecap="round"
          fill="transparent"
          [attr.stroke-dasharray]="circumference"
          [attr.stroke-dashoffset]="dashOffset"
          class="transition-all duration-1000 ease-out"
        />
      </svg>
      
      <!-- Inner Content -->
      <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span class="text-3xl font-extrabold tracking-tight" [ngClass]="getTextColorClass()">
          {{ score }}
        </span>
        <span class="text-[10px] uppercase font-bold tracking-wider text-slate-500">
          / 100
        </span>
      </div>
    </div>
  `
})
export class RiskScoreGaugeComponent {
  @Input() score: number = 0;
  @Input() level: RiskLevel = 'LOW';
  @Input() size: number = 110;
  @Input() strokeWidth: number = 9;

  get center(): number {
    return this.size / 2;
  }

  get radius(): number {
    return (this.size - this.strokeWidth * 2) / 2;
  }

  get circumference(): number {
    return 2 * Math.PI * this.radius;
  }

  get dashOffset(): number {
    const clampedScore = Math.min(Math.max(this.score, 0), 100);
    return this.circumference - (clampedScore / 100) * this.circumference;
  }

  getStrokeColor(): string {
    if (this.score <= 30) return '#16A34A'; // Emerald
    if (this.score <= 60) return '#F59E0B'; // Amber
    if (this.score <= 80) return '#EA580C'; // Orange
    return '#DC2626'; // Red
  }

  getTextColorClass(): string {
    if (this.score <= 30) return 'text-emerald-700';
    if (this.score <= 60) return 'text-amber-700';
    if (this.score <= 80) return 'text-orange-700';
    return 'text-red-700';
  }
}
