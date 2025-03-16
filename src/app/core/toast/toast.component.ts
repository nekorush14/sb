import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent {
  toastService = inject(ToastService);
  
  // 現在表示中のトースト一覧
  toasts = computed(() => this.toastService.activeToasts());
}
