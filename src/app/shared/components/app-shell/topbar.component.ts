import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <header class="h-16 bg-white border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <!-- Left: Mobile Toggle & Search Bar -->
      <div class="flex items-center gap-3 flex-1 max-w-xl">
        <button
          (click)="toggleMobileSidebar.emit()"
          class="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
        >
          <app-icon name="filter" [size]="20"></app-icon>
        </button>

        <div class="relative w-full hidden sm:block">
          <app-icon name="search" [size]="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></app-icon>
          <input
            type="text"
            placeholder="Search shipment ID, shipper, destination, or risk signal..."
            class="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      <!-- Right: Real Engine Indicator, User Role Badge, Notifications & Profile -->
      <div class="flex items-center gap-3">
        <!-- Live AI/ML Engine Status Indicator -->
        <div class="hidden md:flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3 py-1.5 rounded-xl font-bold">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>FraudShield ML v2 Online</span>
        </div>

        <!-- Authenticated Active Role Badge -->
        <div
          [class]="authService.isAdmin() ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-blue-50 border-blue-200 text-blue-800'"
          class="flex items-center gap-1.5 border text-xs px-3 py-1.5 rounded-xl font-bold"
        >
          <app-icon [name]="authService.isAdmin() ? 'shield-alert' : 'user'" [size]="14"></app-icon>
          <span>{{ authService.isAdmin() ? 'Fraud Operations Analyst' : 'Shipper Portal' }}</span>
        </div>

        <!-- Notifications Bell -->
        <button
          (click)="toggleNotifications.emit()"
          class="relative p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
        >
          <app-icon name="bell" [size]="18"></app-icon>
          <span class="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
        </button>

        <!-- User Profile Pill -->
        <div class="flex items-center gap-2 pl-2 border-l border-slate-200">
          <img
            [src]="authService.currentUser().avatarUrl"
            alt="Avatar"
            class="w-8 h-8 rounded-full border border-slate-200 object-cover"
          />
          <div class="hidden xl:block text-left">
            <span class="text-xs font-semibold text-slate-900 block leading-tight">
              {{ authService.currentUser().name }}
            </span>
            <span class="text-[10px] text-slate-500 block leading-tight">
              {{ authService.currentUser().role === 'ADMIN' ? 'Fraud Analyst' : 'Shipper' }}
            </span>
          </div>
        </div>
      </div>
    </header>
  `
})
export class TopbarComponent {
  authService = inject(AuthService);

  @Output() toggleMobileSidebar = new EventEmitter<void>();
  @Output() toggleNotifications = new EventEmitter<void>();
}
