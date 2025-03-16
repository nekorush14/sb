import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
  timeout: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private nextId = 0;
  private toasts = signal<Toast[]>([]);
  
  // 公開用のシグナル
  readonly activeToasts = this.toasts.asReadonly();
  
  /**
   * 成功メッセージのトースト通知を表示
   */
  success(message: string, timeout = 5000): void {
    this.show(message, 'success', timeout);
  }
  
  /**
   * エラーメッセージのトースト通知を表示
   */
  error(message: string, timeout = 7000): void {
    this.show(message, 'error', timeout);
  }
  
  /**
   * 情報メッセージのトースト通知を表示
   */
  info(message: string, timeout = 5000): void {
    this.show(message, 'info', timeout);
  }
  
  /**
   * 警告メッセージのトースト通知を表示
   */
  warning(message: string, timeout = 6000): void {
    this.show(message, 'warning', timeout);
  }
  
  /**
   * トースト通知を削除
   */
  remove(id: number): void {
    this.toasts.update(toasts => toasts.filter(toast => toast.id !== id));
  }
  
  /**
   * トースト通知を表示
   */
  private show(message: string, type: ToastType, timeout: number): void {
    const id = this.nextId++;
    
    // トーストを追加
    this.toasts.update(toasts => [
      ...toasts, 
      { id, message, type, timeout }
    ]);
    
    // タイムアウト後に自動的に削除
    setTimeout(() => {
      this.remove(id);
    }, timeout);
  }
}
