import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { GlobalRole } from '../../core/models/user.model';

export interface RoleDialogData {
  currentRole: GlobalRole;
}

@Component({
  selector: 'app-user-role-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './user-role-dialog.component.html',
})
export class UserRoleDialogComponent {
  private readonly fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<UserRoleDialogComponent>);

  readonly roles: { value: GlobalRole; label: string }[] = [
    { value: 'ADMIN', label: 'Admin' },
    { value: 'USER', label: 'Usuário' },
  ];

  form = this.fb.group({
    role: ['' as GlobalRole, Validators.required],
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: RoleDialogData) {
    this.form.patchValue({ role: data.currentRole });
  }

  get role() { return this.form.get('role')!; }

  onConfirm(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.dialogRef.close(this.form.value.role as GlobalRole);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
