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

  /**
   * 在庫の概要を取得
   * 
   * @returns 在庫の概要
   */
  getInventorySummary(): Observable<InventorySummary> {
    return this.http.get<InventorySummary>(`${this.apiUrl}/analytics/inventory`);
  }

  /**
   * 注意アラート（在庫切れ、消費期限）を取得
   * 
   * @returns 注意アラートのリスト
   */
  getAlerts(): Observable<AlertItem[]> {
    return this.http.get<AlertItem[]>(`${this.apiUrl}/analytics/alerts`);
  }

  /**
   * すべてのアイテムを取得
   * 
   * @returns すべてのアイテムのリスト
   */
  getAllItems(): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.apiUrl}/items`);
  }
  
  /**
   * 新しいアイテムを追加
   * 
   * @param item - 追加するアイテム
   * @returns - 追加されたアイテム
   */
  addItem(item: Item): Observable<Item> {
    return this.http.post<Item>(`${this.apiUrl}/items`, item);
  }
  
  /**
   * 既存アイテムを更新
   * 
   * @param item - 更新するアイテム
   * @returns - 更新されたアイテム
   */
  updateItem(item: Item): Observable<Item> {
    return this.http.put<Item>(`${this.apiUrl}/items/${item.id}`, item);
  }

  /**
   * アイテムを削除
   * 
   * @param id - 削除するアイテムのID
   * @returns - 削除されたアイテム
   */
  deleteItem(id: string): Observable<Item> {
    return this.http.delete<Item>(`${this.apiUrl}/items/${id}`);
  }
}
