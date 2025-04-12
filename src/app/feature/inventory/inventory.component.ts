import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItemService } from '../services/item.service';
import { Item, AlertItem, InventorySummary } from '../models/item';
import { MenuBarComponent } from '../../shared/menu-bar/menu-bar.component';
import { InventoryEditComponent } from '../inventory-edit/inventory-edit.component';
import { ToastService } from '../../core/services/toast.service';
import { AppDialogComponent } from '../../shared/app-dialog/app-dialog.component';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, MenuBarComponent, InventoryEditComponent, AppDialogComponent],
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
  
  // ダイアログの表示制御用
  isDialogVisible = signal<boolean>(false);
  selectedItem = signal<Item | null>(null);
  
  // 削除確認ダイアログの表示制御用
  isDeleteDialogVisible = signal<boolean>(false);
  itemToDelete = signal<Item | null>(null);
  
  // フィルタリングとソートを適用した表示用アイテムリスト
  filteredItems = computed(() => {
    let filtered = [...this.items()];
    
    // 検索フィルタリングを適用
    const term = this.searchTerm().toLowerCase().trim();
    if (term) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(term) || 
        item.category.toLowerCase().includes(term) || 
        (item.company && item.company.toLowerCase().includes(term)) || 
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

  constructor(private itemService: ItemService, private toastService: ToastService) {}

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
        this.toastService.error('在庫データの取得に失敗しました。ネットワーク接続を確認してください。');
        console.error('Error fetching inventory items:', err);
      }
    });

    // アラートデータを取得
    this.itemService.getAlerts().subscribe({
      next: (data) => this.alerts.set(data),
      error: (err) => {
        console.error('Error fetching alerts:', err);
        this.toastService.error('アラート情報の取得に失敗しました。');
      }
    });

    // 在庫概要データを取得
    this.itemService.getInventorySummary().subscribe({
      next: (data) => this.summary.set(data),
      error: (err) => {
        console.error('Error fetching inventory summary:', err);
        this.toastService.error('在庫概要の取得に失敗しました。');
      }
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

  // 新規アイテム追加ダイアログを開く
  openAddItemDialog(): void {
    this.selectedItem.set(null); // 新規アイテムの場合はnullをセット
    this.isDialogVisible.set(true);
  }

  // アイテム編集ダイアログを開く
  openEditItemDialog(item: Item): void {
    this.selectedItem.set({...item}); // 編集する場合は選択したアイテムをセット
    this.isDialogVisible.set(true);
  }
  
  // 削除確認ダイアログを開く
  openDeleteItemDialog(item: Item): void {
    this.itemToDelete.set(item);
    this.isDeleteDialogVisible.set(true);
  }
  
  // 削除を実行する
  deleteItem(): void {
    const item = this.itemToDelete();
    if (item && item.id) {
      this.itemService.deleteItem(item.id).subscribe({
        next: () => {
          // 削除に成功したら、リストから該当アイテムを削除
          const updatedItems = this.items().filter(i => i.id !== item.id);
          this.items.set(updatedItems);
          this.toastService.success(`「${item.name}」を削除しました`);
          this.closeDeleteDialog();
        },
        error: (err) => {
          console.error('Error deleting item:', err);
          this.toastService.error(`「${item.name}」の削除に失敗しました。もう一度お試しください。`);
          this.closeDeleteDialog();
        }
      });
    }
  }

  // ダイアログを閉じる
  closeDialog(): void {
    this.isDialogVisible.set(false);
  }
  
  // 削除ダイアログを閉じる
  closeDeleteDialog(): void {
    this.isDeleteDialogVisible.set(false);
    this.itemToDelete.set(null);
  }

  // アイテムを保存する
  saveItem(item: Item): void {
    if (this.selectedItem()) {
      // 既存アイテムの編集の場合
      this.itemService.updateItem(item).subscribe({
        next: (updatedItem) => {
          // 成功した場合、アイテムリストを更新
          const updatedItems = this.items().map(i => i.id === updatedItem.id ? updatedItem : i);
          this.items.set(updatedItems);
          this.toastService.success(`「${updatedItem.name}」の更新が完了しました`);
        },
        error: (err) => {
          console.error('Error updating item:', err);
          this.toastService.error(`「${item.name}」の更新に失敗しました。もう一度お試しください。`);
        }
      });
    } else {
      // 新規アイテムの追加の場合
      this.itemService.addItem(item).subscribe({
        next: (newItem) => {
          // 成功した場合、アイテムリストに追加
          this.items.set([...this.items(), newItem]);
          this.toastService.success(`新しいアイテム「${newItem.name}」が追加されました`);
        },
        error: (err) => {
          console.error('Error adding item:', err);
          this.toastService.error('アイテムの追加に失敗しました。もう一度お試しください。');
        }
      });
    }
  }
}
