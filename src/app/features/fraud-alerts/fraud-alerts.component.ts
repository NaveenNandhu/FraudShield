import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FraudDetectionService } from '../../core/services/fraud-detection.service';
import { RiskBadgeComponent } from '../../shared/components/ui/risk-badge.component';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-fraud-alerts',
  standalone: true,
  imports: [CommonModule, RouterModule, RiskBadgeComponent, IconComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">
              Live Fraud Alerts Feed
            </h1>
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
              <span class="w-2 h-2 rounded-full bg-red-600 animate-ping"></span> Real-Time Stream
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-1">
            Automated alerts generated when shipment bookings exceed configured risk thresholds.
          </p>
        </div>
      </div>

      <div class="space-y-4">
        <ng-container *ngFor="let alert of alerts()">
          <div
            class="bg-white p-5 rounded-2xl border shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            [class.border-red-300]="alert.riskLevel === 'CRITICAL'"
            [class.bg-red-50]="alert.riskLevel === 'CRITICAL'"
            [class.border-orange-200]="alert.riskLevel === 'HIGH'"
          >
            <div class="flex items-start gap-4">
              <div
                [class]="alert.riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'"
                class="p-3 rounded-xl shrink-0 mt-0.5"
              >
                <app-icon name="shield-alert" [size]="22"></app-icon>
              </div>

              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-extrabold text-sm text-slate-900">{{ alert.shipmentId }}</span>
                  <app-risk-badge [level]="alert.riskLevel"></app-risk-badge>
                  <span class="text-xs font-extrabold text-slate-700">Risk Score: {{ alert.riskScore }}/100</span>
                  <span class="text-xs text-slate-400">• {{ alert.timeAgo }}</span>
                </div>

                <p class="text-xs text-slate-700 font-medium mt-1.5 leading-relaxed">
                  "{{ alert.summary }}"
                </p>

                <div class="mt-2 flex items-center gap-4 text-xs text-slate-500">
                  <span>Shipper: <strong>{{ alert.shipperName }}</strong></span>
                  <span>Destination: <strong>{{ alert.destination }}</strong></span>
                  <span>Declared Value: <strong>₹{{ alert.declaredValue | number }}</strong></span>
                </div>
              </div>
            </div>

            <div class="shrink-0">
              <a
                [routerLink]="['/investigations', alert.shipmentId]"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-xs transition-all flex items-center gap-1.5"
              >
                <span>Investigate Anomaly</span>
                <app-icon name="arrow-right" [size]="14"></app-icon>
              </a>
            </div>
          </div>
        </ng-container>
      </div>
    </div>
  `
})
export class FraudAlertsComponent {
  fraudService = inject(FraudDetectionService);
  alerts = this.fraudService.alerts;
}
