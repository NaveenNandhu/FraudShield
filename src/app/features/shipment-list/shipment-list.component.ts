import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FraudDetectionService } from '../../core/services/fraud-detection.service';
import { AuthService } from '../../core/services/auth.service';
import { Shipment, RiskLevel, ShipmentStatus } from '../../core/models/fraud.model';
import { RiskBadgeComponent } from '../../shared/components/ui/risk-badge.component';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-shipment-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    RiskBadgeComponent,
    IconComponent
  ],
  template: `
    <div class="space-y-6">
      <!-- Title Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">
            Shipment Intelligence Directory
          </h1>
          <p class="text-xs text-slate-500 mt-1">
            Complete logistics booking database with automated AI fraud risk metrics.
          </p>
        </div>

        <div *ngIf="authService.isShipper()">
          <a
            [routerLink]="['/shipments/create']"
            class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <app-icon name="plus" [size]="16"></app-icon> Create Shipment
          </a>
        </div>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <!-- Search Input -->
        <div class="relative flex-1">
          <app-icon name="search" [size]="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></app-icon>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Search shipment ID, shipper name, destination, route..."
            class="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <!-- Filter Buttons -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            (click)="selectedFilter = 'ALL'"
            [class]="selectedFilter === 'ALL' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
            class="px-3 py-1.5 text-xs rounded-lg transition-all shrink-0"
          >
            All ({{ shipments().length }})
          </button>

          <button
            (click)="selectedFilter = 'LOW'"
            [class]="selectedFilter === 'LOW' ? 'bg-emerald-600 text-white font-bold' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'"
            class="px-3 py-1.5 text-xs rounded-lg transition-all shrink-0"
          >
            Low Risk
          </button>

          <button
            (click)="selectedFilter = 'MEDIUM'"
            [class]="selectedFilter === 'MEDIUM' ? 'bg-amber-600 text-white font-bold' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'"
            class="px-3 py-1.5 text-xs rounded-lg transition-all shrink-0"
          >
            Medium Risk
          </button>

          <button
            (click)="selectedFilter = 'HIGH'"
            [class]="selectedFilter === 'HIGH' ? 'bg-orange-600 text-white font-bold' : 'bg-orange-50 text-orange-700 hover:bg-orange-100'"
            class="px-3 py-1.5 text-xs rounded-lg transition-all shrink-0"
          >
            High Risk
          </button>

          <button
            (click)="selectedFilter = 'CRITICAL'"
            [class]="selectedFilter === 'CRITICAL' ? 'bg-red-700 text-white font-bold' : 'bg-red-50 text-red-800 hover:bg-red-100'"
            class="px-3 py-1.5 text-xs rounded-lg transition-all shrink-0"
          >
            Critical
          </button>
        </div>
      </div>

      <!-- Data Table -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-600">
            <thead class="bg-slate-50 text-slate-500 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-200">
              <tr>
                <th class="py-3.5 px-4">Shipment ID</th>
                <th class="py-3.5 px-4">Shipper Account</th>
                <th class="py-3.5 px-4">Route</th>
                <th class="py-3.5 px-4">Weight & Value</th>
                <th class="py-3.5 px-4">Risk Score</th>
                <th class="py-3.5 px-4">Decision</th>
                <th class="py-3.5 px-4">Created</th>
                <th class="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-slate-100">
              <tr *ngIf="filteredShipments().length === 0">
                <td colspan="8" class="py-12 text-center text-slate-400">
                  <app-icon name="package" [size]="32" class="mx-auto text-slate-300 mb-2"></app-icon>
                  No shipments found matching the selected filters.
                </td>
              </tr>

              <tr *ngFor="let s of filteredShipments()" class="hover:bg-slate-50/80 transition-colors">
                <td class="py-3.5 px-4 font-extrabold text-slate-900">
                  {{ s.id }}
                </td>
                <td class="py-3.5 px-4">
                  <span class="font-semibold text-slate-800 block">{{ s.shipperName }}</span>
                  <span class="text-[10px] text-slate-400 block">{{ s.shipperCompany || s.shipperId }}</span>
                </td>
                <td class="py-3.5 px-4">
                  <span class="font-medium text-slate-800">{{ s.origin }} → {{ s.destination }}</span>
                  <span class="block text-[10px] text-slate-400">{{ s.serviceType }}</span>
                </td>
                <td class="py-3.5 px-4">
                  <span class="font-bold text-slate-800 block">{{ s.weight }} kg</span>
                  <span class="text-[10px] text-slate-500 block">₹{{ s.declaredValue | number }}</span>
                </td>
                <td class="py-3.5 px-4">
                  <div class="flex items-center gap-2">
                    <span class="font-extrabold text-xs" [ngClass]="getRiskScoreColor(s.analysis.riskScore)">
                      {{ s.analysis.riskScore }}/100
                    </span>
                    <app-risk-badge [level]="s.analysis.riskLevel"></app-risk-badge>
                  </div>
                </td>
                <td class="py-3.5 px-4">
                  <app-risk-badge [decision]="s.analysis.decision"></app-risk-badge>
                </td>
                <td class="py-3.5 px-4 text-slate-500">
                  {{ s.createdDate }}
                  <span class="block text-[10px] text-slate-400">{{ s.createdTime }}</span>
                </td>
                <td class="py-3.5 px-4 text-right">
                  <a
                    [routerLink]="['/investigations', s.id]"
                    class="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-all inline-flex items-center gap-1 shadow-xs"
                  >
                    <span>Inspect</span>
                    <app-icon name="arrow-right" [size]="12"></app-icon>
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class ShipmentListComponent {
  fraudService = inject(FraudDetectionService);
  authService = inject(AuthService);

  shipments = this.fraudService.shipments;
  searchQuery: string = '';
  selectedFilter: 'ALL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'ALL';

  filteredShipments(): Shipment[] {
    return this.shipments().filter(s => {
      const matchesSearch =
        s.id.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        s.shipperName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        s.destination.toLowerCase().includes(this.searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (this.selectedFilter === 'ALL') return true;
      return s.analysis.riskLevel === this.selectedFilter;
    });
  }

  getRiskScoreColor(score: number): string {
    if (score <= 30) return 'text-emerald-700';
    if (score <= 60) return 'text-amber-700';
    if (score <= 80) return 'text-orange-700';
    return 'text-red-700';
  }
}
