export interface Item {
  id: string;
  userId: string;
  name: string;
  category: string;
  categoryId: string;
  quantity: number;
  purchaseDate: Date;
  totalValue: number;
  price: number;
  unit: string;
  location: string;
  storageLocationId: string;
  expiryDate?: Date;
  barcode?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ダッシュボード用の集計データ型
export interface InventorySummary {
  totalItems: number;
  totalCategories: number;
  totalValue: number;
  lowStockItems: number;
  expiringItems: number;
}

// 注意アラート用のデータ型
export interface AlertItem {
  id: string;
  name: string;
  alertType: 'low-stock' | 'expiring';
  quantity?: number;
  expiryDate?: Date;
  daysRemaining?: number;
}
