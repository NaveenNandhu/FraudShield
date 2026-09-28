import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FraudDetectionService } from '../../core/services/fraud-detection.service';
import { Shipment } from '../../core/models/fraud.model';
import { RiskBadgeComponent } from '../../shared/components/ui/risk-badge.component';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-verification',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, RiskBadgeComponent, IconComponent],
  template: `
    <div class="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">
          Shipment Identity & Security Verification
        </h1>
        <p class="text-xs text-slate-500 mt-1">
          Complete mandatory security verification steps to clear held shipments for dispatch.
        </p>
      </div>

      <!-- List of Shipments Needing Verification -->
      <div *ngIf="heldShipments().length === 0" class="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
        <div class="p-3 bg-emerald-50 text-emerald-600 rounded-full w-12 h-12 mx-auto flex items-center justify-center">
          <app-icon name="check-circle" [size]="24"></app-icon>
        </div>
        <h3 class="font-bold text-slate-900 text-base">No Held Shipments Pending Verification</h3>
        <p class="text-xs text-slate-500 max-w-md mx-auto">
          All your shipping bookings are verified and cleared for network transit.
        </p>
      </div>

      <div *ngFor="let s of heldShipments()" class="bg-white rounded-2xl border border-amber-200 shadow-md p-6 space-y-6">
        <!-- Banner Header -->
        <div class="flex items-center justify-between border-b border-amber-100 pb-4">
          <div class="flex items-center gap-3">
            <div class="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
              <app-icon name="shield-alert" [size]="22"></app-icon>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-extrabold text-slate-900 text-base">{{ s.id }}</span>
                <app-risk-badge [status]="s.status"></app-risk-badge>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">
                Destination: <strong>{{ s.destination }}</strong> ({{ s.weight }} kg) • Declared: ₹{{ s.declaredValue | number }}
              </p>
            </div>
          </div>

          <span class="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Action Required
          </span>
        </div>

        <!-- Explanation Callout -->
        <div class="bg-amber-50/60 p-4 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
          <strong class="block mb-0.5">Why is verification required?</strong>
          {{ s.analysis.explanation }}
        </div>

        <!-- Verification Method Tabs -->
        <div class="space-y-4">
          <label class="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            Select Security Verification Method:
          </label>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              (click)="selectedMethod = 'OTP'"
              [class]="selectedMethod === 'OTP' ? 'border-blue-600 bg-blue-50/60 text-blue-900 font-bold' : 'border-slate-200 text-slate-700'"
              class="p-4 rounded-xl border text-left transition-all hover:border-blue-300"
            >
              <div class="flex items-center gap-2 mb-1">
                <app-icon name="lock" [size]="16" class="text-blue-600"></app-icon>
                <span class="text-xs font-bold">1. SMS / Mobile OTP</span>
              </div>
              <span class="text-[11px] text-slate-500 block">Instant 6-digit passcode</span>
            </button>

            <button
              (click)="selectedMethod = 'EMAIL'"
              [class]="selectedMethod === 'EMAIL' ? 'border-blue-600 bg-blue-50/60 text-blue-900 font-bold' : 'border-slate-200 text-slate-700'"
              class="p-4 rounded-xl border text-left transition-all hover:border-blue-300"
            >
              <div class="flex items-center gap-2 mb-1">
                <app-icon name="file-text" [size]="16" class="text-blue-600"></app-icon>
                <span class="text-xs font-bold">2. Corporate Email</span>
              </div>
              <span class="text-[11px] text-slate-500 block">Domain confirmation link</span>
            </button>

            <button
              (click)="selectedMethod = 'DOCUMENT'"
              [class]="selectedMethod === 'DOCUMENT' ? 'border-blue-600 bg-blue-50/60 text-blue-900 font-bold' : 'border-slate-200 text-slate-700'"
              class="p-4 rounded-xl border text-left transition-all hover:border-blue-300"
            >
              <div class="flex items-center gap-2 mb-1">
                <app-icon name="package" [size]="16" class="text-blue-600"></app-icon>
                <span class="text-xs font-bold">3. Invoice Upload</span>
              </div>
              <span class="text-[11px] text-slate-500 block">GST / Commercial Invoice</span>
            </button>
          </div>

          <!-- Method Form Inputs -->
          <div [ngSwitch]="selectedMethod" class="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <!-- OTP Method -->
            <div *ngSwitchCase="'OTP'" class="space-y-3">
              <p class="text-xs text-slate-600">
                A 6-digit verification code was sent to registered phone ending in <strong>****4321</strong>.
              </p>
              <div class="flex items-center gap-3">
                <input
                  type="text"
                  [(ngModel)]="otpCode"
                  placeholder="Enter 6-digit OTP (e.g. 849201)"
                  maxlength="6"
                  class="text-sm tracking-widest font-mono p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
                <button
                  (click)="verifyShipment(s.id)"
                  class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-all"
                >
                  Verify & Release
                </button>
              </div>
            </div>

            <!-- Email Method -->
            <div *ngSwitchCase="'EMAIL'" class="space-y-3">
              <p class="text-xs text-slate-600">
                Send security clearance email link to <strong>rajesh.sharma&#64;apexlogistics.in</strong>.
              </p>
              <button
                (click)="verifyShipment(s.id)"
                class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-all"
              >
                Send Verification Link
              </button>
            </div>

            <!-- Document Upload -->
            <div *ngSwitchCase="'DOCUMENT'" class="space-y-3">
              <p class="text-xs text-slate-600">
                Upload cargo commercial invoice or bill of lading for verification.
              </p>
              <div class="border-2 border-dashed border-slate-300 bg-white p-4 rounded-xl text-center cursor-pointer hover:border-blue-400">
                <app-icon name="file-text" [size]="24" class="mx-auto text-slate-400 mb-1"></app-icon>
                <span class="text-xs font-semibold text-blue-600 block">Click to select PDF or image</span>
                <span class="text-[10px] text-slate-400 block">Max file size 10MB</span>
              </div>
              <button
                (click)="verifyShipment(s.id)"
                class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-all"
              >
                Submit Document & Verify
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class VerificationComponent {
  fraudService = inject(FraudDetectionService);
  router = inject(Router);

  selectedMethod: 'OTP' | 'EMAIL' | 'DOCUMENT' = 'OTP';
  otpCode: string = '849201';

  heldShipments() {
    return this.fraudService.shipments().filter(s => s.status === 'ON_HOLD' || s.status === 'UNDER_REVIEW');
  }

  verifyShipment(shipmentId: string): void {
    this.fraudService.completeVerification(shipmentId, this.selectedMethod).subscribe(() => {
      this.router.navigate(['/dashboard']);
    });
  }
}
