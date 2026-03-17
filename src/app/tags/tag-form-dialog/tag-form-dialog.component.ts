import { Component, inject, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TagService } from '../services/tag.service';
import { NotificationService } from '../../core/services/notification.service';
import { Tag } from '../models/tag.model';

@Component({
  selector: 'app-tag-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './tag-form-dialog.component.html',
  styleUrls: ['./tag-form-dialog.component.scss'],
})
export class TagFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly tagService = inject(TagService);
  private readonly notification = inject(NotificationService);
  readonly dialogRef = inject(MatDialogRef<TagFormDialogComponent>);

  loading = signal(false);
  isEdit: boolean;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    slug: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(/^[a-z0-9-]+$/)]],
    description: ['', Validators.maxLength(255)],
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: Tag | null) {
    this.isEdit = !!data;
    if (data) {
      this.form.patchValue({ name: data.name, slug: data.slug, description: data.description ?? '' });
    }

    // Auto-gera slug a partir do nome (somente na criação)
    if (!this.isEdit) {
      this.form.get('name')!.valueChanges.subscribe(name => {
        if (!name) return;
        const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        this.form.get('slug')!.setValue(slug, { emitEvent: false });
      });
    }
  }

  get name() { return this.form.get('name')!; }
  get slug() { return this.form.get('slug')!; }
  get description() { return this.form.get('description')!; }

  onConfirm(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loading.set(true);
    const { name, slug, description } = this.form.value;
    const payload = { name: name!, slug: slug!, description: description || undefined };

    const request$ = this.isEdit
      ? this.tagService.update(this.data!.id, payload)
      : this.tagService.create(payload);

    request$.subscribe({
      next: () => {
        this.notification.success(this.isEdit ? 'Tag atualizada!' : 'Tag criada!');
        this.dialogRef.close(true);
      },
      error: () => this.loading.set(false),
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
