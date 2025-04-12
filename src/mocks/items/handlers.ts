import * as env from "../../environments/environment";
import { http, HttpResponse } from 'msw';

const apiUrl = env.environment.apiUrl;

// 在庫データのモック
let inventoryItems = [
  {
    id: '1',
    name: 'トイレットペーパー',
    category: '日用品',
    quantity: 1,
    price: 500,
    totalValue: 500,
    unit: '個',
    company: '',
    location: '棚A-1',
    purchaseDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 5))
  },
  {
    id: '2',
    name: '牛乳',
    category: '食品',
    quantity: 3,
    price: 200,
    totalValue: 600,
    unit: 'L',
    company: 'C1',
    expiryDate: new Date(new Date().setDate(new Date().getDate() + 2)),
    location: '冷蔵庫',
    purchaseDate: new Date(new Date().setDate(new Date().getDate() - 2)),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 1))
  },
  {
    id: '3',
    name: 'ヨーグルト',
    category: '食品',
    quantity: 4,
    price: 150,
    totalValue: 600,
    unit: 'パック',
    company: 'C1',
    expiryDate: new Date(new Date().setDate(new Date().getDate() + 1)),
    location: '冷蔵庫',
    purchaseDate: new Date(new Date().setDate(new Date().getDate() - 1)),
    updatedAt: new Date()
  },
  {
    id: '4',
    name: '洗濯洗剤',
    category: '日用品',
    quantity: 2,
    price: 800,
    totalValue: 1600,
    unit: '本',
    company: 'C2',
    location: '棚B-2',
    purchaseDate: new Date(new Date().setDate(new Date().getDate() - 15)),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 10))
  },
  {
    id: '5',
    name: 'お米',
    category: '食品',
    quantity: 10,
    price: 500,
    totalValue: 5000,
    unit: 'kg',
    company: 'C3',
    expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    location: '棚C-1',
    purchaseDate: new Date(new Date().setDate(new Date().getDate() - 60)),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 15))
  },
  {
    id: '6',
    name: 'シャンプー',
    category: '日用品',
    quantity: 1,
    price: 600,
    totalValue: 600,
    unit: '本',
    company: 'C4',
    location: '浴室',
    purchaseDate: new Date(new Date().setDate(new Date().getDate() - 20)),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 20))
  },
  {
    id: '7',
    name: '歯磨き粉',
    category: '日用品',
    quantity: 2,
    price: 300,
    totalValue: 600,
    unit: '本',
    company: 'C5',
    location: '洗面所',
    purchaseDate: new Date(new Date().setDate(new Date().getDate() - 10)),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 7))
  }
];

export const itemHandlers = [
  // 在庫概要を取得
  http.get(`${apiUrl}/analytics/inventory`, () => {
    return HttpResponse.json({
      totalItems: 42,
      totalCategories: 8,
      totalValue: 125000,
      lowStockItems: 5,
      expiringItems: 3
    });
  }),

  // アラート情報を取得
  http.get(`${apiUrl}/analytics/alerts`, () => {
    const today = new Date();
    return HttpResponse.json([
      {
        id: '1',
        name: 'トイレットペーパー',
        alertType: 'low-stock',
        quantity: 1
      },
      {
        id: '2',
        name: '牛乳',
        alertType: 'expiring',
        expiryDate: new Date(today.setDate(today.getDate() + 2)),
        daysRemaining: 2
      },
      {
        id: '3',
        name: 'ヨーグルト',
        alertType: 'expiring',
        expiryDate: new Date(today.setDate(today.getDate() + 1)),
        daysRemaining: 1
      }
    ]);
  }),

  // すべてのアイテムを取得
  http.get(`${apiUrl}/items`, () => {
    return HttpResponse.json(inventoryItems);
  }),
  
  // 新規アイテムを追加
  http.post(`${apiUrl}/items`, async ({ request }) => {
    const newItem = await request.json() as any;
    
    // IDが提供されていない場合は生成
    if (!newItem?.id) {
      newItem.id = Date.now().toString();
    }
    
    // 更新日時を設定
    newItem.updatedAt = new Date();
    
    // 合計価値を計算
    newItem.totalValue = newItem.price * newItem.quantity;
    
    // アイテムリストに追加
    inventoryItems.push(newItem);
    
    return HttpResponse.json(newItem, { status: 201 });
  }),
  
  // 既存アイテムを更新
  http.put(`${apiUrl}/items/:id`, async ({ request, params }) => {
    const { id } = params;
    const updatedItem = await request.json() as any;
    
    // 対象アイテムのインデックスを検索
    const index = inventoryItems.findIndex(item => item.id === id);
    
    if (index === -1) {
      // アイテムが見つからない場合は404エラー
      return new HttpResponse(null, { status: 404 });
    }
    
    // 更新日時を設定
    if (updatedItem) {
      updatedItem.updatedAt = new Date();
      
      // 合計価値を再計算
      updatedItem.totalValue = updatedItem.price * updatedItem.quantity;
    }
    
    // アイテムを更新
    inventoryItems[index] = { ...inventoryItems[index], ...updatedItem };
    
    return HttpResponse.json(inventoryItems[index]);
  })
];
