import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FraudDetectionService } from '../../core/services/fraud-detection.service';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">
          System Security & Decision Audit Logs
        </h1>
        <p class="text-xs text-slate-500 mt-1">
          Immutable, traceable audit log of all automated ML risk calculations and manual analyst overrides.
        </p>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div class="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <span class="text-xs font-bold text-slate-700">Audit Events Logged ({{ logs().length }})</span>
          <span class="text-xs text-slate-500">ISO 27001 Compliant Audit Stream</span>
        </div>

        <div class="divide-y divide-slate-100">
          <div *ngFor="let log of logs()" class="p-4 hover:bg-slate-50/80 transition-colors flex items-start gap-4">
            <div class="p-2.5 rounded-xl bg-slate-100 text-slate-700 shrink-0 mt-0.5">
              <app-icon name="file-text" [size]="18"></app-icon>
            </div>

            <div class="flex-1">
              <div class="flex items-center justify-between text-xs">
                <div class="flex items-center gap-2">
                  <span class="font-extrabold text-slate-900">{{ log.shipmentId }}</span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    {{ log.actorRole }}
                  </span>
                </div>
                <span class="text-slate-400 font-mono">{{ log.timestamp }}</span>
              </div>

              <p class="text-xs font-semibold text-slate-800 mt-1">
                {{ log.action }}
              </p>

              <p *ngIf="log.reason" class="text-xs text-slate-500 mt-0.5">
                Reason: {{ log.reason }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AuditLogsComponent {
  fraudService = inject(FraudDetectionService);
  logs = this.fraudService.auditLogs;
}
