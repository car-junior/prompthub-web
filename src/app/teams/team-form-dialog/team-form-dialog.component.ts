import { Component, inject, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TeamService } from '../services/team.service';
import { NotificationService } from '../../core/services/notification.service';
import { Team } from '../models/team.model';

@Component({
  selector: 'app-team-form-dialog',
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
  templateUrl: './team-form-dialog.component.html',
  styleUrls: ['./team-form-dialog.component.scss'],
})
export class TeamFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly teamService = inject(TeamService);
  private readonly notification = inject(NotificationService);
  readonly dialogRef = inject(MatDialogRef<TeamFormDialogComponent>);

  loading = signal(false);
  isEdit: boolean;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    description: ['', Validators.maxLength(500)],
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: Team | null) {
    this.isEdit = !!data;
    if (data) {
      this.form.patchValue({ name: data.name, description: data.description ?? '' });
    }
  }

  get name() { return this.form.get('name')!; }
  get description() { return this.form.get('description')!; }

  onConfirm(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loading.set(true);
    const { name, description } = this.form.value;
    const payload = { name: name!, description: description || undefined };

    const request$ = this.isEdit
      ? this.teamService.update(this.data!.id, payload)
      : this.teamService.create(payload);

    request$.subscribe({
      next: () => {
        this.notification.success(this.isEdit ? 'Time atualizado!' : 'Time criado!');
        this.dialogRef.close(true);
      },
      error: () => this.loading.set(false),
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
