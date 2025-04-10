import * as env from "../../environments/environment";
import { http, HttpResponse } from 'msw';

const apiUrl = env.environment.apiUrl;

export const itemHandlers = [
  http.get(`${apiUrl}/analytics/inventory`, () => {
    return HttpResponse.json({
      totalItems: 42,
      totalCategories: 8,
      totalValue: 125000,
      lowStockItems: 5,
      expiringItems: 3
    });
  }),

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

  http.get(`${apiUrl}/items`, () => {
    const today = new Date();
    return HttpResponse.json([
      {
        id: '1',
        name: 'トイレットペーパー',
        category: '日用品',
        quantity: 1,
        price: 500,
        totalValue: 500,
        unit: '個',
        location: '棚A-1',
        purchaseDate: new Date(today.setDate(today.getDate() - 30)),
        updatedAt: new Date(today.setDate(today.getDate() - 5))
      },
      {
        id: '2',
        name: '牛乳',
        category: '食品',
        quantity: 3,
        price: 200,
        totalValue: 600,
        unit: 'L',
        expiryDate: new Date(today.setDate(today.getDate() + 2)),
        location: '冷蔵庫',
        purchaseDate: new Date(today.setDate(today.getDate() - 2)),
        updatedAt: new Date(today.setDate(today.getDate() - 1))
      },
      {
        id: '3',
        name: 'ヨーグルト',
        category: '食品',
        quantity: 4,
        price: 150,
        totalValue: 600,
        unit: 'パック',
        expiryDate: new Date(today.setDate(today.getDate() + 1)),
        location: '冷蔵庫',
        purchaseDate: new Date(today.setDate(today.getDate() - 1)),
        updatedAt: today
      },
      {
        id: '4',
        name: '洗濯洗剤',
        category: '日用品',
        quantity: 2,
        price: 800,
        totalValue: 1600,
        unit: '本',
        location: '棚B-2',
        purchaseDate: new Date(today.setDate(today.getDate() - 15)),
        updatedAt: new Date(today.setDate(today.getDate() - 10))
      },
      {
        id: '5',
        name: 'お米',
        category: '食品',
        quantity: 10,
        price: 500,
        totalValue: 5000,
        unit: 'kg',
        expiryDate: new Date(today.setFullYear(today.getFullYear() + 1)),
        location: '棚C-1',
        purchaseDate: new Date(today.setDate(today.getDate() - 60)),
        updatedAt: new Date(today.setDate(today.getDate() - 15))
      },
      {
        id: '6',
        name: 'シャンプー',
        category: '日用品',
        quantity: 1,
        price: 600,
        totalValue: 600,
        unit: '本',
        location: '浴室',
        purchaseDate: new Date(today.setDate(today.getDate() - 20)),
        updatedAt: new Date(today.setDate(today.getDate() - 20))
      },
      {
        id: '7',
        name: '歯磨き粉',
        category: '日用品',
        quantity: 2,
        price: 300,
        totalValue: 600,
        unit: '本',
        location: '洗面所',
        purchaseDate: new Date(today.setDate(today.getDate() - 10)),
        updatedAt: new Date(today.setDate(today.getDate() - 7))
      }
    ]);
  })
];
