import { Injectable, inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../auth/services/auth.service';
import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * Tokenインターセプター
 * - 認証トークンをリクエストヘッダーに追加
 * - 認証が不要なAPIエンドポイントを除外
 */
export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // トークン取得
  const token = authService.getToken();
  
  // apiUrlをenvironmentから取得
  const apiUrl = environment.apiUrl;
  
  // トークン不要なURLのリスト
  const excludedPaths = [
    '/auth/login',
    '/auth/signup',
    '/auth/refresh',
    '/auth/password-reset/request',
    '/auth/password-reset/confirm'
  ];
  
  // 除外URLかどうかをチェック
  // apiUrlが空の場合やAPIエンドポイントの相対パスが一致する場合は除外
  const isExcluded = excludedPaths.some(path => {
    // apiUrlが設定されている場合は完全一致で確認
    if (apiUrl && apiUrl.length > 0) {
      return req.url === `${apiUrl}${path}`;
    }
    // apiUrlが設定されていない場合はパスのみで確認
    return req.url.includes(path);
  });
  
  if (token && !isExcluded) {
    // 認証ヘッダーを追加したリクエストを作成
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return next(authReq);
  }
  
  // トークンがない、または除外URLの場合は元のリクエストを送信
  return next(req);
};
