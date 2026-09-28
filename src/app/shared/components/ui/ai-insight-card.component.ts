import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-ai-insight-card',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="bg-gradient-to-br from-violet-50/80 via-white to-purple-50/50 border border-purple-200 rounded-xl p-5 shadow-xs">
      <div class="flex items-center justify-between gap-2 border-b border-purple-100 pb-3.5 mb-3.5">
        <div class="flex items-center gap-2.5">
          <div class="bg-purple-600 text-white p-2 rounded-lg shadow-xs">
            <app-icon name="cpu" [size]="18"></app-icon>
          </div>
          <div>
            <h3 class="font-bold text-slate-900 text-sm">
              AI Investigation Summary
            </h3>
            <p class="text-xs text-slate-600">
              Natural language explanation generated from structured ML risk signals
            </p>
          </div>
        </div>

        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-800 border border-purple-200 shrink-0">
          <span class="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse"></span>
          AI-Assisted Explanation
        </span>
      </div>

      <p class="text-sm text-slate-700 leading-relaxed font-normal">
        "{{ explanation }}"
      </p>

      <!-- Key Bullet Points -->
      <div *ngIf="keyFindings && keyFindings.length > 0" class="mt-4 pt-3.5 border-t border-purple-100">
        <h4 class="text-xs font-bold text-purple-900 uppercase tracking-wider mb-2">
          Key Risk Factors Detected:
        </h4>
        <ul class="space-y-1.5 text-xs text-slate-700">
          <li *ngFor="let finding of keyFindings" class="flex items-start gap-2">
            <span class="text-purple-600 font-bold shrink-0 mt-0.5">•</span>
            <span>{{ finding }}</span>
          </li>
        </ul>
      </div>

      <!-- Recommended Action Callout -->
      <div *ngIf="recommendedAction" class="mt-4 bg-purple-100/70 border border-purple-200 p-3 rounded-lg flex items-start gap-2.5">
        <app-icon name="shield-alert" [size]="16" class="text-purple-700 shrink-0 mt-0.5"></app-icon>
        <div>
          <span class="text-xs font-bold text-purple-900 block">Recommended Operational Action:</span>
          <span class="text-xs text-purple-800 mt-0.5 block font-medium">
            {{ recommendedAction }}
          </span>
        </div>
      </div>
    </div>
  `
})
export class AIInsightCardComponent {
  @Input() explanation: string = '';
  @Input() keyFindings: string[] = [];
  @Input() recommendedAction: string = '';
}
