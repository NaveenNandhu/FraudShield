import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { IconComponent } from '../icon/icon.component';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  badge?: string;
  badgeColor?: string;
  adminOnly?: boolean;
  shipperOnly?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  host: {
    'class': 'h-screen w-64 shrink-0 z-40'
  },
  template: `
    <aside
      [class.translate-x-0]="isMobileOpen"
      [class.-translate-x-full]="!isMobileOpen"
      class="fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col h-screen transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static shrink-0 border-r border-slate-800"
    >
      <!-- Brand Logo Header -->
      <div class="h-16 px-6 flex items-center justify-between border-b border-slate-800 shrink-0">
        <div class="flex items-center gap-3 cursor-pointer" [routerLink]="['/dashboard']">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <app-icon name="shield-check" [size]="22" class="text-white"></app-icon>
          </div>
          <div>
            <span class="font-extrabold text-lg tracking-tight text-white block leading-none">
              FraudShield
            </span>
            <span class="text-[10px] text-blue-400 uppercase tracking-widest font-semibold block mt-1">
              AI Risk Intelligence
            </span>
          </div>
        </div>

        <!-- Mobile close button -->
        <button (click)="closeMobile.emit()" class="lg:hidden text-slate-400 hover:text-white">
          <app-icon name="x-circle" [size]="22"></app-icon>
        </button>
      </div>

      <!-- Active Role Badge Banner -->
      <div class="px-4 py-3 mx-4 mt-4 bg-slate-800/80 rounded-xl border border-slate-700/60 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-2">
          <div [class]="authService.isAdmin() ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'" class="p-1.5 rounded-lg">
            <app-icon [name]="authService.isAdmin() ? 'shield-alert' : 'user'" [size]="16"></app-icon>
          </div>
          <div>
            <span class="text-[11px] text-slate-400 block font-medium">Authenticated Account</span>
            <span class="text-xs font-bold text-white block">
              {{ authService.isAdmin() ? 'Fraud Analyst' : 'Shipper Account' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Navigation Links (Scrollable internal area) -->
      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div class="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Main Menu
        </div>

        <ng-container *ngFor="let item of navItems">
          <a
            *ngIf="shouldShowItem(item)"
            [routerLink]="[item.route]"
            routerLinkActive="bg-blue-600 text-white font-semibold"
            [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
            (click)="closeMobile.emit()"
            class="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-all group"
          >
            <div class="flex items-center gap-3">
              <app-icon [name]="item.icon" [size]="18" class="text-slate-400 group-hover:text-white transition-colors"></app-icon>
              <span>{{ item.label }}</span>
            </div>

            <span
              *ngIf="item.badge"
              [class]="item.badgeColor || 'bg-blue-500/20 text-blue-300'"
              class="px-2 py-0.5 rounded-full text-[10px] font-bold"
            >
              {{ item.badge }}
            </span>
          </a>
        </ng-container>

        <!-- Quick CTA Button for Shipper -->
        <div *ngIf="authService.isShipper()" class="pt-4 px-1">
          <a
            [routerLink]="['/shipments/create']"
            (click)="closeMobile.emit()"
            class="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 text-sm"
          >
            <app-icon name="plus" [size]="16"></app-icon>
            <span>Create Shipment</span>
          </a>
        </div>
      </nav>

      <!-- Footer User Profile Info (Pinned at bottom) -->
      <div class="p-4 border-t border-slate-800 bg-slate-950/80 shrink-0">
        <div class="flex items-center gap-3">
          <img
            [src]="authService.currentUser().avatarUrl"
            alt="User avatar"
            class="w-9 h-9 rounded-full border border-slate-700 object-cover"
          />
          <div class="flex-1 min-w-0">
            <span class="text-xs font-bold text-white truncate block">
              {{ authService.currentUser().name }}
            </span>
            <span class="text-[11px] text-slate-400 truncate block">
              {{ authService.currentUser().company }}
            </span>
          </div>

          <button (click)="authService.logout()" title="Log out" class="text-slate-400 hover:text-red-400 p-1 transition-colors">
            <app-icon name="log-out" [size]="16"></app-icon>
          </button>
        </div>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  authService = inject(AuthService);

  @Input() isMobileOpen: boolean = false;
  @Output() closeMobile = new EventEmitter<void>();

  navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'bar-chart' },
    { label: 'Shipments', route: '/shipments', icon: 'package' },
    { label: 'Fraud Alerts', route: '/fraud-alerts', icon: 'bell', badge: 'LIVE', badgeColor: 'bg-red-500/20 text-red-300', adminOnly: true },
    { label: 'Investigations', route: '/investigations', icon: 'shield-alert', adminOnly: true },
    { label: 'Analytics', route: '/analytics', icon: 'trending-up', adminOnly: true },
    { label: 'Verification', route: '/verification', icon: 'shield-check', badge: '3 Held' },
    { label: 'Audit Logs', route: '/audit-logs', icon: 'file-text', adminOnly: true },
    { label: 'Settings', route: '/settings', icon: 'settings' }
  ];

  shouldShowItem(item: NavItem): boolean {
    if (item.adminOnly && !this.authService.isAdmin()) return false;
    if (item.shipperOnly && !this.authService.isShipper()) return false;
    return true;
  }
}
