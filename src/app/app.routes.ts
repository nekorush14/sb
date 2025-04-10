import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './core/auth/login/login.component';
import { PasswordResetComponent } from './core/auth/password-reset/password-reset.component';
import { LandingComponent } from './core/landing/landing.component';
import { DashboardComponent } from './feature/dashboard/dashboard.component';
import { InventoryComponent } from './feature/inventory/inventory.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
    pathMatch: 'full'
  },
  {
    path: 'auth/login',
    component: LoginComponent
  },
  {
    path: 'auth/password-reset',
    component: PasswordResetComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'items',
    component: InventoryComponent,
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];