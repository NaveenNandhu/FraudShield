import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FraudDetectionService } from '../../../core/services/fraud-detection.service';
import { RiskBadgeComponent } from './risk-badge.component';
import { IconComponent } from '../icon/icon.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-notification-drawer',
  standalone: true,
  imports: [CommonModule, RiskBadgeComponent, IconComponent, RouterModule],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 overflow-hidden">
      <!-- Backdrop -->
      <div (click)="close.emit()" class="absolute inset-0 bg-slate-900/40 backdrop-blur-2xs transition-opacity"></div>

      <div class="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div class="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col">
          <!-- Header -->
          <div class="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div class="flex items-center gap-2">
              <div class="p-2 bg-red-100 text-red-700 rounded-lg">
                <app-icon name="bell" [size]="18"></app-icon>
              </div>
              <div>
                <h3 class="font-bold text-slate-900 text-sm">
                  Live Risk Notifications
                </h3>
                <p class="text-xs text-slate-500">Real-time fraud alert stream</p>
              </div>
            </div>

            <button (click)="close.emit()" class="text-slate-400 hover:text-slate-600 p-1">
              <app-icon name="x-circle" [size]="20"></app-icon>
            </button>
          </div>

          <!-- Alert Items -->
          <div class="flex-1 overflow-y-auto p-4 space-y-3">
            <ng-container *ngFor="let alert of fraudService.alerts()">
              <div
                class="p-4 rounded-xl border bg-white shadow-xs hover:border-blue-300 transition-all cursor-pointer"
                [class.border-red-200]="alert.riskLevel === 'CRITICAL'"
                [class.bg-red-50]="alert.riskLevel === 'CRITICAL'"
                [class.border-orange-200]="alert.riskLevel === 'HIGH'"
                [routerLink]="['/investigations', alert.shipmentId]"
                (click)="close.emit()"
              >
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-xs text-slate-900">{{ alert.shipmentId }}</span>
                    <app-risk-badge [level]="alert.riskLevel"></app-risk-badge>
                  </div>
                  <span class="text-[11px] text-slate-400 font-medium">{{ alert.timeAgo }}</span>
                </div>

                <p class="text-xs text-slate-700 leading-relaxed">
                  {{ alert.summary }}
                </p>

                <div class="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Shipper: <strong>{{ alert.shipperName }}</strong></span>
                  <span class="text-blue-600 font-semibold hover:underline inline-flex items-center gap-1">
                    Investigate <app-icon name="arrow-right" [size]="12"></app-icon>
                  </span>
                </div>
              </div>
            </ng-container>
          </div>

          <!-- Footer -->
          <div class="p-4 border-t border-slate-200 bg-slate-50 text-center">
            <button
              [routerLink]="['/fraud-alerts']"
              (click)="close.emit()"
              class="text-xs font-semibold text-blue-600 hover:text-blue-700 underline"
            >
              View All System Alerts
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class NotificationDrawerComponent {
  fraudService = inject(FraudDetectionService);

  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();
}
