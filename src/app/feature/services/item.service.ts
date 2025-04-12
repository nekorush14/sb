import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AlertItem, InventorySummary, Item } from '../models/item';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  // 在庫概要を取得
  getInventorySummary(): Observable<InventorySummary> {
    return this.http.get<InventorySummary>(`${this.apiUrl}/analytics/inventory`);
  }

  // 注意アラート（在庫切れ、消費期限）を取得
  getAlerts(): Observable<AlertItem[]> {
    return this.http.get<AlertItem[]>(`${this.apiUrl}/analytics/alerts`);
  }

  // すべてのアイテムを取得
  getAllItems(): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.apiUrl}/items`);
  }
  
  // 新しいアイテムを追加
  addItem(item: Item): Observable<Item> {
    return this.http.post<Item>(`${this.apiUrl}/items`, item);
  }
  
  // 既存アイテムを更新
  updateItem(item: Item): Observable<Item> {
    return this.http.put<Item>(`${this.apiUrl}/items/${item.id}`, item);
  }
}
