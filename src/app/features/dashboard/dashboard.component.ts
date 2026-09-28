import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { FraudDetectionService } from '../../core/services/fraud-detection.service';
import { StatCardComponent } from '../../shared/components/ui/stat-card.component';
import { RiskBadgeComponent } from '../../shared/components/ui/risk-badge.component';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    StatCardComponent,
    RiskBadgeComponent,
    IconComponent
  ],
  template: `
    <div class="space-y-6">
      <!-- ================= SHIPPER VIEW ================= -->
      <ng-container *ngIf="authService.isShipper()">
        <!-- Shipper Welcome Header -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">
                Good morning, {{ authService.currentUser().name }}
              </h1>
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <app-icon name="check-circle" [size]="12"></app-icon> Account Verified
              </span>
            </div>
            <p class="text-xs text-slate-500 mt-1">
              Here's what's happening with your shipments across the network today.
            </p>
          </div>

          <a
            [routerLink]="['/shipments/create']"
            class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-md transition-all flex items-center gap-2 text-sm shrink-0"
          >
            <app-icon name="plus" [size]="18"></app-icon>
            <span>Create Shipment</span>
          </a>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <app-stat-card
            label="Total Shipments"
            [value]="shipments().length"
            icon="package"
            iconContainerBg="bg-blue-50"
            iconColorClass="text-blue-600"
            description="Lifetime bookings on account"
          ></app-stat-card>

          <app-stat-card
            label="Approved & Transit"
            [value]="approvedCount()"
            icon="check-circle"
            iconContainerBg="bg-emerald-50"
            iconColorClass="text-emerald-600"
            badgeText="98.2% Pass Rate"
            badgeBgClass="bg-emerald-100 text-emerald-800"
          ></app-stat-card>

          <app-stat-card
            label="Under Review"
            [value]="reviewCount()"
            icon="alert-triangle"
            iconContainerBg="bg-amber-50"
            iconColorClass="text-amber-600"
            badgeText="Action Needed"
            badgeBgClass="bg-amber-100 text-amber-800"
          ></app-stat-card>

          <app-stat-card
            label="On Hold"
            [value]="holdCount()"
            icon="shield-alert"
            iconContainerBg="bg-orange-50"
            iconColorClass="text-orange-600"
            description="Verification pending"
          ></app-stat-card>
        </div>

        <!-- Recent Shipments Table -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div class="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 class="font-bold text-slate-900 text-base">
                Recent Shipments
              </h3>
              <p class="text-xs text-slate-500">Live booking status and real-time fraud checks</p>
            </div>

            <a [routerLink]="['/shipments']" class="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View All Shipments <app-icon name="arrow-right" [size]="14"></app-icon>
            </a>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-600">
              <thead class="bg-slate-50 text-slate-500 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-200">
                <tr>
                  <th class="py-3.5 px-4">Shipment ID</th>
                  <th class="py-3.5 px-4">Destination</th>
                  <th class="py-3.5 px-4">Weight</th>
                  <th class="py-3.5 px-4">Service</th>
                  <th class="py-3.5 px-4">Created</th>
                  <th class="py-3.5 px-4">Status</th>
                  <th class="py-3.5 px-4">Fraud Risk</th>
                  <th class="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr *ngFor="let s of shipments()" class="hover:bg-slate-50/80 transition-colors">
                  <td class="py-3.5 px-4 font-bold text-slate-900">
                    {{ s.id }}
                  </td>
                  <td class="py-3.5 px-4">
                    <span class="font-medium text-slate-800">{{ s.destination }}</span>
                    <span class="block text-[10px] text-slate-400">From {{ s.origin }}</span>
                  </td>
                  <td class="py-3.5 px-4 font-semibold text-slate-700">
                    {{ s.weight }} kg
                  </td>
                  <td class="py-3.5 px-4">
                    <span class="inline-block px-2 py-0.5 bg-slate-100 rounded text-[11px] font-medium text-slate-700">
                      {{ s.serviceType }}
                    </span>
                  </td>
                  <td class="py-3.5 px-4 text-slate-500">
                    {{ s.createdDate }} at {{ s.createdTime }}
                  </td>
                  <td class="py-3.5 px-4">
                    <app-risk-badge [status]="s.status"></app-risk-badge>
                  </td>
                  <td class="py-3.5 px-4">
                    <div class="flex items-center gap-2">
                      <span class="font-extrabold text-xs" [ngClass]="getRiskScoreColor(s.analysis.riskScore)">
                        {{ s.analysis.riskScore }}/100
                      </span>
                      <app-risk-badge [level]="s.analysis.riskLevel"></app-risk-badge>
                    </div>
                  </td>
                  <td class="py-3.5 px-4 text-right">
                    <button
                      *ngIf="s.status === 'ON_HOLD' || s.status === 'UNDER_REVIEW'"
                      [routerLink]="['/verification']"
                      class="px-2.5 py-1 text-[11px] font-bold bg-amber-100 text-amber-800 hover:bg-amber-200 rounded-lg transition-all"
                    >
                      Verify Now
                    </button>
                    <a
                      *ngIf="s.status !== 'ON_HOLD' && s.status !== 'UNDER_REVIEW'"
                      [routerLink]="['/shipments', s.id]"
                      class="text-blue-600 hover:underline font-semibold"
                    >
                      Details
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </ng-container>

      <!-- ================= ADMIN / FRAUD ANALYST VIEW ================= -->
      <ng-container *ngIf="authService.isAdmin()">
        <!-- Operations Center Banner -->
        <div class="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 rounded-2xl text-white border border-slate-700 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
              <h1 class="text-2xl font-extrabold tracking-tight">
                Fraud Operations Center
              </h1>
            </div>
            <p class="text-xs text-slate-300 mt-1">
              AI-driven early booking risk detection, live network scoring, and prevented loss monitoring.
            </p>
          </div>

          <div class="flex items-center gap-3">
            <a
              [routerLink]="['/fraud-alerts']"
              class="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md"
            >
              <app-icon name="bell" [size]="14"></app-icon> Live Alerts (3 New)
            </a>

            <a
              [routerLink]="['/analytics']"
              class="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-xl text-xs transition-all flex items-center gap-1.5"
            >
              <app-icon name="bar-chart" [size]="14"></app-icon> Analytics
            </a>
          </div>
        </div>

        <!-- Metric Stat Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <app-stat-card
            label="Total Bookings"
            [value]="formattedTotalBookings"
            icon="package"
            iconContainerBg="bg-blue-50"
            iconColorClass="text-blue-600"
            description="24-hour total volume"
          ></app-stat-card>

          <app-stat-card
            label="Flagged Bookings"
            [value]="metrics.flaggedBookings"
            icon="alert-triangle"
            iconContainerBg="bg-amber-50"
            iconColorClass="text-amber-600"
            badgeText="1.47% Flag Rate"
            badgeBgClass="bg-amber-100 text-amber-800"
          ></app-stat-card>

          <app-stat-card
            label="Under Review"
            [value]="metrics.underReview"
            icon="clock"
            iconContainerBg="bg-purple-50"
            iconColorClass="text-purple-600"
            description="Pending analyst review"
          ></app-stat-card>

          <app-stat-card
            label="Blocked Shipments"
            [value]="metrics.blocked"
            icon="x-circle"
            iconContainerBg="bg-red-50"
            iconColorClass="text-red-600"
            badgeText="Strict Hold"
            badgeBgClass="bg-red-100 text-red-800"
          ></app-stat-card>

          <app-stat-card
            label="Prevented Loss"
            value="₹18.4L"
            icon="shield-check"
            iconContainerBg="bg-emerald-50"
            iconColorClass="text-emerald-600"
            badgeText="+₹2.1L Today"
            badgeBgClass="bg-emerald-100 text-emerald-800 font-bold"
          ></app-stat-card>
        </div>

        <!-- Risk Distribution & Trend Charts Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Risk Distribution Breakdown -->
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-bold text-slate-900 text-sm">
                Risk Level Breakdown
              </h3>
              <span class="text-xs text-slate-400">Total Scored</span>
            </div>

            <div class="space-y-3">
              <div>
                <div class="flex justify-between text-xs font-semibold mb-1">
                  <span class="text-emerald-700">Low Risk (0-30)</span>
                  <span class="text-slate-800">11,820 (94.9%)</span>
                </div>
                <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div class="bg-emerald-600 h-full rounded-full" style="width: 94.9%"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between text-xs font-semibold mb-1">
                  <span class="text-amber-700">Medium Risk (31-60)</span>
                  <span class="text-slate-800">446 (3.6%)</span>
                </div>
                <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div class="bg-amber-500 h-full rounded-full" style="width: 3.6%"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between text-xs font-semibold mb-1">
                  <span class="text-orange-700">High Risk (61-80)</span>
                  <span class="text-slate-800">142 (1.1%)</span>
                </div>
                <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div class="bg-orange-600 h-full rounded-full" style="width: 1.1%"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between text-xs font-semibold mb-1">
                  <span class="text-red-700 font-bold">Critical Risk (81-100)</span>
                  <span class="text-red-800 font-bold">42 (0.3%)</span>
                </div>
                <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div class="bg-red-700 h-full rounded-full" style="width: 0.3%"></div>
                </div>
              </div>
            </div>

            <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Model Accuracy: <strong>98.4%</strong></span>
              <span>False Positive: <strong>1.2%</strong></span>
            </div>
          </div>

          <!-- Fraud Trend Timeline -->
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="font-bold text-slate-900 text-sm">
                  Booking Volume vs. Flagged Fraud Trend
                </h3>
                <p class="text-xs text-slate-400">24-hour hourly anomaly distribution</p>
              </div>

              <div class="flex items-center gap-3 text-xs font-medium">
                <span class="flex items-center gap-1"><span class="w-3 h-3 bg-blue-500 rounded-xs"></span> Total</span>
                <span class="flex items-center gap-1"><span class="w-3 h-3 bg-red-500 rounded-xs"></span> Flagged</span>
              </div>
            </div>

            <!-- Custom Visual Bar Chart for Fraud Trend -->
            <div class="h-44 flex items-end justify-between gap-2 pt-6 px-2 border-b border-slate-200">
              <div *ngFor="let label of metrics.trendData.labels; let i = index" class="flex-1 flex flex-col items-center gap-1 group relative">
                <!-- Tooltip -->
                <div class="opacity-0 group-hover:opacity-100 absolute -top-10 bg-slate-900 text-white text-[10px] py-1 px-2 rounded shadow-lg pointer-events-none transition-opacity z-10 whitespace-nowrap">
                  Total: {{ metrics.trendData.total[i] }} | Flagged: {{ metrics.trendData.flagged[i] }}
                </div>

                <div class="w-full flex items-end justify-center gap-1 h-36">
                  <!-- Total Bar -->
                  <div
                    class="w-3.5 bg-blue-200 group-hover:bg-blue-300 rounded-t transition-all"
                    [style.height.%]="(metrics.trendData.total[i] / 1200) * 100"
                  ></div>
                  <!-- Flagged Bar -->
                  <div
                    class="w-3.5 bg-red-600 group-hover:bg-red-700 rounded-t transition-all"
                    [style.height.%]="(metrics.trendData.flagged[i] / 60) * 100"
                  ></div>
                </div>

                <span class="text-[10px] text-slate-400 mt-1 font-semibold">{{ label }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- High-Risk Bookings Needing Analyst Action -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div class="p-5 border-b border-slate-200 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="p-2 bg-red-100 text-red-700 rounded-lg">
                <app-icon name="shield-alert" [size]="18"></app-icon>
              </div>
              <div>
                <h3 class="font-bold text-slate-900 text-base">
                  Flagged Bookings Requiring Investigation
                </h3>
                <p class="text-xs text-slate-500">Real-time queue sorted by Risk Score severity</p>
              </div>
            </div>

            <a [routerLink]="['/investigations']" class="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
              Open Operations Queue <app-icon name="arrow-right" [size]="14"></app-icon>
            </a>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-600">
              <thead class="bg-slate-50 text-slate-500 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-200">
                <tr>
                  <th class="py-3.5 px-4">Shipment ID</th>
                  <th class="py-3.5 px-4">Shipper Account</th>
                  <th class="py-3.5 px-4">Route</th>
                  <th class="py-3.5 px-4">Declared Value</th>
                  <th class="py-3.5 px-4">Risk Score</th>
                  <th class="py-3.5 px-4">Primary Anomaly Signal</th>
                  <th class="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr *ngFor="let s of flaggedShipments()" class="hover:bg-slate-50/80 transition-colors">
                  <td class="py-3.5 px-4 font-extrabold text-slate-900">
                    {{ s.id }}
                  </td>
                  <td class="py-3.5 px-4">
                    <span class="font-semibold text-slate-800 block">{{ s.shipperName }}</span>
                    <span class="text-[10px] text-slate-400 block">{{ s.shipperId }}</span>
                  </td>
                  <td class="py-3.5 px-4">
                    <span class="font-medium text-slate-700">{{ s.origin }} → {{ s.destination }}</span>
                  </td>
                  <td class="py-3.5 px-4 font-semibold text-slate-800">
                    ₹{{ s.declaredValue | number }}
                  </td>
                  <td class="py-3.5 px-4">
                    <div class="flex items-center gap-2">
                      <span class="font-extrabold text-xs" [ngClass]="getRiskScoreColor(s.analysis.riskScore)">
                        {{ s.analysis.riskScore }}/100
                      </span>
                      <app-risk-badge [level]="s.analysis.riskLevel"></app-risk-badge>
                    </div>
                  </td>
                  <td class="py-3.5 px-4 max-w-xs truncate text-slate-700">
                    {{ getSignalName(s) }}
                  </td>
                  <td class="py-3.5 px-4 text-right">
                    <a
                      [routerLink]="['/investigations', s.id]"
                      class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-all inline-flex items-center gap-1 shadow-xs"
                    >
                      <span>Investigate</span>
                      <app-icon name="arrow-right" [size]="12"></app-icon>
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </ng-container>
    </div>
  `
})
export class DashboardComponent {
  authService = inject(AuthService);
  fraudService = inject(FraudDetectionService);

  shipments = this.fraudService.shipments;
  metrics = this.fraudService.getDashboardMetrics();

  get formattedTotalBookings(): string {
    return this.metrics.totalBookings.toLocaleString();
  }

  approvedCount(): number {
    return this.shipments().filter(s => s.status === 'APPROVED' || s.status === 'VERIFIED').length;
  }

  reviewCount(): number {
    return this.shipments().filter(s => s.status === 'UNDER_REVIEW').length;
  }

  holdCount(): number {
    return this.shipments().filter(s => s.status === 'ON_HOLD').length;
  }

  flaggedShipments() {
    return this.shipments().filter(s => s.analysis.riskScore >= 50);
  }

  getSignalName(shipment: any): string {
    if (shipment && shipment.analysis && shipment.analysis.signals && shipment.analysis.signals.length > 0) {
      return shipment.analysis.signals[0].name;
    }
    return 'Behavioral anomaly';
  }

  getRiskScoreColor(score: number): string {
    if (score <= 30) return 'text-emerald-700';
    if (score <= 60) return 'text-amber-700';
    if (score <= 80) return 'text-orange-700';
    return 'text-red-700';
  }
}
