import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RiskLevel, Decision, ShipmentStatus } from '../../../core/models/fraud.model';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-risk-badge',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <span
      [class]="getBadgeClasses()"
      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border shadow-xs transition-all"
    >
      <app-icon [name]="getIconName()" [size]="14" [strokeWidth]="2.2"></app-icon>
      {{ getLabel() }}
    </span>
  `
})
export class RiskBadgeComponent {
  @Input() level?: RiskLevel;
  @Input() decision?: Decision;
  @Input() status?: ShipmentStatus;
  @Input() labelOverride?: string;

  getLabel(): string {
    if (this.labelOverride) return this.labelOverride;
    if (this.level) {
      switch (this.level) {
        case 'LOW': return 'LOW RISK';
        case 'MEDIUM': return 'MEDIUM RISK';
        case 'HIGH': return 'HIGH RISK';
        case 'CRITICAL': return 'CRITICAL RISK';
      }
    }
    if (this.decision) {
      switch (this.decision) {
        case 'ALLOW': return 'ALLOW';
        case 'VERIFY': return 'VERIFY';
        case 'HOLD': return 'ON HOLD';
        case 'BLOCK': return 'BLOCKED';
      }
    }
    if (this.status) {
      switch (this.status) {
        case 'APPROVED': return 'APPROVED';
        case 'UNDER_REVIEW': return 'UNDER REVIEW';
        case 'ON_HOLD': return 'ON HOLD';
        case 'BLOCKED': return 'BLOCKED';
        case 'VERIFIED': return 'VERIFIED';
      }
    }
    return 'UNKNOWN';
  }

  getIconName(): string {
    const key = (this.level || this.decision || this.status || '').toString();
    if (key.includes('LOW') || key.includes('ALLOW') || key.includes('APPROVED') || key.includes('VERIFIED')) {
      return 'check-circle';
    }
    if (key.includes('MEDIUM') || key.includes('VERIFY') || key.includes('REVIEW')) {
      return 'alert-triangle';
    }
    if (key.includes('HIGH') || key.includes('HOLD')) {
      return 'shield-alert';
    }
    if (key.includes('CRITICAL') || key.includes('BLOCK')) {
      return 'x-circle';
    }
    return 'shield';
  }

  getBadgeClasses(): string {
    const key = (this.level || this.decision || this.status || '').toString();
    if (key.includes('LOW') || key.includes('ALLOW') || key.includes('APPROVED') || key.includes('VERIFIED')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (key.includes('MEDIUM') || key.includes('VERIFY') || key.includes('REVIEW')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    if (key.includes('HIGH') || key.includes('HOLD')) {
      return 'bg-orange-50 text-orange-700 border-orange-200';
    }
    if (key.includes('CRITICAL') || key.includes('BLOCK')) {
      return 'bg-red-50 text-red-800 border-red-200 font-bold';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}
