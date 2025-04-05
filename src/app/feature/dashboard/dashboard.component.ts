import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ItemService } from '../services/item.service';
import { AlertItem, InventorySummary } from '../models/item';
import { MenuBarComponent } from '../../shared/menu-bar/menu-bar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MenuBarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  inventorySummary: InventorySummary | null = null;
  alerts: AlertItem[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(private itemService: ItemService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.error = null;

    // 在庫概要を取得
    this.itemService.getInventorySummary().subscribe({
      next: (summary) => {
        this.inventorySummary = summary;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = '在庫概要の取得に失敗しました。再試行してください。';
        this.isLoading = false;
        console.error('在庫概要取得エラー:', err);
      }
    });

    // 注意アラートを取得
    this.itemService.getAlerts().subscribe({
      next: (alerts) => {
        this.alerts = alerts;
      },
      error: (err) => {
        this.error = 'アラートの取得に失敗しました。再試行してください。';
        console.error('アラート取得エラー:', err);
      }
    });
  }

  // アラートタイプに応じたラベルを返す
  getAlertTypeLabel(type: string): string {
    switch(type) {
      case 'low-stock':
        return '在庫わずか';
      case 'expiring':
        return '間もなく期限切れ';
      default:
        return '警告';
    }
  }

  // 残り日数に基づいた緊急度を返す
  getUrgencyClass(days?: number): string {
    if (days === undefined) return '';
    if (days <= 1) return 'urgent';
    if (days <= 3) return 'warning';
    return 'normal';
  }
}
