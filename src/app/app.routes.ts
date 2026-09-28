import { Routes } from '@angular/router';
import { AppShellComponent } from './shared/components/app-shell/app-shell.component';
import { LoginComponent } from './features/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { CreateShipmentComponent } from './features/create-shipment/create-shipment.component';
import { ShipmentListComponent } from './features/shipment-list/shipment-list.component';
import { InvestigationDetailComponent } from './features/investigation-detail/investigation-detail.component';
import { FraudAlertsComponent } from './features/fraud-alerts/fraud-alerts.component';
import { VerificationComponent } from './features/verification/verification.component';
import { AnalyticsComponent } from './features/analytics/analytics.component';
import { AuditLogsComponent } from './features/audit-logs/audit-logs.component';
import { SettingsComponent } from './features/settings/settings.component';

import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'shipments', component: ShipmentListComponent },
      { path: 'shipments/create', component: CreateShipmentComponent },
      { path: 'shipments/:id', component: InvestigationDetailComponent },
      { path: 'fraud-alerts', component: FraudAlertsComponent },
      { path: 'investigations', component: ShipmentListComponent },
      { path: 'investigations/:id', component: InvestigationDetailComponent },
      { path: 'analytics', component: AnalyticsComponent },
      { path: 'verification', component: VerificationComponent },
      { path: 'audit-logs', component: AuditLogsComponent },
      { path: 'settings', component: SettingsComponent }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
