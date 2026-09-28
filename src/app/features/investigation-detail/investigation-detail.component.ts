import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FraudDetectionService } from '../../core/services/fraud-detection.service';
import { AuthService } from '../../core/services/auth.service';
import { Shipment, ShipperBehaviorProfile, ShipmentStatus, Decision } from '../../core/models/fraud.model';
import { RiskBadgeComponent } from '../../shared/components/ui/risk-badge.component';
import { RiskScoreGaugeComponent } from '../../shared/components/ui/risk-score-gauge.component';
import { RiskSignalCardComponent } from '../../shared/components/ui/risk-signal-card.component';
import { AIInsightCardComponent } from '../../shared/components/ui/ai-insight-card.component';
import { ConfirmationModalComponent } from '../../shared/components/ui/confirmation-modal.component';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-investigation-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RiskBadgeComponent,
    RiskScoreGaugeComponent,
    RiskSignalCardComponent,
    AIInsightCardComponent,
    ConfirmationModalComponent,
    IconComponent
  ],
  template: `
    <div *ngIf="shipment" class="space-y-6">
      <!-- Top Navigation & Breadcrumb -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 text-xs text-slate-500">
          <a [routerLink]="['/dashboard']" class="hover:underline">Dashboard</a>
          <span>/</span>
          <a [routerLink]="['/investigations']" class="hover:underline">Investigations</a>
          <span>/</span>
          <span class="text-slate-800 font-bold">{{ shipment.id }}</span>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs text-slate-400 font-medium">Investigating Analyst:</span>
          <span class="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
            {{ authService.currentUser().name }}
          </span>
        </div>
      </div>

      <!-- SECTION 1: HEADER & RISK SCORE SUMMARY BANNER -->
      <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div class="flex items-center gap-5">
          <app-risk-score-gauge
            [score]="shipment.analysis.riskScore"
            [level]="shipment.analysis.riskLevel"
            [size]="100"
          ></app-risk-score-gauge>

          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">
                Shipment {{ shipment.id }}
              </h1>
              <app-risk-badge [level]="shipment.analysis.riskLevel"></app-risk-badge>
              <app-risk-badge [status]="shipment.status"></app-risk-badge>
            </div>

            <p class="text-xs text-slate-500 mt-1">
              Booked by <strong>{{ shipment.shipperName }}</strong> ({{ shipment.shipperCompany }}) on {{ shipment.createdDate }} at {{ shipment.createdTime }}
            </p>
          </div>
        </div>

        <!-- Admin Action Buttons (Section 6) -->
        <div *ngIf="authService.isAdmin()" class="flex flex-wrap items-center gap-2">
          <button
            (click)="triggerAction('ALLOW')"
            class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition-all flex items-center gap-1.5"
          >
            <app-icon name="check-circle" [size]="14"></app-icon> Approve Shipment
          </button>

          <button
            (click)="triggerAction('HOLD')"
            class="px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs shadow-xs transition-all flex items-center gap-1.5"
          >
            <app-icon name="shield-alert" [size]="14"></app-icon> Place on Hold
          </button>

          <button
            (click)="triggerAction('BLOCK')"
            class="px-3.5 py-2 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl text-xs shadow-xs transition-all flex items-center gap-1.5"
          >
            <app-icon name="x-circle" [size]="14"></app-icon> Block Shipment
          </button>
        </div>
      </div>

      <!-- Grid Layout for Overview & Behavior -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- SECTION 1 (Left 2 Cols): Shipment Overview & Cargo Specs -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Shipment Overview Card -->
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 class="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>1. Shipment & Logistics Overview</span>
              <span class="text-xs font-normal text-slate-500">Service: <strong>{{ shipment.serviceType }}</strong></span>
            </h3>

            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span class="text-slate-500 block">Origin Hub</span>
                <span class="font-bold text-slate-800 mt-0.5 block">{{ shipment.origin }}</span>
              </div>

              <div>
                <span class="text-slate-500 block">Destination</span>
                <span class="font-bold text-slate-800 mt-0.5 block">{{ shipment.destination }}</span>
              </div>

              <div>
                <span class="text-slate-500 block">Recipient</span>
                <span class="font-bold text-slate-800 mt-0.5 block">{{ shipment.recipientName }}</span>
                <span class="text-[10px] text-slate-400 block">{{ shipment.recipientContact }}</span>
              </div>

              <div>
                <span class="text-slate-500 block">Weight & Dimensions</span>
                <span class="font-bold text-slate-800 mt-0.5 block">{{ shipment.weight }} kg ({{ shipment.dimensions }})</span>
              </div>

              <div>
                <span class="text-slate-500 block">Declared Value</span>
                <span class="font-bold text-slate-900 mt-0.5 block">₹{{ shipment.declaredValue | number }} INR</span>
              </div>

              <div>
                <span class="text-slate-500 block">Payment Instrument</span>
                <span class="font-bold text-slate-800 mt-0.5 block">{{ shipment.paymentMethod }}</span>
              </div>
            </div>
          </div>

          <!-- SECTION 3: Shipper Historical Behavior Visualization (Requirement #16) -->
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 class="font-bold text-slate-900 text-sm">
                  3. Shipper Behavioral Anomaly Comparison
                </h3>
                <p class="text-xs text-slate-500">Visual proof comparing current booking against 30-day shipper baseline</p>
              </div>

              <span class="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                Baseline Discrepancy Flagged
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <!-- Weight Comparison Card -->
              <div class="p-4 rounded-xl border border-orange-200 bg-orange-50/20">
                <span class="text-[11px] font-bold text-orange-900 uppercase tracking-wider block">Package Weight</span>
                
                <div class="mt-3 flex items-baseline justify-between">
                  <div>
                    <span class="text-[10px] text-slate-500 block">30-Day Avg</span>
                    <span class="text-sm font-semibold text-slate-600">8.4 kg</span>
                  </div>
                  <app-icon name="arrow-right" [size]="14" class="text-orange-600"></app-icon>
                  <div class="text-right">
                    <span class="text-[10px] text-orange-800 font-bold block">Current</span>
                    <span class="text-lg font-extrabold text-orange-900">{{ shipment.weight }} kg</span>
                  </div>
                </div>

                <div class="mt-2 text-[11px] font-bold text-orange-800 bg-orange-100 p-1.5 rounded text-center">
                  +8.4x Deviation Spike
                </div>
              </div>

              <!-- Daily Velocity Comparison -->
              <div class="p-4 rounded-xl border border-amber-200 bg-amber-50/20">
                <span class="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">Daily Booking Volume</span>
                
                <div class="mt-3 flex items-baseline justify-between">
                  <div>
                    <span class="text-[10px] text-slate-500 block">30-Day Avg</span>
                    <span class="text-sm font-semibold text-slate-600">12 / day</span>
                  </div>
                  <app-icon name="arrow-right" [size]="14" class="text-amber-600"></app-icon>
                  <div class="text-right">
                    <span class="text-[10px] text-amber-800 font-bold block">Current Today</span>
                    <span class="text-lg font-extrabold text-amber-900">63 Bookings</span>
                  </div>
                </div>

                <div class="mt-2 text-[11px] font-bold text-amber-800 bg-amber-100 p-1.5 rounded text-center">
                  +425% Volume Burst
                </div>
              </div>

              <!-- Destination Route Profile -->
              <div class="p-4 rounded-xl border border-red-200 bg-red-50/20">
                <span class="text-[11px] font-bold text-red-900 uppercase tracking-wider block">Route Profile</span>
                
                <div class="mt-2 text-xs space-y-1">
                  <div>
                    <span class="text-[10px] text-slate-500 block">Normal Routes:</span>
                    <span class="font-medium text-slate-700">Chennai, Bangalore, Coimbatore</span>
                  </div>
                  <div class="pt-1">
                    <span class="text-[10px] text-red-800 font-bold block">Current Destination:</span>
                    <span class="font-extrabold text-red-900">{{ shipment.destination }}</span>
                  </div>
                </div>

                <div class="mt-2 text-[11px] font-bold text-red-800 bg-red-100 p-1.5 rounded text-center">
                  Unverified Overseas Hazard
                </div>
              </div>
            </div>
          </div>

          <!-- SECTION 4: Detected Risk Signals Breakdown -->
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 class="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
              4. Detected ML Risk Signals & Feature Contributions
            </h3>

            <div class="grid grid-cols-1 gap-3">
              <app-risk-signal-card
                *ngFor="let sig of shipment.analysis.signals"
                [signal]="sig"
              ></app-risk-signal-card>
            </div>
          </div>
        </div>

        <!-- SECTION 2 & 5 & 7 (Right Column): Profile, AI Explanation, Audit Trail -->
        <div class="space-y-6">
          <!-- SECTION 2: Shipper Profile -->
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 class="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
              2. Shipper Account Trust Profile
            </h3>

            <div class="flex items-center gap-3">
              <img
                [src]="authService.currentUser().avatarUrl"
                alt="Avatar"
                class="w-10 h-10 rounded-full border border-slate-200 object-cover"
              />
              <div>
                <span class="font-bold text-slate-900 text-xs block">{{ profile.shipperName }}</span>
                <span class="text-[11px] text-slate-500 block">Account Age: {{ profile.accountAgeDays }} days</span>
              </div>
            </div>

            <div class="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
              <div class="bg-slate-50 p-2 rounded-lg">
                <span class="text-slate-500 block text-[10px]">Total Bookings</span>
                <span class="font-bold text-slate-800">{{ profile.totalHistoricalBookings }}</span>
              </div>

              <div class="bg-slate-50 p-2 rounded-lg">
                <span class="text-slate-500 block text-[10px]">Account Trust Score</span>
                <span class="font-bold text-amber-700">{{ profile.trustScore }}/100</span>
              </div>
            </div>
          </div>

          <!-- SECTION 5: AI Explanation UI -->
          <app-ai-insight-card
            [explanation]="shipment.analysis.explanation"
            [keyFindings]="shipment.analysis.keyFindings"
            [recommendedAction]="shipment.analysis.recommendedAction"
          ></app-ai-insight-card>

          <!-- SECTION 7: Audit Trail Timeline (Requirement #19) -->
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 class="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>7. Audit Trail</span>
              <span class="text-xs text-slate-400 font-normal">Traceable Log</span>
            </h3>

            <div class="space-y-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 pl-6">
              <div *ngFor="let log of auditLogs()" class="relative">
                <span class="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white"></span>
                <div class="flex items-center justify-between text-[11px] font-bold text-slate-700">
                  <span>{{ log.actor }} ({{ log.actorRole }})</span>
                  <span class="text-slate-400 font-normal">{{ log.timestamp }}</span>
                </div>
                <p class="text-xs text-slate-800 font-semibold mt-0.5">
                  {{ log.action }}
                </p>
                <p *ngIf="log.reason" class="text-[11px] text-slate-500 mt-0.5">
                  Reason: {{ log.reason }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Confirmation Modal -->
      <app-confirmation-modal
        [isOpen]="isModalOpen"
        [title]="modalTitle"
        [message]="modalMessage"
        [confirmText]="modalConfirmText"
        [confirmBtnClass]="modalConfirmClass"
        [showReasonInput]="true"
        (close)="isModalOpen = false"
        (confirm)="onExecuteAction($event)"
      ></app-confirmation-modal>
    </div>
  `
})
export class InvestigationDetailComponent implements OnInit {
  route = inject(ActivatedRoute);
  fraudService = inject(FraudDetectionService);
  authService = inject(AuthService);

