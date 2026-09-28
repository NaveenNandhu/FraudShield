import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FraudDetectionService } from '../../core/services/fraud-detection.service';
import { StatCardComponent } from '../../shared/components/ui/stat-card.component';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, StatCardComponent, IconComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">
            Fraud Intelligence & Loss Analytics
          </h1>
          <p class="text-xs text-slate-500 mt-1">
            Quantitative metrics, model precision rates, hazard distribution by route and service tier.
          </p>
        </div>

        <button class="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition-all inline-flex items-center gap-1.5 shadow-xs">
          <app-icon name="download" [size]="14"></app-icon> Export Risk Report (PDF)
        </button>
      </div>

      <!-- Core Performance Metrics Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <app-stat-card
          label="Fraud Detection Rate"
          value="98.4%"
          icon="shield-check"
          iconContainerBg="bg-emerald-50"
          iconColorClass="text-emerald-600"
          badgeText="+0.6% vs Target"
          badgeBgClass="bg-emerald-100 text-emerald-800"
        ></app-stat-card>

        <app-stat-card
          label="False Positive Rate"
          value="1.2%"
          icon="alert-triangle"
          iconContainerBg="bg-blue-50"
          iconColorClass="text-blue-600"
          badgeText="Optimal Benchmark"
          badgeBgClass="bg-blue-100 text-blue-800"
        ></app-stat-card>

        <app-stat-card
          label="Prevented Loss"
          value="₹18.4 Lakhs"
          icon="lock"
          iconContainerBg="bg-purple-50"
          iconColorClass="text-purple-600"
          description="Total financial exposure blocked"
        ></app-stat-card>

        <app-stat-card
          label="Avg Model Inference"
          value="142 ms"
          icon="cpu"
          iconContainerBg="bg-slate-100"
          iconColorClass="text-slate-700"
          description="Ultra-low booking latency"
        ></app-stat-card>
      </div>

      <!-- Charts & Visual Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Fraud Heatmap by Destination Route -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 class="font-bold text-slate-900 text-sm">
                Fraud Risk Concentration by Destination
              </h3>
              <p class="text-xs text-slate-500">Highest hazard shipping corridors over 30 days</p>
            </div>
            <app-icon name="package" [size]="18" class="text-slate-400"></app-icon>
          </div>

          <div class="space-y-3">
            <div *ngFor="let item of metrics.destinationHeatmap" class="space-y-1">
              <div class="flex items-center justify-between text-xs">
                <span class="font-bold text-slate-800">{{ item.destination }}</span>
                <span class="text-slate-600 font-semibold">{{ item.riskCount }} Incidents ({{ item.percentage }}%)</span>
              </div>
              <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  class="bg-gradient-to-r from-orange-500 to-red-600 h-full rounded-full"
                  [style.width.%]="item.percentage * 3"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Fraud Distribution by Delivery Service Tier -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 class="font-bold text-slate-900 text-sm">
                Fraud Distribution by Service Tier
              </h3>
              <p class="text-xs text-slate-500">Hazard likelihood across shipping options</p>
            </div>
            <app-icon name="zap" [size]="18" class="text-amber-500"></app-icon>
          </div>

          <div class="space-y-4 pt-2">
            <div *ngFor="let service of metrics.serviceTypeRisk" class="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <span class="font-bold text-slate-900 text-xs block">{{ service.service }}</span>
                <span class="text-[11px] text-slate-500 block">Relative risk exposure</span>
              </div>

              <div class="text-right">
                <span class="text-base font-extrabold text-red-700 block">{{ service.riskPercentage }}%</span>
                <span class="text-[10px] text-slate-400">High Risk Rate</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AnalyticsComponent {
  fraudService = inject(FraudDetectionService);
  metrics = this.fraudService.getDashboardMetrics();
}
