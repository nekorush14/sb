import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoadingService } from '../services/loading.service';
import { ToastService } from '../services/toast.service';
import { catchError, finalize, throwError } from 'rxjs';

/**
 * HTTPリクエストインターセプター
 * - リクエスト送信時にローディング状態を開始
 * - レスポンス受信時にローディング状態を終了
 * - エラーハンドリングとトースト通知の表示
 * - リクエストに追加情報の付与
 */
export const httpRequestInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  const toastService = inject(ToastService);
  
  // リクエスト送信前の処理
  loadingService.start();
  
  // 必要に応じてリクエストヘッダーをカスタマイズ
  const modifiedReq = req.clone({
    setHeaders: {
      'X-App-Version': '1.0.0',
      'Content-Type': 'application/json'
    }
  });

  // リクエスト送信とレスポンス処理
  return next(modifiedReq).pipe(
    // エラーハンドリング
    catchError((error: HttpErrorResponse) => {
      console.error('HTTP request failed:', error);
      
      // エラーメッセージを取得
      let errorMessage = 'サーバーとの通信に失敗しました。';
      
      // エラーステータスコードによって適切なメッセージを表示
      if (error.status === 0) {
        errorMessage = 'ネットワークエラー: サーバーに接続できませんでした。';
      } else if (error.status === 401) {
        errorMessage = '認証エラー: 再度ログインしてください。';
      } else if (error.status === 403) {
        errorMessage = 'アクセス権限がありません。';
      } else if (error.status === 404) {
        errorMessage = 'リクエストされたリソースが見つかりません。';
      } else if (error.status === 500) {
        errorMessage = 'サーバー内部エラーが発生しました。';
      }
      
      // サーバーからのエラーメッセージがある場合はそれを使用
      if (error.error?.message) {
        errorMessage = error.error.message;
      }
      
      // トースト通知を表示
      toastService.error(errorMessage);
      
      return throwError(() => error);
    }),
    // リクエスト完了時に必ず実行
    finalize(() => {
      // ローディング状態を終了
      loadingService.stop();
    })
  );
};
