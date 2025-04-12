import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { 
  AuthRequest, 
  AuthResponse, 
  PasswordResetConfirmRequest, 
  PasswordResetRequest, 
  SignupRequest, 
  TokenPayload 
} from '../models/auth.model';
import { User } from '../models/user.model';
import { environment } from '../../../../environments/environment';
import { jwtDecode } from 'jwt-decode';
import * as CryptoJS from 'crypto-js';

/**
 * 認証サービス
 * Signalを使用して認証状態を管理します
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  // API URL
  private apiUrl = environment.apiUrl;
  
  // SessionStorageのキー
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  
  // Signalを使った状態管理
  private readonly _currentUser = signal<User | null>(null);
  private readonly _isAuthenticated = signal<boolean>(false);
  
  // 公開用のシグナル
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = this._isAuthenticated.asReadonly();
  
  // 有効なトークンがあるかを計算するシグナル
  readonly hasValidToken = computed(() => {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  });
  
  constructor() {
    // 初期化時に保存されたトークンがあれば読み込む
    this.loadUserFromToken();
    
    // トークンの状態変化を監視するエフェクト
    effect(() => {
      if (this.hasValidToken() && !this._currentUser()) {
        this.loadUserFromToken();
      }
    });
  }
  
  /**
   * ログイン処理
   * 
   * @param credentials - ログイン情報
   * @returns - 認証レスポンス
   */
  login(credentials: AuthRequest): Observable<AuthResponse> {
    // Passwordをハッシュ化する
    const hashedPassword = CryptoJS.SHA512(credentials.password).toString();
    credentials.password = hashedPassword;

    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        this.handleAuthResponse(response);
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }
  
  /**
   * ユーザー登録処理
   * 
   * @param userData - ユーザー登録情報
   * @returns - 認証レスポンス
   */
  signup(userData: SignupRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/signup`, userData).pipe(
      tap(response => {
        this.handleAuthResponse(response);
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }
  
  /**
   * ログアウト処理
   */
  logout(): void {
    // セッションストレージからトークンを削除
    sessionStorage.removeItem(this.ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
    
    // 状態をリセット
    this._currentUser.set(null);
    this._isAuthenticated.set(false);
    
    // ログインページにリダイレクト
    this.router.navigate(['/auth/login']);
  }
  
  /**
   * トークンのリフレッシュ
   * 
   * @returns - 新しいトークン
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = sessionStorage.getItem(this.REFRESH_TOKEN_KEY);
    
    if (!refreshToken) {
      return throwError(() => new Error('リフレッシュトークンがありません'));
    }
    
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/refresh`, { refreshToken }).pipe(
      tap(response => {
        this.handleAuthResponse(response);
      }),
      catchError(error => {
        // リフレッシュトークンが無効な場合はログアウト
        this.logout();
        return throwError(() => error);
      })
    );
  }
  
  /**
   * パスワードリセットリクエスト
   * 
   * @param request - パスワードリセットリクエスト
   * @returns - 成功メッセージ
   */
  requestPasswordReset(request: PasswordResetRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/auth/password-reset/request`, request).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }
  
  /**
   * パスワードリセットの確認
   * 
   * @param request - パスワードリセット確認リクエスト
   * @returns - 成功メッセージ
   */
  confirmPasswordReset(request: PasswordResetConfirmRequest): Observable<{ message: string }> {
    // Passwordをハッシュ化する
    const hashedPassword = CryptoJS.SHA512(request.newPassword).toString();
    request.newPassword = hashedPassword;
    
    // Codeをハッシュ化する
    const hashedCode = CryptoJS.SHA512(request.code).toString();
    request.code = hashedCode;

    return this.http.post<{ message: string }>(`${this.apiUrl}/auth/password-reset/confirm`, request).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }
  
  /**
   * アクセストークンを取得
   */
  getToken(): string | null {
    return sessionStorage.getItem(this.ACCESS_TOKEN_KEY);
  }
  
  /**
   * 保存されているトークンからユーザー情報を読み込む
   */
  private loadUserFromToken(): void {
    const token = this.getToken();
    
    if (!token) {
      this._isAuthenticated.set(false);
      this._currentUser.set(null);
      return;
    }
    
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      const currentTime = Date.now() / 1000;
      
      if (decoded.exp > currentTime) {
        const user: User = {
          id: decoded.sub,
          email: decoded.email
        };
        
        this._currentUser.set(user);
        this._isAuthenticated.set(true);
      } else {
        // トークンが期限切れの場合
        this.refreshToken().subscribe({
          error: () => this.logout()
        });
      }
    } catch (error) {
      this.logout();
    }
  }
  
  /**
   * 認証レスポンス処理
   * 
   * @param response - 認証レスポンス
   */
  private handleAuthResponse(response: AuthResponse): void {
    // トークンをセッションストレージに保存
    sessionStorage.setItem(this.ACCESS_TOKEN_KEY, response.accessToken);
    sessionStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
    
    // ユーザー情報と認証状態を更新
    this._currentUser.set(response.user);
    this._isAuthenticated.set(true);
  }
}