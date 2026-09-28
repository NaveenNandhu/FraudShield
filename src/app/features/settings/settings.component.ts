import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FraudDetectionService } from '../../core/services/fraud-detection.service';
import { AuthService } from '../../core/services/auth.service';
import { RiskThresholds } from '../../core/models/fraud.model';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">
          System Settings & Risk Engine Configuration
        </h1>
        <p class="text-xs text-slate-500 mt-1">
          Adjust risk score classification boundaries, notification triggers, and operational security parameters.
        </p>
      </div>

      <!-- RISK THRESHOLDS CONFIGURATION (Requirement #23) -->
      <div *ngIf="authService.isAdmin()" class="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2">
            <div class="p-2 bg-purple-100 text-purple-700 rounded-lg">
              <app-icon name="sliders" [size]="18"></app-icon>
            </div>
            <div>
              <h3 class="font-bold text-slate-900 text-base">
                Risk Score Classification Thresholds
              </h3>
              <p class="text-xs text-slate-500">Configure score ranges triggering automated decisions</p>
            </div>
          </div>

          <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Live Configuration
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <!-- Low Risk Boundary -->
          <div class="p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 space-y-2">
            <div class="flex justify-between font-bold text-emerald-900">
              <span>Low Risk (ALLOW)</span>
              <span>0 - {{ thresholds.lowMax }}</span>
            </div>
            <p class="text-slate-500 text-[11px]">Bookings below this threshold enter normal automated dispatch.</p>
            <input
              type="range"
              min="10"
              max="40"
              [(ngModel)]="thresholds.lowMax"
              class="w-full accent-emerald-600"
            />
          </div>

          <!-- Medium Risk Boundary -->
          <div class="p-4 rounded-xl border border-amber-200 bg-amber-50/20 space-y-2">
            <div class="flex justify-between font-bold text-amber-900">
              <span>Medium Risk (VERIFY)</span>
              <span>{{ thresholds.lowMax + 1 }} - {{ thresholds.mediumMax }}</span>
            </div>
            <p class="text-slate-500 text-[11px]">Triggers routine verification and analyst queueing.</p>
            <input
              type="range"
              min="41"
              max="70"
              [(ngModel)]="thresholds.mediumMax"
              class="w-full accent-amber-600"
            />
          </div>

          <!-- High Risk Boundary -->
          <div class="p-4 rounded-xl border border-orange-200 bg-orange-50/20 space-y-2">
            <div class="flex justify-between font-bold text-orange-900">
              <span>High Risk (HOLD)</span>
              <span>{{ thresholds.mediumMax + 1 }} - {{ thresholds.highMax }}</span>
            </div>
            <p class="text-slate-500 text-[11px]">Places shipment on hold at origin facility immediately.</p>
            <input
              type="range"
              min="71"
              max="90"
              [(ngModel)]="thresholds.highMax"
              class="w-full accent-orange-600"
            />
          </div>

          <!-- Critical Risk Boundary -->
          <div class="p-4 rounded-xl border border-red-200 bg-red-50/20 space-y-2">
            <div class="flex justify-between font-bold text-red-900">
              <span>Critical Risk (BLOCK)</span>
              <span>{{ thresholds.highMax + 1 }} - 100</span>
            </div>
            <p class="text-slate-500 text-[11px]">Strict network block and immediate account freeze.</p>
            <input
              type="range"
              min="91"
              max="100"
              [(ngModel)]="thresholds.criticalMax"
              class="w-full accent-red-600"
            />
          </div>
        </div>

        <div class="pt-2 border-t border-slate-100 flex justify-end">
          <button
            (click)="saveThresholds()"
            class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <app-icon name="shield-check" [size]="14"></app-icon> Save Threshold Configuration
          </button>
        </div>
      </div>

      <!-- NOTIFICATION & SECURITY SETTINGS -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
        <h3 class="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
          Notification & Alert Preferences
        </h3>

        <div class="space-y-4 text-xs">
          <div class="flex items-center justify-between">
            <div>
              <span class="font-bold text-slate-800 block">Critical Risk Immediate Alerts</span>
              <span class="text-slate-500 block">Notify operations team via Webhook and SMS for score > 80</span>
            </div>
            <input type="checkbox" checked class="h-4 w-4 text-blue-600 rounded border-slate-300" />
          </div>

          <div class="flex items-center justify-between">
            <div>
              <span class="font-bold text-slate-800 block">Daily Prevented Loss Digest</span>
              <span class="text-slate-500 block">Send daily executive summary report at 08:00 AM</span>
            </div>
            <input type="checkbox" checked class="h-4 w-4 text-blue-600 rounded border-slate-300" />
          </div>
        </div>
      </div>
    </div>
  `
})
export class SettingsComponent {
  fraudService = inject(FraudDetectionService);
  authService = inject(AuthService);

  thresholds: RiskThresholds = { ...this.fraudService.riskThresholds() };

  saveThresholds(): void {
    this.fraudService.updateRiskThresholds(this.thresholds);
    alert('Risk thresholds saved successfully!');
  }
}
