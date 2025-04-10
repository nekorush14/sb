import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItemService } from '../services/item.service';
import { Item, AlertItem, InventorySummary } from '../models/item';
import { MenuBarComponent } from '../../shared/menu-bar/menu-bar.component';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, MenuBarComponent],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss'
})
export class InventoryComponent implements OnInit {
  items = signal<Item[]>([]);
  alerts = signal<AlertItem[]>([]);
  summary = signal<InventorySummary | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  
  // 検索とソート用の変数を追加
  searchTerm = signal<string>('');
  sortColumn = signal<string>('name');
  sortDirection = signal<'asc' | 'desc'>('asc');
  
  // フィルタリングとソートを適用した表示用アイテムリスト
  filteredItems = computed(() => {
    let filtered = [...this.items()];
    
    // 検索フィルタリングを適用
    const term = this.searchTerm().toLowerCase().trim();
    if (term) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(term) || 
        item.category.toLowerCase().includes(term) || 
        item.location.toLowerCase().includes(term)
      );
    }
    
    // ソートを適用
    const column = this.sortColumn();
    const direction = this.sortDirection();
    
    filtered.sort((a, b) => {
      let valueA: any = a[column as keyof Item];
      let valueB: any = b[column as keyof Item];
      
      // 日付の場合は特別な処理
      if (column === 'purchaseDate' || column === 'expiryDate') {
        valueA = valueA ? new Date(valueA).getTime() : 0;
        valueB = valueB ? new Date(valueB).getTime() : 0;
      }
      
      // 文字列の場合は小文字変換して比較
      if (typeof valueA === 'string') {
        valueA = valueA.toLowerCase();
      }
      if (typeof valueB === 'string') {
        valueB = valueB.toLowerCase();
      }
      
      if (valueA < valueB) {
        return direction === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    return filtered;
  });

  constructor(private itemService: ItemService) {}

  ngOnInit(): void {
    this.loadInventoryData();
  }

  loadInventoryData(): void {
    // 在庫データを取得
    this.itemService.getAllItems().subscribe({
      next: (data) => {
        this.items.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('在庫データの取得に失敗しました。');
        this.loading.set(false);
        console.error('Error fetching inventory items:', err);
      }
    });

    // アラートデータを取得
    this.itemService.getAlerts().subscribe({
      next: (data) => this.alerts.set(data),
      error: (err) => console.error('Error fetching alerts:', err)
    });

    // 在庫概要データを取得
    this.itemService.getInventorySummary().subscribe({
      next: (data) => this.summary.set(data),
      error: (err) => console.error('Error fetching inventory summary:', err)
    });
  }

  // 期限切れか近い商品かをチェックする
  isExpiringSoon(expiryDate?: Date): boolean {
    if (!expiryDate) return false;
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= 7 && diffDays >= 0;
  }

  // 在庫数が少ない商品かをチェックする
  isLowStock(quantity: number): boolean {
    return quantity <= 2;
  }
}
