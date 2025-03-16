import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  
  loading$: Observable<boolean> = this.loadingSubject.asObservable();

  constructor() { }

  /**
   * ローディング状態を開始する
   */
  start(): void {
    this.loadingSubject.next(true);
  }

  /**
   * ローディング状態を終了する
   */
  stop(): void {
    this.loadingSubject.next(false);
  }
}
