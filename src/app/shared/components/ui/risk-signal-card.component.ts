import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RiskSignal } from '../../../core/models/fraud.model';
import { RiskBadgeComponent } from './risk-badge.component';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-risk-signal-card',
  standalone: true,
  imports: [CommonModule, RiskBadgeComponent, IconComponent],
  template: `
    <div [class]="getBorderClass()" class="p-4 rounded-xl border bg-white shadow-xs transition-all hover:shadow-card">
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-start gap-3">
          <div [class]="getCategoryBgClass()" class="p-2 rounded-lg shrink-0 mt-0.5">
            <app-icon [name]="getCategoryIcon()" [size]="18" [class]="getCategoryIconColor()"></app-icon>
          </div>
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h4 class="font-semibold text-slate-900 text-sm">
                {{ signal.name }}
              </h4>
              <app-risk-badge [level]="signal.severity"></app-risk-badge>
            </div>
            <p class="text-xs text-slate-600 mt-1.5 leading-relaxed">
              {{ signal.description }}
            </p>
          </div>
        </div>

        <div class="shrink-0 text-right">
          <span [class]="getScoreContributionClass()" class="inline-block px-2.5 py-1 rounded-md text-xs font-bold">
            +{{ signal.contribution }} pts
          </span>
        </div>
      </div>

      <!-- Historical vs Current Breakdown -->
      <div *ngIf="signal.historicalValue || signal.currentValue" class="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
        <div class="bg-slate-50 p-2 rounded-lg">
          <span class="text-slate-600 block text-[11px]">30-Day Historical Baseline</span>
          <span class="font-semibold text-slate-700 mt-0.5 block">
            {{ signal.historicalValue || 'Standard' }}
          </span>
        </div>

        <div [class]="getCurrentValueBgClass()" class="p-2 rounded-lg">
          <span class="text-slate-600 block text-[11px]">Current Shipment Signal</span>
          <span [class]="getCurrentValueTextClass()" class="font-bold mt-0.5 block">
            {{ signal.currentValue || 'Elevated' }}
          </span>
        </div>
      </div>
    </div>
  `
})
export class RiskSignalCardComponent {
  @Input() signal!: RiskSignal;

  getBorderClass(): string {
    if (this.signal?.severity === 'CRITICAL') return 'border-red-200 bg-red-50/20';
    if (this.signal?.severity === 'HIGH') return 'border-orange-200 bg-orange-50/10';
    if (this.signal?.severity === 'MEDIUM') return 'border-amber-200';
    return 'border-slate-200';
  }

  getScoreContributionClass(): string {
    if (this.signal?.severity === 'CRITICAL') return 'bg-red-100 text-red-800';
    if (this.signal?.severity === 'HIGH') return 'bg-orange-100 text-orange-800';
    if (this.signal?.severity === 'MEDIUM') return 'bg-amber-100 text-amber-800';
    return 'bg-emerald-100 text-emerald-800';
  }

  getCategoryIcon(): string {
    switch (this.signal?.category) {
      case 'BEHAVIORAL': return 'trending-up';
      case 'DESTINATION': return 'package';
      case 'PACKAGE': return 'package';
      case 'PAYMENT': return 'lock';
      case 'ACCOUNT': return 'user';
      case 'VELOCITY': return 'zap';
      default: return 'alert-triangle';
    }
  }

  getCategoryBgClass(): string {
    switch (this.signal?.severity) {
      case 'CRITICAL': return 'bg-red-100';
      case 'HIGH': return 'bg-orange-100';
      case 'MEDIUM': return 'bg-amber-100';
      default: return 'bg-blue-100';
    }
  }

  getCategoryIconColor(): string {
    switch (this.signal?.severity) {
      case 'CRITICAL': return 'text-red-700';
      case 'HIGH': return 'text-orange-700';
      case 'MEDIUM': return 'text-amber-700';
      default: return 'text-blue-700';
    }
  }

  getCurrentValueBgClass(): string {
    if (this.signal?.severity === 'CRITICAL') return 'bg-red-50';
    if (this.signal?.severity === 'HIGH') return 'bg-orange-50';
    return 'bg-amber-50';
  }

  getCurrentValueTextClass(): string {
    if (this.signal?.severity === 'CRITICAL') return 'text-red-800';
    if (this.signal?.severity === 'HIGH') return 'text-orange-800';
    return 'text-amber-800';
  }
}
