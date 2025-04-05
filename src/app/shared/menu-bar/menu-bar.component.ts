import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth/services/auth.service'; // AuthServiceをインポート

@Component({
  selector: 'app-menu-bar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './menu-bar.component.html',
  styleUrls: ['./menu-bar.component.scss']
})
export class MenuBarComponent implements OnInit {
  constructor(private authService: AuthService) {} // AuthServiceを注入

  ngOnInit(): void {

  }

  logout(): void {
    this.authService.logout(); // ログアウト処理を呼び出す
  }
}