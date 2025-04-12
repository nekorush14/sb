import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Item } from '../models/item';

@Component({
  selector: 'app-inventory-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './inventory-edit.component.html',
  styleUrl: './inventory-edit.component.scss'
})
export class InventoryEditComponent implements OnInit {
  @Input() item: Item | null = null;
  @Input() isVisible = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Item>();

  itemForm!: FormGroup;
  isNewItem = true;
  dialogTitle = '新規アイテム追加';

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(): void {
    // アイテムが変更された場合にフォームを再初期化
    if (this.itemForm) {
      this.initForm();
    }
  }

  initForm(): void {
    this.isNewItem = !this.item;
    this.dialogTitle = this.isNewItem ? '新規アイテム追加' : 'アイテムの編集';

    // フォーム初期化
    this.itemForm = this.fb.group({
      name: [this.item?.name || '', [Validators.required]],
      quantity: [this.item?.quantity || 0, [Validators.required, Validators.min(0)]],
      unit: [this.item?.unit || '', [Validators.required]],
      category: [this.item?.category || '', [Validators.required]],
      company: [this.item?.company || ''],
      location: [this.item?.location || '', [Validators.required]],
      purchaseDate: [this.item?.purchaseDate ? this.formatDateForInput(new Date(this.item.purchaseDate)) : this.formatDateForInput(new Date()), [Validators.required]],
      price: [this.item?.price || 0, [Validators.required, Validators.min(0)]],
      expiryDate: [this.item?.expiryDate ? this.formatDateForInput(new Date(this.item.expiryDate)) : ''],
      imageUrl: [this.item?.imageUrl || '']
    });
  }

  // 日付をHTMLのdate inputに合わせたフォーマットに変換
  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onSubmit(): void {
    if (this.itemForm.invalid) {
      // フォームのすべてのコントロールをタッチしてバリデーションを表示
      Object.keys(this.itemForm.controls).forEach(key => {
        const control = this.itemForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    const formValue = this.itemForm.value;
    const savedItem: Item = {
      id: this.item?.id || Date.now().toString(), // 新規アイテムの場合は仮のIDを生成
      ...formValue,
      purchaseDate: new Date(formValue.purchaseDate),
      expiryDate: formValue.expiryDate ? new Date(formValue.expiryDate) : undefined
    };

    this.save.emit(savedItem);
    this.closeDialog();
  }

  closeDialog(): void {
    this.close.emit();
  }
}
