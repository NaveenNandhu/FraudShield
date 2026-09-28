import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { User, UserRole } from '../models/fraud.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);

  // Pre-defined enterprise accounts
  private readonly shipperUser: User = {
    id: 'SHIPPER-0091',
    name: 'Rajesh Sharma',
    email: 'rajesh.sharma@apexlogistics.in',
    role: 'SHIPPER',
    company: 'Apex Express Cargo Pvt Ltd',
    accountStatus: 'VERIFIED',
    phone: '+91 98765 43210',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
  };

  private readonly adminUser: User = {
    id: 'ADMIN-8802',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@fraudshield.io',
    role: 'ADMIN',
    company: 'FraudShield Operations',
    accountStatus: 'VERIFIED',
    phone: '+91 99887 76655',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80'
  };

  // Angular Signals for reactive state
  readonly currentUser = signal<User>(this.shipperUser);
  readonly isAuthenticated = signal<boolean>(true);

  readonly isShipper = computed(() => this.currentUser().role === 'SHIPPER');
  readonly isAdmin = computed(() => this.currentUser().role === 'ADMIN');

  login(role: UserRole = 'SHIPPER'): User {
    const user = role === 'ADMIN' ? this.adminUser : this.shipperUser;
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
    return user;
  }

  switchRole(role: UserRole): User {
    return this.login(role);
  }

  logout(): void {
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }
}
