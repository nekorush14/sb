import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type DialogType = 'default' | 'confirmation' | 'warning' | 'danger' | 'success';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-dialog.component.html',
  styleUrl: './app-dialog.component.scss'
})
export class AppDialogComponent {
  @Input() isVisible = false;
  @Input() title = 'ダイアログ';
  @Input() message = '';
  @Input() dialogType: DialogType = 'default';
  @Input() confirmText = '確認';
  @Input() cancelText = 'キャンセル';
  @Input() showCancelButton = true;
  @Input() showCloseButton = true;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
    this.close.emit();
  }

  onCancel(): void {
    this.cancel.emit();
    this.close.emit();
  }
}
