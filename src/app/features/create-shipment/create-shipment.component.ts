import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { FraudDetectionService } from '../../core/services/fraud-detection.service';
import { Shipment, FraudAnalysis, ServiceType } from '../../core/models/fraud.model';
import { RiskBadgeComponent } from '../../shared/components/ui/risk-badge.component';
import { RiskScoreGaugeComponent } from '../../shared/components/ui/risk-score-gauge.component';
import { RiskSignalCardComponent } from '../../shared/components/ui/risk-signal-card.component';
import { AIInsightCardComponent } from '../../shared/components/ui/ai-insight-card.component';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-create-shipment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    RiskBadgeComponent,
    RiskScoreGaugeComponent,
    RiskSignalCardComponent,
    AIInsightCardComponent,
    IconComponent
  ],
  template: `
    <div class="space-y-6 max-w-4xl mx-auto">
      <!-- Breadcrumb Header -->
      <div class="flex items-center justify-between">
        <div>
          <div class="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <a [routerLink]="['/dashboard']" class="hover:underline">Dashboard</a>
            <span>/</span>
            <span class="text-slate-800 font-medium">Create Shipment</span>
          </div>
          <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">
            New Shipping Booking
          </h1>
        </div>

        <div class="hidden sm:flex items-center gap-2">
          <span class="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5">
            <app-icon name="cpu" [size]="14"></app-icon> Real-Time ML Fraud Shield Active
          </span>
        </div>
      </div>

      <!-- STATE 1: MULTI-SECTION FORM -->
      <div *ngIf="viewState === 'FORM'" class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <!-- Form Header -->
        <div class="p-6 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="font-bold text-slate-900 text-base">
              Shipment & Cargo Details
            </h2>
            <p class="text-xs text-slate-500 mt-0.5">
              Fill in booking parameters for immediate automated risk analysis and route pre-screening.
            </p>
          </div>
        </div>

        <!-- Quick Fill Cargo Templates -->
        <div class="px-6 py-3 bg-slate-100/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <app-icon name="zap" [size]="14" class="text-blue-600"></app-icon>
            <span>Quick Fill Sample Cargo:</span>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              (click)="loadCargoTemplate('STANDARD')"
              class="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg shadow-2xs transition-all flex items-center gap-1.5"
            >
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              Standard Local Parcel
            </button>

            <button
              type="button"
              (click)="loadCargoTemplate('SUSPICIOUS')"
              class="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg shadow-2xs transition-all flex items-center gap-1.5"
            >
              <span class="w-2 h-2 rounded-full bg-amber-500"></span>
              Express Air Freight
            </button>

            <button
              type="button"
              (click)="loadCargoTemplate('FRAUD_BURST')"
              class="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg shadow-2xs transition-all flex items-center gap-1.5"
            >
              <span class="w-2 h-2 rounded-full bg-red-500"></span>
              Heavy High-Value Cargo
            </button>
          </div>
        </div>

        <form (submit)="onStartAnalysis($event)" class="p-6 space-y-8">
          <!-- SECTION 1: SHIPPER INFORMATION -->
          <div class="space-y-4">
            <div class="flex items-center gap-2 border-b border-slate-100 pb-2">
              <span class="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">1</span>
              <h3 class="font-bold text-slate-900 text-sm">Shipper Information</h3>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Shipper Name</label>
                <input type="text" [(ngModel)]="form.shipperName" name="shipperName" class="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-slate-50 text-slate-700" readonly />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Account ID</label>
                <input type="text" [(ngModel)]="form.shipperId" name="shipperId" class="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-slate-50 text-slate-700" readonly />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
                <input type="text" [(ngModel)]="form.shipperContact" name="shipperContact" class="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Pickup Facility Location</label>
                <input type="text" [(ngModel)]="form.origin" name="origin" class="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
              </div>
            </div>
          </div>

          <!-- SECTION 2: DESTINATION -->
          <div class="space-y-4">
            <div class="flex items-center gap-2 border-b border-slate-100 pb-2">
              <span class="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">2</span>
              <h3 class="font-bold text-slate-900 text-sm">Destination & Recipient</h3>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Destination Address / Hub</label>
                <input type="text" [(ngModel)]="form.destination" name="destination" class="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Recipient Organization / Name</label>
                <input type="text" [(ngModel)]="form.recipientName" name="recipientName" class="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
              </div>
              <div class="sm:col-span-2">
                <label class="block text-xs font-semibold text-slate-700 mb-1">Recipient Phone Contact</label>
                <input type="text" [(ngModel)]="form.recipientContact" name="recipientContact" class="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
              </div>
            </div>
          </div>

          <!-- SECTION 3: PACKAGE DETAILS -->
          <div class="space-y-4">
            <div class="flex items-center gap-2 border-b border-slate-100 pb-2">
              <span class="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">3</span>
              <h3 class="font-bold text-slate-900 text-sm">Package & Cargo Specifications</h3>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Cargo Type</label>
                <select [(ngModel)]="form.packageType" name="packageType" class="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                  <option value="Industrial Components">Industrial Components</option>
                  <option value="Mechanical Spares">Mechanical Spares</option>
                  <option value="Consumer Electronics">Consumer Electronics</option>
                  <option value="Garments & Fabrics">Garments & Fabrics</option>
                  <option value="Chemicals & Liquids">Chemicals & Liquids</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Weight (kg)</label>
                <input type="number" [(ngModel)]="form.weight" name="weight" min="1" class="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Declared Value (INR ₹)</label>
                <input type="number" [(ngModel)]="form.declaredValue" name="declaredValue" min="500" class="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
              </div>
            </div>
          </div>

          <!-- SECTION 4: SERVICE TYPE -->
          <div class="space-y-4">
            <div class="flex items-center gap-2 border-b border-slate-100 pb-2">
              <span class="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">4</span>
              <h3 class="font-bold text-slate-900 text-sm">Delivery Service Tier</h3>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                (click)="form.serviceType = 'STANDARD'"
                [class]="form.serviceType === 'STANDARD' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200'"
                class="p-4 rounded-xl border cursor-pointer transition-all hover:border-blue-400"
              >
                <span class="font-bold text-xs text-slate-900 block">Standard Ground</span>
                <span class="text-[11px] text-slate-500 block mt-1">3-5 Business Days</span>
              </div>

              <div
                (click)="form.serviceType = 'EXPRESS'"
                [class]="form.serviceType === 'EXPRESS' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200'"
                class="p-4 rounded-xl border cursor-pointer transition-all hover:border-blue-400"
              >
                <span class="font-bold text-xs text-slate-900 block">Express Air Cargo</span>
                <span class="text-[11px] text-slate-500 block mt-1">24-48 Hours Priority</span>
              </div>

              <div
                (click)="form.serviceType = 'SAME_DAY'"
                [class]="form.serviceType === 'SAME_DAY' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200'"
                class="p-4 rounded-xl border cursor-pointer transition-all hover:border-blue-400"
              >
                <span class="font-bold text-xs text-slate-900 block">Same Day Direct</span>
                <span class="text-[11px] text-slate-500 block mt-1">Immediate Dispatch</span>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="pt-4 border-t border-slate-200 flex items-center justify-between">
            <a [routerLink]="['/dashboard']" class="text-xs font-semibold text-slate-600 hover:text-slate-800">
              Cancel
            </a>

            <button
              type="submit"
              class="bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 px-6 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 text-sm"
            >
              <app-icon name="shield-check" [size]="18"></app-icon>
              <span>Analyze & Book Shipment</span>
            </button>
          </div>
        </form>
      </div>

      <!-- STATE 2: REALISTIC FRAUD ANALYSIS LOADER -->
      <div *ngIf="viewState === 'ANALYZING'" class="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center space-y-6">
        <div class="max-w-md mx-auto space-y-4">
          <div class="relative w-20 h-20 mx-auto flex items-center justify-center">
            <div class="absolute inset-0 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
            <div class="p-3 bg-blue-50 text-blue-700 rounded-full shadow-inner">
              <app-icon name="cpu" [size]="32"></app-icon>
            </div>
          </div>

          <div>
            <h2 class="text-xl font-extrabold text-slate-900 tracking-tight">
              Analyzing Shipment Risk...
            </h2>
            <p class="text-xs text-slate-500 mt-1">
              FraudShield Scikit-Learn ML engine is evaluating booking parameters against shipper baseline.
            </p>
          </div>
        </div>

        <!-- Stage Steps -->
        <div class="max-w-md mx-auto bg-slate-50 p-4 rounded-xl border border-slate-200 text-left space-y-2.5 text-xs font-medium">
          <div class="flex items-center gap-2.5" [class.text-emerald-700]="analysisStage >= 1" [class.text-slate-400]="analysisStage < 1">
            <app-icon [name]="analysisStage >= 1 ? 'check-circle' : 'clock'" [size]="16"></app-icon>
            <span>Account authentication & shipper historical profile retrieval</span>
          </div>

          <div class="flex items-center gap-2.5" [class.text-emerald-700]="analysisStage >= 2" [class.text-slate-400]="analysisStage < 2">
            <app-icon [name]="analysisStage >= 2 ? 'check-circle' : 'clock'" [size]="16"></app-icon>
            <span>Behavioral rule evaluation (weight, velocity, time, value)</span>
          </div>

          <div class="flex items-center gap-2.5" [class.text-emerald-700]="analysisStage >= 3" [class.text-slate-400]="analysisStage < 3">
            <app-icon [name]="analysisStage >= 3 ? 'check-circle' : 'clock'" [size]="16"></app-icon>
            <span>Multivariate Scikit-Learn IsolationForest & RandomForest inference</span>
          </div>

          <div class="flex items-center gap-2.5" [class.text-blue-700]="analysisStage >= 4" [class.text-slate-400]="analysisStage < 4">
            <app-icon [name]="analysisStage >= 4 ? 'cpu' : 'clock'" [size]="16"></app-icon>
            <span>Risk score synthesis & operational decision matrix generation</span>
          </div>
        </div>
      </div>

      <!-- STATE 3: FRAUD ANALYSIS RESULT DISPLAY -->
      <div *ngIf="viewState === 'RESULT' && analysisResult" class="space-y-6">
        <!-- Decision Banner Header -->
        <div [class]="getDecisionBannerClass()" class="p-6 rounded-2xl border shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="flex items-center gap-5">
            <app-risk-score-gauge
              [score]="analysisResult.riskScore"
              [level]="analysisResult.riskLevel"
              [size]="96"
            ></app-risk-score-gauge>

            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs uppercase font-extrabold tracking-wider text-slate-500">FraudShield Risk Assessment</span>
                <app-risk-badge [level]="analysisResult.riskLevel"></app-risk-badge>
              </div>

              <h2 class="text-2xl font-extrabold mt-1 tracking-tight" [ngClass]="getDecisionTitleColor()">
                DECISION: {{ getDecisionTitle() }}
              </h2>

              <p class="text-xs text-slate-600 mt-1 max-w-lg">
                Scored {{ analysisResult.riskScore }}/100 with {{ analysisResult.modelConfidence }}% ML model confidence.
              </p>
            </div>
          </div>

          <div class="shrink-0 flex items-center gap-3">
            <button
              *ngIf="analysisResult.decision === 'HOLD' || analysisResult.decision === 'VERIFY'"
              [routerLink]="['/verification']"
              class="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <app-icon name="shield-check" [size]="16"></app-icon> Complete Verification Now
            </button>

            <a
              [routerLink]="['/dashboard']"
              class="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 font-semibold text-slate-700 rounded-xl text-xs transition-all"
            >
              Back to Dashboard
            </a>
          </div>
        </div>

        <!-- AI Business Explanation Card -->
        <app-ai-insight-card
          [explanation]="analysisResult.explanation"
          [keyFindings]="analysisResult.keyFindings"
          [recommendedAction]="analysisResult.recommendedAction"
        ></app-ai-insight-card>

        <!-- Detected Risk Signals Breakdown -->
        <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 class="font-bold text-slate-900 text-base">
                Detected Risk Signals & Contributions
              </h3>
              <p class="text-xs text-slate-500">Structured feature factors returned by the risk scoring engine</p>
            </div>

            <span class="text-xs font-semibold text-slate-500">
              {{ analysisResult.signals.length }} Signal(s) Evaluated
            </span>
          </div>

          <div *ngIf="analysisResult.signals.length === 0" class="text-center py-6 text-xs text-slate-500">
            No adverse risk signals detected for this booking.
          </div>

          <div class="grid grid-cols-1 gap-3">
            <app-risk-signal-card
              *ngFor="let sig of analysisResult.signals"
              [signal]="sig"
            ></app-risk-signal-card>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CreateShipmentComponent {
  authService = inject(AuthService);
  fraudService = inject(FraudDetectionService);
  router = inject(Router);

  viewState: 'FORM' | 'ANALYZING' | 'RESULT' = 'FORM';
  analysisStage: number = 0;
  analysisResult?: FraudAnalysis;

  form = {
    shipperName: this.authService.currentUser().name,
    shipperId: this.authService.currentUser().id,
    shipperContact: '+91 98765 43210',
    origin: 'Chennai Logistics Facility',
    destination: 'Mumbai Distribution Hub',
    recipientName: 'Al-Mansoor Trading LLC',
    recipientContact: '+971 4 398 2210',
    packageType: 'Industrial Components',
    weight: 8,
    declaredValue: 35000,
    serviceType: 'STANDARD' as ServiceType,
    bookingHour: 14,
    currentDailyBookings: 3
  };

  loadCargoTemplate(type: 'STANDARD' | 'SUSPICIOUS' | 'FRAUD_BURST'): void {
    if (type === 'STANDARD') {
      this.form.origin = 'Chennai Logistics Facility';
      this.form.destination = 'Mumbai Distribution Hub';
      this.form.weight = 8;
      this.form.declaredValue = 35000;
      this.form.serviceType = 'STANDARD';
      this.form.packageType = 'Industrial Components';
      this.form.bookingHour = 14;
      this.form.currentDailyBookings = 3;
    } else if (type === 'SUSPICIOUS') {
      this.form.origin = 'Chennai Air Cargo Terminal';
      this.form.destination = 'Dubai (UAE)';
      this.form.weight = 45;
      this.form.declaredValue = 120000;
      this.form.serviceType = 'EXPRESS';
      this.form.packageType = 'Consumer Electronics';
      this.form.bookingHour = 16;
      this.form.currentDailyBookings = 18;
    } else if (type === 'FRAUD_BURST') {
      this.form.origin = 'Chennai Air Facility';
      this.form.destination = 'Dubai (UAE)';
      this.form.weight = 71;
      this.form.declaredValue = 250000;
      this.form.serviceType = 'EXPRESS';
      this.form.packageType = 'Industrial Components';
      this.form.bookingHour = 2;
      this.form.currentDailyBookings = 63;
    }
  }

  onStartAnalysis(e: Event): void {
    e.preventDefault();
    this.viewState = 'ANALYZING';
    this.analysisStage = 1;

    setTimeout(() => this.analysisStage = 2, 400);
    setTimeout(() => this.analysisStage = 3, 800);
    setTimeout(() => this.analysisStage = 4, 1200);

    this.fraudService.analyzeBooking(this.form).subscribe(res => {
      this.analysisResult = res;
      this.viewState = 'RESULT';
      this.fraudService.createBooking(this.form, res).subscribe();
    });
  }

  getDecisionBannerClass(): string {
    if (this.analysisResult?.decision === 'ALLOW') return 'bg-emerald-50/80 border-emerald-200';
    if (this.analysisResult?.decision === 'VERIFY') return 'bg-amber-50/80 border-amber-200';
    if (this.analysisResult?.decision === 'HOLD') return 'bg-orange-50/80 border-orange-200';
    return 'bg-red-50/80 border-red-200';
  }

  getDecisionTitleColor(): string {
    if (this.analysisResult?.decision === 'ALLOW') return 'text-emerald-800';
    if (this.analysisResult?.decision === 'VERIFY') return 'text-amber-800';
    if (this.analysisResult?.decision === 'HOLD') return 'text-orange-800';
    return 'text-red-800';
  }

  getDecisionTitle(): string {
    switch (this.analysisResult?.decision) {
      case 'ALLOW': return 'SHIPMENT APPROVED';
      case 'VERIFY': return 'ADDITIONAL VERIFICATION REQUIRED';
      case 'HOLD': return 'SHIPMENT ON HOLD';
      case 'BLOCK': return 'SHIPMENT BLOCKED';
      default: return 'REVIEW';
    }
  }
}
