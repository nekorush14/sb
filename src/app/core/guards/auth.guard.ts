import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';

/**
 * 認証ガード
 * 認証が必要なルートへのアクセスを制限します
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // 認証済みかトークンが有効な場合はアクセスを許可
  if (authService.isAuthenticated() || authService.hasValidToken()) {
    return true;
  }
  
  // 認証されていない場合はログインページにリダイレクト
  // 現在のURLを保存して、ログイン後に元のページに戻れるようにします
  const returnUrl = state.url;
  return router.createUrlTree(['/auth/login'], {
    queryParams: { returnUrl }
  });
};
