import { Component, inject, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PromptService } from '../services/prompt.service';
import { NotificationService } from '../../core/services/notification.service';
import { PromptVersion, PromptVersionVisibility } from '../models/prompt.model';

export interface VersionDialogData {
  promptId: number;
  version: PromptVersion | null;
}

@Component({
  selector: 'app-prompt-version-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './prompt-version-form-dialog.component.html',
  styleUrls: ['./prompt-version-form-dialog.component.scss'],
})
export class PromptVersionFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly promptService = inject(PromptService);
  private readonly notification = inject(NotificationService);
  readonly dialogRef = inject(MatDialogRef<PromptVersionFormDialogComponent>);

  loading = signal(false);
  isEdit: boolean;

  readonly visibilities: { value: PromptVersionVisibility; label: string }[] = [
    { value: 'PUBLIC', label: 'Público' },
    { value: 'PRIVATE', label: 'Privado' },
    { value: 'TEAM', label: 'Time' },
  ];

  form = this.fb.group({
    version: ['', [Validators.required, Validators.maxLength(20)]],
    content: ['', [Validators.required, Validators.minLength(1)]],
    visibility: ['PRIVATE' as PromptVersionVisibility, Validators.required],
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: VersionDialogData) {
    this.isEdit = !!data.version;
    if (data.version) {
      this.form.patchValue({
        version: data.version.version,
        content: data.version.content,
        visibility: data.version.visibility,
      });
    }
  }

  get version() { return this.form.get('version')!; }
  get content() { return this.form.get('content')!; }
  get visibility() { return this.form.get('visibility')!; }

  onConfirm(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    const { version, content, visibility } = this.form.value;

    const request$ = this.isEdit
      ? this.promptService.updateVersion(this.data.version!.id, { version: version!, content: content!, visibility: visibility as PromptVersionVisibility })
      : this.promptService.createVersion({ promptId: this.data.promptId, version: version!, content: content!, visibility: visibility as PromptVersionVisibility });

    request$.subscribe({
      next: () => {
        this.notification.success(this.isEdit ? 'Versão atualizada!' : 'Versão criada!');
        this.dialogRef.close(true);
      },
      error: () => this.loading.set(false),
    });
  }

  onCancel(): void { this.dialogRef.close(false); }
}
