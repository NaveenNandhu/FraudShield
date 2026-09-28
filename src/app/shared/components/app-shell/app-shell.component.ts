import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { TopbarComponent } from './topbar.component';
import { NotificationDrawerComponent } from '../ui/notification-drawer.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SidebarComponent,
    TopbarComponent,
    NotificationDrawerComponent
  ],
  template: `
    <div class="h-screen w-screen flex overflow-hidden bg-slate-50 antialiased font-sans">
      <!-- Fixed Static Sidebar -->
      <app-sidebar
        [isMobileOpen]="isMobileSidebarOpen"
        (closeMobile)="isMobileSidebarOpen = false"
      ></app-sidebar>

      <!-- Scrollable Main Content Workspace -->
      <div class="flex-1 flex flex-col h-screen min-w-0 overflow-y-auto">
        <app-topbar
          (toggleMobileSidebar)="isMobileSidebarOpen = !isMobileSidebarOpen"
          (toggleNotifications)="isNotificationOpen = !isNotificationOpen"
        ></app-topbar>

        <main class="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- Notifications Drawer -->
      <app-notification-drawer
        [isOpen]="isNotificationOpen"
        (close)="isNotificationOpen = false"
      ></app-notification-drawer>
    </div>
  `
})
export class AppShellComponent {
  isMobileSidebarOpen: boolean = false;
  isNotificationOpen: boolean = false;
}