  shipment?: Shipment;
  profile!: ShipperBehaviorProfile;
  auditLogs = this.fraudService.auditLogs;

  isModalOpen: boolean = false;
  modalTitle: string = '';
  modalMessage: string = '';
  modalConfirmText: string = '';
  modalConfirmClass: string = '';
  targetAction: 'ALLOW' | 'HOLD' | 'BLOCK' = 'HOLD';

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'] || 'FS-10382';
      const found = this.fraudService.shipments().find(s => s.id === id);
      this.shipment = found || this.fraudService.shipments()[0];
      this.profile = this.fraudService.getShipperBehaviorProfile(this.shipment.shipperId);
    });
  }

  triggerAction(action: 'ALLOW' | 'HOLD' | 'BLOCK'): void {
    this.targetAction = action;
    this.isModalOpen = true;

    if (action === 'ALLOW') {
      this.modalTitle = 'Approve Shipment?';
      this.modalMessage = `This will clear shipment ${this.shipment?.id} for transit and mark it as legitimate.`;
      this.modalConfirmText = 'Confirm Approval';
      this.modalConfirmClass = 'bg-emerald-600 hover:bg-emerald-700';
    } else if (action === 'HOLD') {
      this.modalTitle = 'Place Shipment on Hold?';
      this.modalMessage = `This will hold shipment ${this.shipment?.id} at the origin facility and notify the shipper for verification.`;
      this.modalConfirmText = 'Confirm Hold';
      this.modalConfirmClass = 'bg-orange-600 hover:bg-orange-700';
    } else {
      this.modalTitle = 'Block Shipment & Freeze?';
      this.modalMessage = `This action will prevent shipment ${this.shipment?.id} from entering the delivery network.`;
      this.modalConfirmText = 'Confirm Block';
      this.modalConfirmClass = 'bg-red-700 hover:bg-red-800';
    }
  }

  onExecuteAction(reason: string): void {
    if (!this.shipment) return;
    this.isModalOpen = false;

    let newStatus: ShipmentStatus = 'APPROVED';
    let newDecision: Decision = 'ALLOW';

    if (this.targetAction === 'HOLD') {
      newStatus = 'ON_HOLD';
      newDecision = 'HOLD';
    } else if (this.targetAction === 'BLOCK') {
      newStatus = 'BLOCKED';
      newDecision = 'BLOCK';
    }

    this.fraudService.updateShipmentDecision(
      this.shipment.id,
      newStatus,
      newDecision,
      this.authService.currentUser().name,
      reason || 'Operational decision executed by fraud analyst'
    );

    // Refresh shipment reference
    this.shipment = this.fraudService.shipments().find(s => s.id === this.shipment?.id);
  }
}
