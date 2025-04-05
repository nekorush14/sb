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
    return HttpResponse.json([]);
  })
];
