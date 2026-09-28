import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/fraud.model';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <!-- Background subtle grid pattern -->
      <div class="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-25"></div>

      <!-- Glowing backdrop ambient light -->
      <div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div class="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <!-- Logo -->
        <div class="flex justify-center">
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/30 ring-1 ring-white/20">
            <app-icon name="shield-check" [size]="36" class="text-white"></app-icon>
          </div>
        </div>

        <h2 class="mt-5 text-center text-3xl font-extrabold text-white tracking-tight">
          FraudShield
        </h2>
        <p class="mt-1 text-center text-xs font-medium text-slate-400 uppercase tracking-widest">
          AI & ML Shipping Risk Intelligence Engine
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div class="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-200/80">
          
          <!-- Role selector tab -->
          <div class="mb-6">
            <label class="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Portal Access Mode:</label>
            <div class="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                (click)="setRole('SHIPPER')"
                [class]="selectedRole === 'SHIPPER' ? 'bg-white text-blue-600 font-extrabold shadow-sm' : 'text-slate-600 hover:text-slate-900 font-medium'"
                class="py-2.5 text-xs rounded-lg transition-all flex items-center justify-center gap-1.5"
              >
                <app-icon name="user" [size]="14"></app-icon> Shipper Account
              </button>

              <button
                type="button"
                (click)="setRole('ADMIN')"
                [class]="selectedRole === 'ADMIN' ? 'bg-white text-amber-700 font-extrabold shadow-sm' : 'text-slate-600 hover:text-slate-900 font-medium'"
                class="py-2.5 text-xs rounded-lg transition-all flex items-center justify-center gap-1.5"
              >
                <app-icon name="shield-alert" [size]="14"></app-icon> Fraud Operations
              </button>
            </div>
          </div>

          <form (submit)="onSubmit($event)" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                Work Email Address
              </label>
              <input
                type="email"
                [(ngModel)]="email"
                name="email"
                required
                placeholder="name@company.com"
                class="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-800"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                [(ngModel)]="password"
                name="password"
                required
                placeholder="••••••••••••"
                class="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-800"
              />
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <label for="remember-me" class="ml-2 block text-xs text-slate-600 font-medium">
                  Keep me signed in
                </label>
              </div>

              <a href="javascript:void(0)" class="text-xs font-semibold text-blue-600 hover:text-blue-500">
                Forgot password?
              </a>
            </div>

            <div>
              <button
                type="submit"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <span>Sign in to FraudShield</span>
                <app-icon name="arrow-right" [size]="16"></app-icon>
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  authService = inject(AuthService);
  router = inject(Router);

  selectedRole: UserRole = 'SHIPPER';
  email: string = 'rajesh.sharma@apexlogistics.in';
  password: string = '••••••••••••';

  setRole(role: UserRole): void {
    this.selectedRole = role;
    if (role === 'ADMIN') {
      this.email = 'sarah.jenkins@fraudshield.io';
    } else {
      this.email = 'rajesh.sharma@apexlogistics.in';
    }
  }

  onSubmit(e: Event): void {
    e.preventDefault();
    if (this.email.toLowerCase().includes('sarah') || this.email.toLowerCase().includes('admin') || this.selectedRole === 'ADMIN') {
      this.authService.login('ADMIN');
    } else {
      this.authService.login('SHIPPER');
    }
    this.router.navigate(['/dashboard']);
  }
}
