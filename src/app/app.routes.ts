import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './core/auth/login/login.component';
import { PasswordResetComponent } from './core/auth/password-reset/password-reset.component';
import { LandingComponent } from './core/landing/landing.component';

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
  // {
  //   path: 'dashboard',
  //   loadChildren: () => import('./feature/dashboard/dashboard.module').then(m => m.DashboardModule),
  //   canActivate: [authGuard]
  // },
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];