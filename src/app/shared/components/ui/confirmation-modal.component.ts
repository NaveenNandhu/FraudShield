import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity">
      <div class="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200">
        <!-- Header -->
        <div class="p-5 border-b border-slate-100 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div [class]="iconBg" class="p-2.5 rounded-xl shrink-0">
              <app-icon [name]="icon" [size]="20" [class]="iconColor"></app-icon>
            </div>
            <h3 class="font-bold text-slate-900 text-base">
              {{ title }}
            </h3>
          </div>

          <button (click)="close.emit()" class="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <app-icon name="x-circle" [size]="20"></app-icon>
          </button>
        </div>

        <!-- Body -->
        <div class="p-5">
          <p class="text-sm text-slate-600 leading-relaxed">
            {{ message }}
          </p>

          <div *ngIf="showReasonInput" class="mt-4">
            <label class="block text-xs font-semibold text-slate-700 mb-1">
              Decision Reason / Operational Notes
            </label>
            <textarea
              [(ngModel)]="reasonText"
              rows="3"
              placeholder="Provide reason for audit logging..."
              class="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            ></textarea>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            (click)="close.emit()"
            class="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/60 rounded-lg transition-all"
          >
            Cancel
          </button>
          
          <button
            (click)="onConfirm()"
            [class]="confirmBtnClass"
            class="px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-xs transition-all flex items-center gap-1.5"
          >
            <app-icon [name]="icon" [size]="14"></app-icon>
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class ConfirmationModalComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = 'Confirm Action';
  @Input() message: string = 'Are you sure you want to perform this action?';
  @Input() confirmText: string = 'Confirm';
  @Input() icon: string = 'alert-triangle';
  @Input() iconBg: string = 'bg-amber-100';
  @Input() iconColor: string = 'text-amber-700';
  @Input() confirmBtnClass: string = 'bg-blue-600 hover:bg-blue-700';
  @Input() showReasonInput: boolean = false;

  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<string>();

  reasonText: string = '';

  onConfirm(): void {
    this.confirm.emit(this.reasonText);
    this.reasonText = '';
  }
}
